import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
import { readStringParam } from "openclaw/plugin-sdk/provider-web-search";
import { callSerpApi } from "../serpapi-client.js";
import { readOutputArg, resolveToolConfig, type SerpApiToolCtx, serpApiResult } from "../utils.js";

const ALLOWED_PARAMS = ["q", "hl", "window", "zero_trace"] as const;

function extract(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    engine: "google_finance",
    summary: raw.summary ?? null,
    markets: raw.markets ?? null,
    graph: raw.graph ?? null,
    knowledge_graph: raw.knowledge_graph ?? null,
    financials: raw.financials ?? null,
    news_results: raw.news_results ?? null,
    discover_more: raw.discover_more ?? null,
  };
}

export function createSerpApiFinanceTool(api: OpenClawPluginApi, ctx?: SerpApiToolCtx): AnyAgentTool {
  return {
    name: "serpapi_finance",
    label: "SerpApi Google Finance",
    description:
      "Look up stock prices, currency rates, and cryptocurrency via Google Finance. " +
      "Returns price, change, and recent news. " +
      "Examples: q='GOOGL:NASDAQ' (Alphabet stock), q='BTC-USD' (Bitcoin), q='USDEUR=X' (USD/EUR rate). " +
      "Stocks use symbol-first, exchange-qualified form: TICKER:EXCHANGE (e.g. GOOGL:NASDAQ, AAPL:NASDAQ). " +
      "window: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Ticker or pair. Stocks use symbol-first, exchange-qualified form TICKER:EXCHANGE " +
            "(e.g. GOOGL:NASDAQ). Also supports crypto (BTC-USD) and FX pairs (USDEUR=X).",
        },
        window: {
          type: "string",
          description: "Time window (default: 1D). Options: 1D, 5D, 1M, 6M, YTD, 1Y, 5Y, MAX.",
        },
        output: {
          type: "string",
          enum: ["md", "json"],
          description: "Response format: 'md' (markdown, default, fewer tokens) or 'json' (structured).",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
    execute: async (_toolCallId: string, args: Record<string, unknown>, signal?: AbortSignal) => {
      const cfg = resolveToolConfig(api, ctx);
      const raw = await callSerpApi({
        cfg,
        engine: "google_finance",
        allowedParams: ALLOWED_PARAMS,
        params: {
          q: readStringParam(args, "query", { required: true }),
          window: readStringParam(args, "window") ?? "1D",
        },
        output: readOutputArg(args),
        signal,
      });
      return serpApiResult(typeof raw === "string" ? raw : extract(raw));
    },
  };
}
