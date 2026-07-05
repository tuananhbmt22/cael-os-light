#!/usr/bin/env node

import process from "node:process";
import { initFixture, status, type CliResult } from "./runtime.js";

async function main(argv: string[]): Promise<CliResult> {
  const command = argv[0] ?? "status";
  const args = argv.slice(1);
  const target = parseTarget(args);

  if (command === "init") {
    if (!args.includes("--fixture")) {
      return { ok: false, code: "missing-fixture-flag", message: "init requires --fixture" };
    }
    return initFixture({ target });
  }

  if (command === "status") return status({ target });
  return { ok: false, code: "unsupported-command", message: `Unsupported command: ${command}` };
}

function parseTarget(args: string[]): string | undefined {
  const index = args.indexOf("--target");
  if (index < 0) return undefined;
  const value = args[index + 1];
  return value && !value.startsWith("--") ? value : undefined;
}

const result = await main(process.argv.slice(2));
if (result.ok) {
  if (result.stdout !== undefined) console.log(result.stdout);
} else {
  console.error(JSON.stringify({ error: result.code, message: result.message }));
  process.exitCode = 1;
}

