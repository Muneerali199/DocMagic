#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const sourceExtensions = new Set([".ts", ".tsx"]);
const ignoredSegments = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
]);

/**
 * Runs a Git command and returns trimmed stdout.
 *
 * @param {string[]} args - Git CLI arguments to execute.
 * @returns {string} Trimmed command output.
 */
function runGit(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

/**
 * Resolves the best comparison base for changed-file type-checking.
 *
 * @returns {string} Git revision to diff against.
 */
function getMergeBase() {
  const candidates = [
    ["merge-base", "HEAD", "@{upstream}"],
    ["merge-base", "HEAD", "origin/main"],
    ["rev-parse", "HEAD~1"],
  ];

  for (const args of candidates) {
    try {
      const value = runGit(args);
      if (value) return value;
    } catch {
      // Try the next known base.
    }
  }

  return "HEAD";
}

/**
 * Checks whether a changed path is a type-checkable TypeScript source file.
 *
 * @param {string} file - Repository-relative file path.
 * @returns {boolean} True when the path should be included in changed-file tsc.
 */
function isTypeScriptSource(file) {
  if (!sourceExtensions.has(file.slice(file.lastIndexOf(".")))) return false;
  if (file.endsWith(".d.ts")) return false;

  const parts = file.split("/");
  return !parts.some((part) => ignoredSegments.has(part));
}

/**
 * @param {string} filePath
 * @returns {string}
 */
function normalizePath(filePath) {
  return resolve(filePath).replace(/\\/g, "/");
}

const base = getMergeBase();
const diff = runGit([
  "diff",
  "--name-only",
  "--diff-filter=ACMRT",
  `${base}...HEAD`,
]);
const changedSources = diff
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean)
  .filter(isTypeScriptSource)
  .filter((file) => existsSync(resolve(file)));

if (changedSources.length === 0) {
  process.stdout.write("No changed TypeScript source files to type-check.\n");
  process.exit(0);
}

const projectRoot = process.cwd();
const changedAbsolute = new Set(
  changedSources.map((file) => normalizePath(resolve(projectRoot, file))),
);
const tmpDir = resolve(projectRoot, ".tmp-typecheck");
const tmpConfig = resolve(tmpDir, "tsconfig.json");

mkdirSync(tmpDir, { recursive: true });

writeFileSync(
  tmpConfig,
  JSON.stringify(
    {
      extends: "../tsconfig.json",
      include: changedSources.map((file) =>
        relative(projectRoot, resolve(file)).replace(/\\/g, "/"),
      ),
    },
    null,
    2,
  ),
);

try {
  const result = spawnSync(
    "npx",
    ["tsc", "-p", tmpConfig, "--pretty", "false"],
    {
      encoding: "utf8",
      shell: process.platform === "win32",
    },
  );

  const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  const errorLines = output
    .split("\n")
    .filter((line) => line.includes("error TS"));

  const relevantErrors = errorLines.filter((line) => {
    const match = line.match(/^(.+?)\(\d+,\d+\): error TS/);
    if (!match) return false;
    return changedAbsolute.has(normalizePath(match[1]));
  });

  if (relevantErrors.length > 0) {
    process.stderr.write(`${relevantErrors.join("\n")}\n`);
    process.exit(1);
  }

  if (errorLines.length > 0) {
    process.stdout.write(
      `Skipped ${errorLines.length - relevantErrors.length} type error(s) in unchanged files.\n`,
    );
  }

  process.exit(0);
} finally {
  rmSync(tmpDir, { force: true, recursive: true });
}
