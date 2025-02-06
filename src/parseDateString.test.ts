import { test } from "node:test";
import { strict as assert } from "node:assert";
import { parseDateString } from "./parseDateString.js";

test("parseDateString", () => {
  assert.deepEqual(parseDateString("241029"), new Date(2024, 9, 29, 12, 0)); // 2024-10-29
  assert.deepEqual(parseDateString("20241029"), new Date(2024, 9, 29, 12, 0)); // 2024-10-29
  assert.deepEqual(parseDateString("2024102910"), new Date(2024, 9, 29, 10, 0)); // 2024-10-29 10:00 AM
  assert.deepEqual(parseDateString("241029a"), new Date(2024, 9, 29, 12, 0)); // 2024-10-29
  assert.deepEqual(parseDateString("241029a1"), new Date(2024, 9, 29, 12, 0)); // 2024-10-29
  assert.deepEqual(
    parseDateString("2024102910a1"),
    new Date(2024, 9, 29, 10, 0)
  ); // 2024-10-29 10:00 AM
});
