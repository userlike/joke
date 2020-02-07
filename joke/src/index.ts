/**
 * A better Mocked type that handles nested objects.
 */
type Mocked<T> = {
  [P in keyof T]: T[P] extends (...args: any[]) => any
    ? jest.MockInstance<ReturnType<T[P]>, jest.ArgsType<T[P]>>
    : T[P] extends jest.Constructable
    ? jest.MockedClass<T[P]>
    : T[P] extends Record<string, unknown>
    ? Mocked<T[P]>
    : T[P];
} &
  T;

export function mock<M>(_: Promise<M>): Mocked<M> {
  const safetyObj = {};
  const safetyProxy = new Proxy(safetyObj, {
    get() {
      throw new Error("Did you forget to use @userlike/babel-plugin-joke?");
    },
    set() {
      throw new Error("Did you forget to use @userlike/babel-plugin-joke?");
    }
  });

  return unsafeCoerce(safetyProxy);
}

function unsafeCoerce<I, O>(i: I): O {
  return (i as unknown) as O;
}

"Hlel";
