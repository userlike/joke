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
  const promise = assert(`
    import { mock } from '@userlike/joke';
    beforeEach(() => {
      const { foo } = mock(import('foo'));
    });
    `);
  await expect(promise).rejects.toMatchInlineSnapshot(
    `[Error: /example.ts: Can only use \`mock\` at the top-level scope.]`
  );
});

it("works with rest params", async () => {
  const result = await assert(`
    import { mock } from '@userlike/joke';
    const { foo, ...bar } = mock(import('foobar'));
    `);

  expect(result).toMatchInlineSnapshot(`
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
  const result = await assert(`
    import { mock } from '@userlike/joke';
    const { foo } = mock(import('foobar'), () => ({
      foo: 5
    }));
    `);

  expect(result).toMatchInlineSnapshot(`
    "import * as _foobar from \\"foobar\\";
    import { mock } from '@userlike/joke';
    jest.mock(\\"foobar\\", () => global.Object.assign({}, jest.genMockFromModule(\\"foobar\\"), (() => ({
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

  await expect(promise).rejects.toMatchInlineSnapshot(`
          [Error: /example.ts: 
          \`mock\` must be used like:

          mock(import('moduleName'))

          Instead saw:

          mock('foo')

          ]
        `);
});

describe("mockSome", () => {
  it("extends requireActual'ed original impl with provided mock", async () => {
    const result = await assert(`
    import { mockSome } from '@userlike/joke';
    const { bar } = mockSome(import('foo'), () => ({
      bar: jest.fn()
    }));
    `);

    expect(result).toMatchInlineSnapshot(`
      "import * as _foo from \\"foo\\";
      import { mockSome } from '@userlike/joke';
      jest.mock(\\"foo\\", () => global.Object.assign({}, jest.requireActual(\\"foo\\"), (() => ({
        bar: jest.fn()
      }))()));
      const {
        bar
      } = _foo;"
    `);
  });
});

describe("mockAll", () => {
  it("uses plain jest.mock with no extends", async () => {
    const result = await assert(`
    import { mockAll } from '@userlike/joke';
    const { bar } = mockAll(import('foo'), () => ({
      bar: jest.fn()
    }));
    `);

    expect(result).toMatchInlineSnapshot(`
      "import * as _foo from \\"foo\\";
      import { mockAll } from '@userlike/joke';
      jest.mock(\\"foo\\", () => ({
        bar: jest.fn()
      }));
      const {
        bar
      } = _foo;"
    `);
  });
});

async function assert(code: string): Promise<string | null | undefined> {
  const result = await B.transformAsync(code, {
    filename: "example.ts",
    plugins: [plugin],
    babelrc: false,
    configFile: false,
    cwd: "/",
  });
  return result?.code;
}
