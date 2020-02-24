/**
 * A better Mocked type that handles nested objects.
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

export function mock<M>(_: Promise<M>): Mocked<M>;
export function mock<M, P extends Partial<M>>(
  _: Promise<M>,
  _impl: () => P
): Mocked<P>;
export function mock<M>(
  _: Promise<M>,
  _impl: () => Partial<M> = (): Partial<M> => ({})
): Mocked<M> {
  const safetyObj = {};
  const safetyProxy = new Proxy(safetyObj, {
    get(): never {
      throw new Error("Did you forget to use @userlike/babel-plugin-joke?");
    },
    set(): never {
      throw new Error("Did you forget to use @userlike/babel-plugin-joke?");
    }
  });

  return unsafeCoerce(safetyProxy);
}

function unsafeCoerce<I, O>(i: I): O {
  return (i as unknown) as O;
}
