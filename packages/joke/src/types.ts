/* eslint-disable @typescript-eslint/no-explicit-any */

type ArgsType<T> = T extends (...args: infer A) => any ? A : never;
type ResolvedValue<T> = T extends PromiseLike<infer U> ? U | T : never;
type RejectedValue<T> = T extends PromiseLike<any> ? any : never;

interface Constructable {
  new (...args: any[]): any;
}

interface MockResultReturn<T> {
  type: "return";
  value: T;
}
/**
 * Represents the result of a single incomplete call to a mock function.
 */
interface MockResultIncomplete {
  type: "incomplete";
  value: undefined;
}
/**
 * Represents the result of a single call to a mock function with a thrown error.
 */
interface MockResultThrow {
  type: "throw";
  value: any;
}

type MockResult<T> =
  | MockResultReturn<T>
  | MockResultThrow
  | MockResultIncomplete;

interface MockContext<T, Y extends any[], C = any> {
  /**
   * List of the call arguments of all calls that have been made to the mock.
   */
  calls: Y[];
  /**
   * List of the call contexts of all calls that have been made to the mock.
   */
  contexts: C[];
  /**
   * List of all the object instances that have been instantiated from the mock.
   */
  instances: T[];
  /**
   * List of the call order indexes of the mock. Jest is indexing the order of
   * invocations of all mocks in a test file. The index is starting with `1`.
   */
  invocationCallOrder: number[];
  /**
   * List of the call arguments of the last call that was made to the mock.
   * If the function was not called, it will return `undefined`.
   */
  lastCall?: Y;
  /**
   * List of the results of all calls that have been made to the mock.
   */
  results: Array<MockResult<T>>;
}

type MockedClass<T extends Constructable> = MockInstance<
  InstanceType<T>,
  T extends new (...args: infer P) => any ? P : never,
  T extends new (...args: any[]) => infer C ? C : never
> & {
  prototype: T extends { prototype: any } ? Mocked<T["prototype"]> : never;
} & T;

export type Mocked<T> = {
  [P in keyof T]: T[P] extends (this: infer C, ...args: any[]) => any
    ? MockInstance<ReturnType<T[P]>, ArgsType<T[P]>, C>
    : T[P] extends Constructable
    ? MockedClass<T[P]>
    : T[P];
} & T;

