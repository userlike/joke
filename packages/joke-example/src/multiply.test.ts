import { mock } from "@userlike/joke";
import { multiply } from "./multiply";
import { it, expect } from "@jest/globals";

const { add } = mock(import("./add"));

add.mockImplementation((a, b) => a + b);

it("mocks multiply", () => {
  multiply(2, 3);

  expect(add).toHaveBeenCalledWith(2, 2);
  expect(add).toHaveBeenCalledWith(4, 2);
  expect(add).toHaveBeenCalledTimes(2);
});
