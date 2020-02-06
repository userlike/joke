export function mock<M>(_: Promise<M>): jest.Mocked<M> {
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

"Hlel"
