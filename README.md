## 🍭 joke

`joke` is a typesafe, boilerplate free version of `jest.mock`.

## Advantages

- Less boilerplate than `jest.mock`.
- Type-safe imports. No more type-casting.
- TS/JS Language Server recognizes them when moving files around.
- Supports partial mocking (`mockSome`).

## Usage

### Install

```
npm install --saveDev @userlike/joke @userlike/babel-plugin-joke
```

```
yarn add -D @userlike/joke @userlike/babel-plugin-joke
```

### Babel config

Add `@userlike/babel-plugin-joke` to your babel plugins.

If you use [`ts-jest`](https://www.npmjs.com/package/ts-jest), please additionally refer to the "Usage with `ts-jest`" section below.

### And use

```typescript
import { mock } from "@userlike/joke";

const { fetchUser } = mock(import("./service"));

fetchUser.mockReturnValue(Promise.resolve({ id: 1, name: "Jane Doe" }));
```

---

## Full mocking

Mock the whole module.

```typescript
import { mock } from "@userlike/joke";

const { fetchUser } = mock(import("./service"));

fetchUser.mockReturnValue(Promise.resolve({ id: 1, name: "Jane Doe" }));
```

### Full mocking with partial implementation

Use the second argument of `mock` to provide some implementation.

```typescript
import { mock } from "@userlike/joke";

const { fetchUser } = mock(import("./service"), () => ({
  fetchUser: () => Promise.resolve({ id: 1, name: "Jane Doe" })
}));
```

---

## Partial mocking

When you need to mock a module partially, but to keep the rest of the module unmocked, you can use `mockSome`.

```typescript
import { mockSome } from "@userlike/joke";
import { renderUser } from "./my-component";

// fetchUser is mocked, getUserId is the real implementation
const { fetchUser, getUserId } = mockSome(import("./service"), () => ({
  fetchUser: jest.fn()
}));

test(async () => {
  const user = { id: 1, name: "Jane Doe" };
  fetchUser.mockReturnValue(Promise.resolve(user));

  await renderUser();

  expect(document.getElementById("#user-id").innerText).toBe(getUserId(user));
});
```

## Usage with `ts-jest`

If you use [`ts-jest`](https://www.npmjs.com/package/ts-jest) instead of Babel, you need to additionally ensure each of the following:

- That Babel preprocessing is enabled in your `ts-jest` configuration section.
- That Babel is configured to use `joke` as a plugin.
- That the `module` key of `tsconfig.json`'s `compilerOptions` is set to at least `es2020`, or `esnext` to support dynamic imports. You may also need to set `moduleResolution` to `node` for the general `import` syntax to work properly.
- That the code is transpiled down to the JS syntax `jest` understands (you may use `@babel/preset-env` for that purpose).

**Note**: if you don't want to modify your main `tsconfig.json` file, you can introduce a separate configuration named e.g. `tsconfig.tests.json`.

Example Typescript configuration for tests:

```typescript
{
  "extends": "tsconfig.json",
  "compilerOptions": {
    "module": "ES2020",
    "moduleResolution": "node"
  }
}
```

To enable Babel preprocessing in `ts-jest`, as well as to configure the `tsconfig` file you want use for tests, add or update the `globals` section in your jest config. 

Example with separate Babel and Typescript configuration files:

```typescript
"globals": {
  'ts-jest': {
    "babelConfig": "true",
    "tsConfig": "tsconfig.test.json"
  }
}
```

Example with inline Typescript and Babel configuration:

```typescript
"globals": {
  'ts-jest': {
    "babelConfig": {
      "plugins": ["@userlike/babel-plugin-joke"],
      "presets": [
        [
          "@babel/preset-env",
          {
            "targets": {
              "node": 'current'
            }
          }
        ]
      ]
    },
    "tsConfig": {
      "module": "es2020",
      "moduleResolution": "node",
    }
  }
}
```

For details, see [`ts-jest` configuration docs](https://kulshekhar.github.io/ts-jest/user/config/).
