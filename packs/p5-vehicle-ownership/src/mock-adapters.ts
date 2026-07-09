import { p5MockApiByEndpoint, p5MockApiByName, type P5MockApi } from "./synthetic-corpus.js";

export interface P5MockAdapterResult {
  api: P5MockApi;
  response: unknown;
}

export function callP5MockApiByName(apiName: string): P5MockAdapterResult {
  const api = p5MockApiByName.get(apiName);
  if (!api) throw new Error(`Unknown P5 mock API: ${apiName}`);
  return { api, response: parseSampleResponse(api) };
}

export function callP5MockApiByEndpoint(endpoint: string): P5MockAdapterResult {
  const api = p5MockApiByEndpoint.get(endpoint);
  if (!api) throw new Error(`Unknown P5 mock endpoint: ${endpoint}`);
  return { api, response: parseSampleResponse(api) };
}

export function listP5MockApis(): P5MockApi[] {
  return [...p5MockApiByName.values()];
}

function parseSampleResponse(api: P5MockApi): unknown {
  return JSON.parse(api.sample_response);
}
