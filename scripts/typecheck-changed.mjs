#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";

const sourceExtensions = new Set([".ts", ".tsx"]);
const ignoredSegments = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  "coverage",
]);

function runGit(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
}

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

function isTypeScriptSource(file) {
  if (!sourceExtensions.has(file.slice(file.lastIndexOf(".")))) return false;
  if (file.endsWith(".d.ts")) return false;

  const parts = file.split("/");
  return !parts.some((part) => ignoredSegments.has(part));
}

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

const baseTsconfig = JSON.parse(
  readFileSync(resolve(projectRoot, "tsconfig.json"), "utf8"),
);

writeFileSync(
  tmpConfig,
  JSON.stringify(
    {
      compilerOptions: {
        ...baseTsconfig.compilerOptions,
        baseUrl: projectRoot,
        typeRoots: (
          baseTsconfig.compilerOptions?.typeRoots ?? ["./node_modules/@types"]
        ).map((root) => resolve(projectRoot, root.replace(/^\.\//, ""))),
        noEmit: true,
      },
      files: changedSources.map((file) => resolve(projectRoot, file)),
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