interface MockInstance<T, Y extends any[], C = any> {
  /** Returns the mock name string set by calling `mockFn.mockName(value)`. */
  getMockName(): string;
  /** Provides access to the mock's metadata */
  mock: MockContext<T, Y, C>;
  /**
   * Resets all information stored in the mockFn.mock.calls and mockFn.mock.instances arrays.
   *
   * Often this is useful when you want to clean up a mock's usage data between two assertions.
   *
   * Beware that `mockClear` will replace `mockFn.mock`, not just `mockFn.mock.calls` and `mockFn.mock.instances`.
   * You should therefore avoid assigning mockFn.mock to other variables, temporary or not, to make sure you
   * don't access stale data.
   */
  mockClear(): this;
  /**
   * Resets all information stored in the mock, including any initial implementation and mock name given.
   *
   * This is useful when you want to completely restore a mock back to its initial state.
   *
   * Beware that `mockReset` will replace `mockFn.mock`, not just `mockFn.mock.calls` and `mockFn.mock.instances`.
   * You should therefore avoid assigning mockFn.mock to other variables, temporary or not, to make sure you
   * don't access stale data.
   */
  mockReset(): this;
  /**
   * Does everything that `mockFn.mockReset()` does, and also restores the original (non-mocked) implementation.
   *
   * This is useful when you want to mock functions in certain test cases and restore the original implementation in others.
   *
   * Beware that `mockFn.mockRestore` only works when mock was created with `jest.spyOn`. Thus you have to take care of restoration
   * yourself when manually assigning `jest.fn()`.
   *
   * The [`restoreMocks`](https://jestjs.io/docs/en/configuration.html#restoremocks-boolean) configuration option is available
   * to restore mocks automatically between tests.
   */
  mockRestore(): void;
  /**
   * Returns the function that was set as the implementation of the mock (using mockImplementation).
   */
  getMockImplementation(): ((...args: Y) => T) | undefined;
  /**
   * Accepts a function that should be used as the implementation of the mock. The mock itself will still record
   * all calls that go into and instances that come from itself – the only difference is that the implementation
   * will also be executed when the mock is called.
   *
   * Note: `jest.fn(implementation)` is a shorthand for `jest.fn().mockImplementation(implementation)`.
   */
  mockImplementation(fn?: (...args: Y) => T): this;
  /**
   * Accepts a function that will be used as an implementation of the mock for one call to the mocked function.
   * Can be chained so that multiple function calls produce different results.
   *
   * @example
   *
   * const myMockFn = jest
   *   .fn()
   *    .mockImplementationOnce(cb => cb(null, true))
   *    .mockImplementationOnce(cb => cb(null, false));
   *
   * myMockFn((err, val) => console.log(val)); // true
   *
   * myMockFn((err, val) => console.log(val)); // false
   */
  mockImplementationOnce(fn: (...args: Y) => T): this;
  /**
   * Temporarily overrides the default mock implementation within the callback,
   * then restores its previous implementation.
   *
   * @remarks
   * If the callback is async or returns a `thenable`, `withImplementation` will return a promise.
   * Awaiting the promise will await the callback and reset the implementation.
   */
  withImplementation(
    fn: (...args: Y) => T,
    callback: () => Promise<unknown>
  ): Promise<void>;
  /**
   * Temporarily overrides the default mock implementation within the callback,
   * then restores its previous implementation.
   */
  withImplementation(fn: (...args: Y) => T, callback: () => void): void;
  /** Sets the name of the mock. */
  mockName(name: string): this;
  /**
   * Just a simple sugar function for:
   *
   * @example
   *
   *   jest.fn(function() {
   *     return this;
   *   });
   */
  mockReturnThis(): this;
  /**
   * Accepts a value that will be returned whenever the mock function is called.
   *
   * @example
   *
   * const mock = jest.fn();
   * mock.mockReturnValue(42);
   * mock(); // 42
   * mock.mockReturnValue(43);
   * mock(); // 43
   */
  mockReturnValue(value: T): this;
  /**
   * Accepts a value that will be returned for one call to the mock function. Can be chained so that
   * successive calls to the mock function return different values. When there are no more
   * `mockReturnValueOnce` values to use, calls will return a value specified by `mockReturnValue`.
   *
   * @example
   *
   * const myMockFn = jest.fn()
   *   .mockReturnValue('default')
   *   .mockReturnValueOnce('first call')
   *   .mockReturnValueOnce('second call');
   *
   * // 'first call', 'second call', 'default', 'default'
   * console.log(myMockFn(), myMockFn(), myMockFn(), myMockFn());
   */
  mockReturnValueOnce(value: T): this;
  /**
   * Simple sugar function for: `jest.fn().mockImplementation(() => Promise.resolve(value));`
   */
  mockResolvedValue(value: ResolvedValue<T>): this;
  /**
   * Simple sugar function for: `jest.fn().mockImplementationOnce(() => Promise.resolve(value));`
   *
   * @example
   *
   * test('async test', async () => {
   *  const asyncMock = jest
   *    .fn()
   *    .mockResolvedValue('default')
   *    .mockResolvedValueOnce('first call')
   *    .mockResolvedValueOnce('second call');
   *
   *  await asyncMock(); // first call
   *  await asyncMock(); // second call
   *  await asyncMock(); // default
   *  await asyncMock(); // default
   * });
   */
  mockResolvedValueOnce(value: ResolvedValue<T>): this;
  /**
   * Simple sugar function for: `jest.fn().mockImplementation(() => Promise.reject(value));`
   *
   * @example
   *
   * test('async test', async () => {
   *   const asyncMock = jest.fn().mockRejectedValue(new Error('Async error'));
   *
   *   await asyncMock(); // throws "Async error"
   * });
   */
  mockRejectedValue(value: RejectedValue<T>): this;

  /**
   * Simple sugar function for: `jest.fn().mockImplementationOnce(() => Promise.reject(value));`
   *
   * @example
   *
   * test('async test', async () => {
   *  const asyncMock = jest
   *    .fn()
   *    .mockResolvedValueOnce('first call')
   *    .mockRejectedValueOnce(new Error('Async error'));
   *
   *  await asyncMock(); // first call
   *  await asyncMock(); // throws "Async error"
   * });
   */
  mockRejectedValueOnce(value: RejectedValue<T>): this;
}
