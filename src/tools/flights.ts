import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
import {
  jsonResult,
  readNumberParam,
  readStringParam,
} from "openclaw/plugin-sdk/provider-web-search";
import { callSerpApi } from "../serpapi-client.js";
import { type SerpApiToolCtx, resolveToolConfig } from "../utils.js";

const ALLOWED_PARAMS = [
  "departure_id",
  "arrival_id",
  "outbound_date",
  "return_date",
  "type",
  "adults",
  "currency",
  "gl",
  "hl",
  "zero_trace",
] as const;

function extract(raw: Record<string, unknown>): Record<string, unknown> {
  return {
    engine: "google_flights",
    best_flights: raw.best_flights ?? [],
    other_flights: raw.other_flights ?? [],
    price_insights: raw.price_insights ?? null,
  };
}

export function createSerpApiFlightsTool(api: OpenClawPluginApi, ctx?: SerpApiToolCtx): AnyAgentTool {
  return {
    name: "serpapi_flights",
    label: "SerpApi Google Flights",
    description:
      "Search flights via Google Flights. Returns real prices and itineraries. " +
      "Use IATA codes for departure_id and arrival_id (e.g. JFK, LAX, KBP). " +
      "type: 1=round trip (default), 2=one-way.",
    parameters: {
      type: "object",
      properties: {
        departure_id: { type: "string", description: "Departure airport IATA code (e.g. JFK)." },
        arrival_id: { type: "string", description: "Arrival airport IATA code (e.g. LAX)." },
        outbound_date: { type: "string", description: "Departure date YYYY-MM-DD." },
        return_date: { type: "string", description: "Return date YYYY-MM-DD (omit for one-way)." },
        type: {
          type: "string",
          enum: ["1", "2"],
          description: "1 = round trip (default), 2 = one-way.",
        },
        adults: {
          type: "number",
          description: "Number of adult passengers (default: 1).",
          minimum: 1,
        },
        currency: { type: "string", description: "Currency code (default: USD)." },
        gl: { type: "string", description: "Country code (e.g. us, de, ua)." },
      },
      required: ["departure_id", "arrival_id", "outbound_date"],
      additionalProperties: false,
    },
    execute: async (_toolCallId: string, args: Record<string, unknown>, signal?: AbortSignal) => {
      const cfg = resolveToolConfig(api, ctx);
      const type = readStringParam(args, "type") ?? "1";
      const returnDate = readStringParam(args, "return_date") ?? undefined;
      if (type === "1" && !returnDate) {
        throw new Error(
          "serpapi_flights: return_date is required for round-trip searches (type=1). " +
            "Provide return_date or set type=2 for a one-way search.",
        );
      }
      const raw = await callSerpApi({
        cfg,
        engine: "google_flights",
        allowedParams: ALLOWED_PARAMS,
        params: {
          departure_id: readStringParam(args, "departure_id", { required: true }),
          arrival_id: readStringParam(args, "arrival_id", { required: true }),
          outbound_date: readStringParam(args, "outbound_date", { required: true }),
          return_date: returnDate,
          type,
          adults: readNumberParam(args, "adults", { integer: true }) ?? 1,
          currency: readStringParam(args, "currency") ?? "USD",
          gl: readStringParam(args, "gl") ?? undefined,
        },
        signal,
      });
      return jsonResult(extract(raw));
    },
  };
}
