import { Mocked } from "./types";

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
