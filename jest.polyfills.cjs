const { TextDecoder, TextEncoder } = require('node:util');
const { webcrypto } = require('node:crypto');

if (!globalThis.TextEncoder) globalThis.TextEncoder = TextEncoder;
if (!globalThis.TextDecoder) globalThis.TextDecoder = TextDecoder;
if (!globalThis.crypto) globalThis.crypto = webcrypto;

const undici = require('undici');

if (!globalThis.fetch) globalThis.fetch = undici.fetch;
if (!globalThis.Headers) globalThis.Headers = undici.Headers;
if (!globalThis.Request) globalThis.Request = undici.Request;
if (!globalThis.Response) globalThis.Response = undici.Response;
if (!globalThis.FormData) globalThis.FormData = undici.FormData;
if (!globalThis.File) globalThis.File = undici.File;
