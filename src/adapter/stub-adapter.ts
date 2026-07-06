import {
  stableCachePrefixHash,
  type AdapterEvent,
  type HeadAdapter,
  type HeadAdapterRequest,
  type HeadAdapterResponse,
  type ToolCall
} from "./head-adapter.js";

export interface StubHeadAdapterOptions {
  name?: string;
}

export function createStubHeadAdapter(options: StubHeadAdapterOptions = {}): HeadAdapter {
  return new StubHeadAdapter(options.name ?? "stub");
}

class StubHeadAdapter implements HeadAdapter {
  constructor(readonly name: string) {}

  complete(req: HeadAdapterRequest): HeadAdapterResponse {
    const cacheHash = this.cachePrefixHash(req);
    const toolCalls: ToolCall[] = [
      {
        id: "stub-tool-call-1",
        name: "emit_receipt",
        arguments: {
          receipt_id: "stub-receipt-1",
          cache_prefix_hash: cacheHash
        }
      }
    ];
    const events: AdapterEvent[] = [
      {
        type: "adapter.event",
        name: "stub.completed",
        data: {
          adapter: "stub",
          message_count: req.messages.length,
          tool_count: req.tools?.length ?? 0
        }
      }
    ];
    return {
      toolCalls,
      events,
      structured: {
        receipt: {
          kind: "answer",
          decision: "allow",
          firing_rule: "stub-fixed-transcript",
          cited_ids: ["ev-gold-offer"],
          pack_id: "synthetic-eligibility-vn"
        }
      }
    };
  }

  cachePrefixHash(req: HeadAdapterRequest): string {
    return stableCachePrefixHash(req.cachePrefix);
  }
}
