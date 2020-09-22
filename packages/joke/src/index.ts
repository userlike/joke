/**
 * (Hopefully) A better Mocked type that handles nested objects.
 */
type Mocked<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [P in keyof T]: T[P] extends (...args: any[]) => any
    ? jest.MockInstance<ReturnType<T[P]>, jest.ArgsType<T[P]>>
    : T[P] extends jest.Constructable
    ? jest.MockedClass<T[P]>
    : T[P] extends Record<string, unknown>
    ? Mocked<T[P]>
    : T[P];
} &
  T;

/**
 *
 * @param _ Dynamic imported module
 */
export function mock<M>(_: Promise<M>): Mocked<M>;

/**
 *
 * @param _impl Mock factory that returns a partial implementation. The returned object is merged
 * with auto-generated module mock using `Object.assign`.
 */
export function mock<M>(_: Promise<M>, _impl: () => Partial<M>): Mocked<M>;
export function mock<M>(
  _: Promise<M>,
  _impl: () => Partial<M> = (): Partial<M> => ({})
): Mocked<M> {
  return unsafeCoerce(mockSafetyNet());
}

export function mockSome<M, K extends keyof M>(
  _: Promise<M>,
  _impl: () => {
    [_K in K]: Mocked<M>[_K];
  }
): Omit<M, K> & Pick<Mocked<M>, K> {
  return unsafeCoerce(mockSafetyNet());
}

export function mockAll<M, K extends keyof M>(
  _: Promise<M>,
  _impl: () => {
    [_K in K]: Mocked<M>[_K];
  }
): Omit<M, K> & Pick<Mocked<M>, K> {
  return unsafeCoerce(mockSafetyNet());
}

function mockSafetyNet(): unknown {
  const safetyObj = {};
  const safetyProxy = new Proxy(safetyObj, {
    get(): never {
      throw new Error("Did you forget to use @userlike/babel-plugin-joke?");
    },
    set(): never {
      throw new Error("Did you forget to use @userlike/babel-plugin-joke?");
    },
  });

  return safetyProxy;
}

function unsafeCoerce<I, O>(i: I): O {
  return (i as unknown) as O;
}
