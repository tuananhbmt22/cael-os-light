#!/usr/bin/env node

const command = process.argv[2] ?? "status";

if (command === "status") {
  console.log(JSON.stringify({ status: "phase0-s1-stub" }));
} else {
  console.error(`Unsupported command: ${command}`);
  process.exitCode = 1;
}
