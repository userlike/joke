import { mock } from "@userlike/joke";
import { multiply } from "./multiply";

const { add } = mock(import("./add"));

add.mockImplementation((a, b) => a + b);

it("mocks multiply", () => {
  multiply(2, 3);

  expect(add).toBeCalledWith(2, 2);
  expect(add).toBeCalledWith(4, 2);
  expect(add).toBeCalledTimes(2);
});
