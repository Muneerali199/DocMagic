import { describe, it, expect } from '@jest/globals';
import { isPrivateUrl, validateFetchUrl } from '../validate-fetch-url';

describe('isPrivateUrl', () => {
  // These should be BLOCKED (return true)
  it('blocks localhost',            () => expect(isPrivateUrl('http://localhost/api')).toBe(true));
  it('blocks 127.0.0.1',           () => expect(isPrivateUrl('http://127.0.0.1')).toBe(true));
  it('blocks 10.x.x.x',           () => expect(isPrivateUrl('http://10.0.0.1')).toBe(true));
  it('blocks 192.168.x.x',         () => expect(isPrivateUrl('http://192.168.1.1')).toBe(true));
  it('blocks 172.16.x.x',          () => expect(isPrivateUrl('http://172.16.0.1')).toBe(true));
  it('blocks AWS metadata IP',      () => expect(isPrivateUrl('http://169.254.169.254')).toBe(true));
  it('blocks GCP metadata hostname',() => expect(isPrivateUrl('http://metadata.google.internal')).toBe(true));
  it('blocks IPv6 loopback',        () => expect(isPrivateUrl('http://[::1]')).toBe(true));
  it('blocks file:// protocol',     () => expect(isPrivateUrl('file:///etc/passwd')).toBe(true));
  it('blocks ftp:// protocol',      () => expect(isPrivateUrl('ftp://example.com')).toBe(true));
  it('blocks invalid URLs',         () => expect(isPrivateUrl('not-a-url')).toBe(true));

  // These should be ALLOWED (return false)
  it('allows public HTTPS',         () => expect(isPrivateUrl('https://example.com')).toBe(false));
  it('allows public HTTP',          () => expect(isPrivateUrl('http://example.com')).toBe(false));
  it('allows Unsplash URLs',        () => expect(isPrivateUrl('https://images.unsplash.com/photo-123')).toBe(false));
});

describe('validateFetchUrl', () => {
  it('returns null for valid public URL',  () => expect(validateFetchUrl('https://example.com')).toBeNull());
  it('errors on non-string input',         () => expect(validateFetchUrl(123)).toBeTruthy());
  it('errors on URL over 2048 chars',      () => expect(validateFetchUrl('https://example.com/' + 'a'.repeat(2048))).toBeTruthy());
  it('errors on ftp:// URL',              () => expect(validateFetchUrl('ftp://example.com')).toBeTruthy());
  it('errors on private IP',              () => expect(validateFetchUrl('http://192.168.1.1')).toBeTruthy());
  it('errors on localhost',               () => expect(validateFetchUrl('http://localhost')).toBeTruthy());
  it('errors on AWS metadata',            () => expect(validateFetchUrl('http://169.254.169.254/latest')).toBeTruthy());
});