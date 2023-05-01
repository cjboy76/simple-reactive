import { test, expect } from "vitest";
import { reactive } from ".";

test("Basic signal", () => {
  const a = reactive(1);
  const double = reactive(() => a.value * 2);
  expect(double.value).toBe(2);
  a.value = 4;
  expect(double.value).toBe(8);
  a.value = 6;
  expect(double.value).toBe(12);
});

test("Contional case", () => {
  const a = reactive(0);
  const big = reactive(() => a.value > 0);

  const isABig = reactive(() => {
    return big.value ? "A is big" : "A is not big";
  });

  expect(isABig.value).toBe("A is not big");
  a.value = 1;
  expect(isABig.value).toBe("A is big");

  a.value = 3;
  expect(isABig.value).toBe("A is big");
});

test("Contional case: different dependency", () => {
  const x = reactive(false);
  const count = reactive(0);

  const waitForX = reactive(() => {
    if (!x.value) return "Waiting for x...";

    return `The current count is ${count.value}`;
  });

  expect(waitForX.value).toBe("Waiting for x...");
  count.value = 1;
  expect(waitForX.value).toBe("Waiting for x...");
  x.value = true;
  expect(waitForX.value).toBe("The current count is 1");
});
