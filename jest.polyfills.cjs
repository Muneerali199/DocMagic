// --- LOAD TEST DATABASE ENVIRONMENT VARIABLES ---
const dotenv = require('dotenv');
const path = require('path');

// Load from .env.local or fallback to .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Hijack the normal Supabase clients during testing if test keys are present
if (
  process.env.SUPABASE_TEST_URL &&
  process.env.SUPABASE_TEST_ANON_KEY &&
  process.env.SUPABASE_TEST_SERVICE_KEY
) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_TEST_URL;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_TEST_SERVICE_KEY;
}
// ------------------------------------------------

const { TextDecoder, TextEncoder } = require('node:util');
const { webcrypto } = require('node:crypto');
const {
  ReadableStream,
  TransformStream,
  WritableStream,
} = require('node:stream/web');

if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder;
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder;
if (!globalThis.crypto) globalThis.crypto = webcrypto;
if (!globalThis.ReadableStream) globalThis.ReadableStream = ReadableStream;
if (!globalThis.TransformStream) globalThis.TransformStream = TransformStream;
if (!globalThis.WritableStream) globalThis.WritableStream = WritableStream;

const undici = require('undici');

if (!globalThis.fetch) globalThis.fetch = undici.fetch;
if (!globalThis.Headers) globalThis.Headers = undici.Headers;
if (!globalThis.Request) globalThis.Request = undici.Request;
if (!globalThis.Response) globalThis.Response = undici.Response;
if (!globalThis.FormData) globalThis.FormData = undici.FormData;
if (!globalThis.File) globalThis.File = undici.File;