import * as B from "@babel/core";
import plugin from "./index";

it("common case", async () => {
  const result = await assert(`
  import { mock } from '@userlike/joke';

  const { foo, foo2 } = mock(import('foo'));
  const { bar, bar2 } = mock(import('bar'));

  foo.mockReturnValue(5);
  foo2.mockReturnValue(5);
  bar.mockReturnValue(5);
  bar2.mockReturnValue(5);

  [foo, foo2, bar, bar2].forEach(console.log);
  `);

  expect(result).toMatchInlineSnapshot(`
    "import * as _bar from \\"bar\\";
    import * as _foo from \\"foo\\";
    import { mock } from '@userlike/joke';
    jest.mock(\\"bar\\");
    jest.mock(\\"foo\\");
    const {
      foo,
      foo2
    } = _foo;
    const {
      bar,
      bar2
    } = _bar;
    foo.mockReturnValue(5);
    foo2.mockReturnValue(5);
    bar.mockReturnValue(5);
    bar2.mockReturnValue(5);
    [foo, foo2, bar, bar2].forEach(console.log);"
  `);
});

it("handles mock import as a namespace", async () => {
  const result = await assert(`
  import * as M from '@userlike/joke';
  const { foo } = M.mock(import('foobar'));
  `);
  expect(result).toMatchInlineSnapshot(`
    "import * as _foobar from \\"foobar\\";
    import * as M from '@userlike/joke';
    jest.mock(\\"foobar\\");
    const {
      foo
    } = _foobar;"
  `);
});

it("handles assigning return value to a namespace variable", async () => {
  const result = await assert(`
  import { mock } from '@userlike/joke';
  const F = mock(import('foobar'));
  F.foo.mockReturnValue(5);
  `);
  expect(result).toMatchInlineSnapshot(`
    "import * as _foobar from \\"foobar\\";
    import { mock } from '@userlike/joke';
    jest.mock(\\"foobar\\");
    const F = _foobar;
    F.foo.mockReturnValue(5);"
  `);
});

it("handles member expressions", async () => {
  const result = await assert(`
  import { mock } from '@userlike/joke';
  const bar = mock(import('foobar')).foo.bar;
  bar.mockReturnValue(5);
  `);
  expect(result).toMatchInlineSnapshot(`
    "import * as _foobar from \\"foobar\\";
    import { mock } from '@userlike/joke';
    jest.mock(\\"foobar\\");
    const bar = _foobar.foo.bar;
    bar.mockReturnValue(5);"
  `);
});

it("handles just a call expression", async () => {
  const result = await assert(`
  import { mock } from '@userlike/joke';
  mock(import('foobar'));
  `);
  expect(result).toMatchInlineSnapshot(`
    "import * as _foobar from \\"foobar\\";
    import { mock } from '@userlike/joke';
    jest.mock(\\"foobar\\");
    _foobar;"
  `);
});

it("throws error if mock is called inside closures", async () => {
  const result = assert(`
    import { mock } from '@userlike/joke';
    beforeEach(() => {
      const { foo } = mock(import('foo'));
    });
    `);
  expect(result).rejects.toMatchInlineSnapshot(
    `[Error: /example.ts: Can only use \`mock\` at the top-level scope.]`
  );
});

it("works with rest params", async () => {
  const promise = assert(`
    import { mock } from '@userlike/joke';
    const { foo, ...bar } = mock(import('foobar'));
    `);

  expect(promise).resolves.toMatchInlineSnapshot(`
"import * as _foobar from \\"foobar\\";
import { mock } from '@userlike/joke';
jest.mock(\\"foobar\\");
const {
  foo,
  ...bar
} = _foobar;"
`);
});

it("allows custom module implementation to be passed", async () => {
  const promise = assert(`
    import { mock } from '@userlike/joke';
    const { foo } = mock(import('foobar'), () => ({
      foo: 5
    }));
    `);

  expect(promise).resolves.toMatchInlineSnapshot(`
"import * as _foobar from \\"foobar\\";
import { mock } from '@userlike/joke';
jest.mock(\\"foobar\\", () => Object.assign({}, jest.requireMock(foobar), (() => ({
  foo: 5
}))()));
const {
  foo
} = _foobar;"
`);
});

it("throws a sensible error on invalid usage", async () => {
  const promise = assert(`
    import { mock } from '@userlike/joke';
    mock('foo');
    `);

  expect(promise).rejects.toMatchInlineSnapshot(`
[Error: /example.ts: 
\`mock\` must be used like:

mock(import('moduleName'))

Instead saw:

mock('foo')

]
`);
});

async function assert(code: string): Promise<string | undefined> {
  const result = await B.transformAsync(code, {
    filename: "example.ts",
    plugins: [plugin],
    babelrc: false,
    configFile: false,
    cwd: "/"
  });
  return result?.code;
}
