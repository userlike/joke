import { add } from "./add";

export function multiply(a: number, b: number): number {
  if (a === 0) return 0;
  if (b === 0) return 0;
  if (a === 1) return b;
  if (b === 1) return a;
  return add(multiply(a, b - 1), a);
}
