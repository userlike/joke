# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 0.1.0-alpha.0 (2020-02-06)


### Features

* happy birthday joke ([de30ad3](https://github.com/anilanar/joke/commit/de30ad331af8294a973a1c3c90023e33201fc290))





`joke` is a typesafe, boilerplate version of `jest.mock`.

To be able to use `jest.mock` in Typescript, 3 lines of code is needed in the best scenario. The effect multiplies when you need to mock multiple modules. If you mock 3 modules, you will need 9 lines of code. `joke` reduces 9 lines to 3 lines:

```typescript
import * as M from './math';

jest.mock('./math');
const { add, multiply } = M as jest.Mocked<typeof M>;

// And finally, we can use mock utilities
add.mockReturnValue(5);
```

With `joke`, it's reduced to a single line:

```typescript
const { add, multiply } = mock(import('./math'));

// We can already use mock utilities
add.mockReturnValue(5);
```

## Install

### npm

```
npm install --saveDev @userlike/joke @userlike/babel-plugin-joke
```

### yarn

```
yarn add -D @userlike/joke @userlike/babel-plugin-joke
```

### Babel config 

Add `@userlike/babel-plugin-joke` to your babel plugins.

## Usage

See `joke-example` directory for a full example.

```typescript
import { mock } from "@userlike/joke";
import { multiply } from "./multiply";

// Mock add module
const { add } = mock(import("./add"));

add.mockImplementation((a, b) => a + b);

it("mocks multiply", () => {
  multiply(2, 3);

  expect(add).toBeCalledWith(2, 2);
  expect(add).toBeCalledWith(4, 2);
  expect(add).toBeCalledTimes(2);
});
