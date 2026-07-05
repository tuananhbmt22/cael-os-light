import { readFileSync } from "node:fs";

export function readFixture<T>(path: string): T {
  return JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8")) as T;
}
