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
