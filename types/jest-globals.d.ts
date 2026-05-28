declare const describe: (
  name: string,
  fn: () => void,
) => void;

declare const it: (
  name: string,
  fn: () => void | Promise<void>,
) => void;

declare const test: typeof it;

declare const beforeAll: (fn: () => void | Promise<void>) => void;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const afterAll: (fn: () => void | Promise<void>) => void;
declare const afterEach: (fn: () => void | Promise<void>) => void;

declare const expect: any;
declare const jest: any;
