import * as B from "@babel/core";
import plugin from "./index";
import { it, expect, describe } from "@jest/globals";

it("common case", async () => {
  const { esm, cjs } = await assert(`
  import { mock } from '@userlike/joke';

  const { foo, foo2 } = mock(import('foo'));
  const { bar, bar2 } = mock(import('bar'));

  foo.mockReturnValue(5);
  foo2.mockReturnValue(5);
  bar.mockReturnValue(5);
  bar2.mockReturnValue(5);

  [foo, foo2, bar, bar2].forEach(console.log);
  `);

  expect(esm).toMatchInlineSnapshot(`
    "import * as _bar from "bar";
    import * as _foo from "foo";
    import { jest } from "@jest/globals";
    import { mock } from '@userlike/joke';
    jest.mock("bar");
    jest.mock("foo");
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

  expect(cjs).toMatchInlineSnapshot(`
    ""use strict";

    var _bar = _interopRequireWildcard(require("bar"));
    var _foo = _interopRequireWildcard(require("foo"));
    var _globals = require("@jest/globals");
    var _joke = require("@userlike/joke");
    function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
    _globals.jest.mock("bar");
    _globals.jest.mock("foo");
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
  const { esm, cjs } = await assert(`
  import * as M from '@userlike/joke';
  const { foo } = M.mock(import('foobar'));
  `);

  expect(esm).toMatchInlineSnapshot(`
    "import * as _foobar from "foobar";
    import { jest } from "@jest/globals";
    import * as M from '@userlike/joke';
    jest.mock("foobar");
    const {
      foo
    } = _foobar;"
  `);

  expect(cjs).toMatchInlineSnapshot(`
    ""use strict";

    var _foobar = _interopRequireWildcard(require("foobar"));
    var _globals = require("@jest/globals");
    var M = _interopRequireWildcard(require("@userlike/joke"));
    function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
    _globals.jest.mock("foobar");
    const {
      foo
    } = _foobar;"
  `);
});

it("handles assigning return value to a namespace variable", async () => {
  const { esm, cjs } = await assert(`
  import { mock } from '@userlike/joke';
  const F = mock(import('foobar'));
  F.foo.mockReturnValue(5);
  `);

  expect(esm).toMatchInlineSnapshot(`
    "import * as _foobar from "foobar";
    import { jest } from "@jest/globals";
    import { mock } from '@userlike/joke';
    jest.mock("foobar");
    const F = _foobar;
    F.foo.mockReturnValue(5);"
  `);

  expect(cjs).toMatchInlineSnapshot(`
    ""use strict";

    var _foobar = _interopRequireWildcard(require("foobar"));
    var _globals = require("@jest/globals");
    var _joke = require("@userlike/joke");
    function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
    _globals.jest.mock("foobar");
    const F = _foobar;
    F.foo.mockReturnValue(5);"
  `);
});

it("handles member expressions", async () => {
  const { esm, cjs } = await assert(`
  import { mock } from '@userlike/joke';
  const bar = mock(import('foobar')).foo.bar;
  bar.mockReturnValue(5);
  `);

  expect(esm).toMatchInlineSnapshot(`
    "import * as _foobar from "foobar";
    import { jest } from "@jest/globals";
    import { mock } from '@userlike/joke';
    jest.mock("foobar");
    const bar = _foobar.foo.bar;
    bar.mockReturnValue(5);"
  `);

  expect(cjs).toMatchInlineSnapshot(`
    ""use strict";

    var _foobar = _interopRequireWildcard(require("foobar"));
    var _globals = require("@jest/globals");
    var _joke = require("@userlike/joke");
    function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
    _globals.jest.mock("foobar");
    const bar = _foobar.foo.bar;
    bar.mockReturnValue(5);"
  `);
});

it("handles just a call expression", async () => {
  const { esm, cjs } = await assert(`
  import { mock } from '@userlike/joke';
  mock(import('foobar'));
  `);

  expect(esm).toMatchInlineSnapshot(`
    "import * as _foobar from "foobar";
    import { jest } from "@jest/globals";
    import { mock } from '@userlike/joke';
    jest.mock("foobar");
    _foobar;"
  `);

  expect(cjs).toMatchInlineSnapshot(`
    ""use strict";

    var _foobar = _interopRequireWildcard(require("foobar"));
    var _globals = require("@jest/globals");
    var _joke = require("@userlike/joke");
    function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
    _globals.jest.mock("foobar");
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
    `[Error: /example.ts: Can only use \`mock\` at the top-level scope.]`,
  );
});

it("works with rest params", async () => {
  const { esm, cjs } = await assert(`
    import { mock } from '@userlike/joke';
    const { foo, ...bar } = mock(import('foobar'));
    `);

  expect(esm).toMatchInlineSnapshot(`
    "import * as _foobar from "foobar";
    import { jest } from "@jest/globals";
    import { mock } from '@userlike/joke';
    jest.mock("foobar");
    const {
      foo,
      ...bar
    } = _foobar;"
  `);

  expect(cjs).toMatchInlineSnapshot(`
    ""use strict";

    var _foobar = _interopRequireWildcard(require("foobar"));
    var _globals = require("@jest/globals");
    var _joke = require("@userlike/joke");
    function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
    _globals.jest.mock("foobar");
    const {
      foo,
      ...bar
    } = _foobar;"
  `);
});

it("allows custom module implementation to be passed", async () => {
  const { esm, cjs } = await assert(`
    import { mock } from '@userlike/joke';
    const { foo } = mock(import('foobar'), () => ({
      foo: 5
    }));
    `);

  expect(esm).toMatchInlineSnapshot(`
    "import * as _foobar from "foobar";
    import { jest } from "@jest/globals";
    import { mock } from '@userlike/joke';
    jest.mock("foobar", () => global.Object.assign({}, jest.genMockFromModule("foobar"), (() => ({
      foo: 5
    }))()));
    const {
      foo
    } = _foobar;"
  `);

  expect(cjs).toMatchInlineSnapshot(`
    ""use strict";

    var _foobar = _interopRequireWildcard(require("foobar"));
    var _globals = require("@jest/globals");
    var _joke = require("@userlike/joke");
    function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
    _globals.jest.mock("foobar", () => global.Object.assign({}, _globals.jest.genMockFromModule("foobar"), (() => ({
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
    const { esm, cjs } = await assert(`
    import { jest } from '@jest/globals';
    import { mockSome } from '@userlike/joke';
    const { bar } = mockSome(import('foo'), () => ({
      bar: jest.fn()
    }));
    `);

    expect(esm).toMatchInlineSnapshot(`
      "import * as _foo from "foo";
      import { jest } from '@jest/globals';
      import { mockSome } from '@userlike/joke';
      jest.mock("foo", () => global.Object.assign({}, jest.requireActual("foo"), (() => ({
        bar: jest.fn()
      }))()));
      const {
        bar
      } = _foo;"
    `);

    expect(cjs).toMatchInlineSnapshot(`
      ""use strict";

      var _foo = _interopRequireWildcard(require("foo"));
      var _globals = require("@jest/globals");
      var _joke = require("@userlike/joke");
      function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
      _globals.jest.mock("foo", () => global.Object.assign({}, _globals.jest.requireActual("foo"), (() => ({
        bar: _globals.jest.fn()
      }))()));
      const {
        bar
      } = _foo;"
    `);
  });
});

describe("mockAll", () => {
  it("uses plain jest.mock with no extends", async () => {
    const { esm, cjs } = await assert(`
    import { jest } from '@jest/globals';
    import { mockAll } from '@userlike/joke';
    const { bar } = mockAll(import('foo'), () => ({
      bar: jest.fn()
    }));
    `);

    expect(esm).toMatchInlineSnapshot(`
      "import * as _foo from "foo";
      import { jest } from '@jest/globals';
      import { mockAll } from '@userlike/joke';
      jest.mock("foo", () => ({
        bar: jest.fn()
      }));
      const {
        bar
      } = _foo;"
    `);

    expect(cjs).toMatchInlineSnapshot(`
      ""use strict";

      var _foo = _interopRequireWildcard(require("foo"));
      var _globals = require("@jest/globals");
      var _joke = require("@userlike/joke");
      function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
      _globals.jest.mock("foo", () => ({
        bar: _globals.jest.fn()
      }));
      const {
        bar
      } = _foo;"
    `);
  });
});

async function assert(code: string): Promise<{
  esm: string | null | undefined;
  cjs: string | null | undefined;
}> {
  const esm = await B.transformAsync(code, {
    filename: "example.ts",
    plugins: [plugin],
    babelrc: false,
    configFile: false,
    cwd: "/",
  });
  const cjs = await B.transformAsync(code, {
    filename: "example.ts",
    plugins: [plugin, "@babel/plugin-transform-modules-commonjs"],
    babelrc: false,
    configFile: false,
    cwd: "/",
  });

  return {
    esm: esm?.code,
    cjs: cjs?.code,
  };
}
