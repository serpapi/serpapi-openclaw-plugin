import type { AnyAgentTool } from "openclaw/plugin-sdk/plugin-entry";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
import { readStringParam } from "openclaw/plugin-sdk/provider-web-search";
import { callSerpApi } from "../serpapi-client.js";
import { readOutputArg, resolveToolConfig, type SerpApiToolCtx, serpApiResult } from "../utils.js";

const ALLOWED_PARAMS = ["profile_id", "zero_trace"] as const;

function extract(raw: Record<string, unknown>): Record<string, unknown> {
  const profileResults = (raw.profile_results ?? null) as Record<string, unknown> | null;
  const { photos, ...profile } = profileResults ?? {};
  return {
    engine: "facebook_profile",
    profile: profileResults ? profile : null,
    photos: photos ?? [],
  };
}

export function createSerpApiFacebookProfileTool(api: OpenClawPluginApi, ctx?: SerpApiToolCtx): AnyAgentTool {
  return {
    name: "serpapi_facebook_profile",
    label: "SerpApi Facebook Profile",
    description:
      "Fetch a public Facebook profile via SerpApi. " +
      "Returns profile details and photos. " +
      "Use the profile slug (e.g. Meta) or numeric ID from the profile URL.",
    parameters: {
      type: "object",
      properties: {
        profile_id: {
          type: "string",
          description:
            "Facebook profile ID or slug from the profile URL. " +
            "E.g. 'Meta' from facebook.com/Meta, or '100080376596424' from facebook.com/profile.php?id=100080376596424.",
        },
        output: {
          type: "string",
          enum: ["md", "json"],
          description: "Response format: 'md' (markdown, default, fewer tokens) or 'json' (structured).",
        },
      },
      required: ["profile_id"],
      additionalProperties: false,
    },
    execute: async (_toolCallId: string, args: Record<string, unknown>, signal?: AbortSignal) => {
      const cfg = resolveToolConfig(api, ctx);
      const raw = await callSerpApi({
        cfg,
        engine: "facebook_profile",
        allowedParams: ALLOWED_PARAMS,
        params: {
          profile_id: readStringParam(args, "profile_id", { required: true }),
        },
        output: readOutputArg(args),
        signal,
      });
      return serpApiResult(typeof raw === "string" ? raw : extract(raw));
    },
  };
}
