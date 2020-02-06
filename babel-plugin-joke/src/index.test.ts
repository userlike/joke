import * as B from "@babel/core";
import plugin from "./index";

var example = `
import { mock } from '@userlike/joke';

const { foo, foo2 } = mock(import('foo'));
const { bar, bar2 } = mock(import('bar'));

foo.mockReturnValue(5);
foo2.mockReturnValue(5);
bar.mockReturnValue(5);
bar2.mockReturnValue(5);

[foo, foo2, bar, bar2].forEach(console.log);
`;

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
    "import { bar2 as _bar2 } from \\"bar\\";
    import { bar as _bar } from \\"bar\\";
    import { foo2 as _foo2 } from \\"foo\\";
    import { foo as _foo } from \\"foo\\";
    import { mock } from '@userlike/joke';
    jest.mock(\\"bar\\");
    jest.mock(\\"foo\\");

    _foo.mockReturnValue(5);

    _foo2.mockReturnValue(5);

    _bar.mockReturnValue(5);

    _bar2.mockReturnValue(5);

    [_foo, _foo2, _bar, _bar2].forEach(console.log);"
  `);
});

it("ignores mock import as a namespace", async () => {
  const result = await assert(`
  import * as M from '@userlike/joke';
  M.mock(import('foobar'));
  `);
  expect(result).toMatchInlineSnapshot(`
"import * as M from '@userlike/joke';
M.mock(import('foobar'));"
`);
});

it("ignores mock calls inside closures", async () => {
  const result = await assert(`
    import { mock } from '@userlike/joke';
    beforeEach(() => {
      const { foo } = mock(import('foo'));
    });
    `);
  expect(result).toMatchInlineSnapshot(`
"import { foo as _foo } from \\"foo\\";
import { mock } from '@userlike/joke';
jest.mock(\\"foo\\");
beforeEach(() => {});"
`);
});

async function assert(code: string) {
  const result = await B.transformAsync(code, {
    filename: "example.ts",
    plugins: [plugin],
    babelrc: false,
    configFile: false
  });
  return result?.code;
}
