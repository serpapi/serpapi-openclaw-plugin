import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contracts";
import type { OpenClawPluginToolContext } from "openclaw/plugin-sdk/plugin-entry";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-runtime";
import { jsonResult, wrapWebContent } from "openclaw/plugin-sdk/provider-web-search";
import type { SerpApiOutputFormat } from "./config.js";
import { limitResultTable } from "./markdown.js";

export type SerpApiToolCtx = Pick<OpenClawPluginToolContext, "config" | "runtimeConfig" | "getRuntimeConfig">;

export function resolveToolConfig(api: OpenClawPluginApi, ctx?: SerpApiToolCtx): OpenClawConfig {
  return ctx?.getRuntimeConfig?.() ?? ctx?.runtimeConfig ?? ctx?.config ?? api.config;
}

/** Reads a boolean tool argument that may arrive as a real boolean or as "true"/"false" string. */
export function readBooleanArg(args: Record<string, unknown>, key: string): boolean | undefined {
  const v = args[key];
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return undefined;
}

export function readOutputArg(args: Record<string, unknown>): SerpApiOutputFormat | undefined {
  const v = args.output;
  if (v === undefined || v === null || v === "") return undefined;
  const s = String(v).trim().toLowerCase();
  if (s === "md" || s === "json") return s;
  throw new Error(`output must be "md" or "json", got "${s}"`);
}

export type SerpApiResultOptions = {
  markdownHeading?: string;
  limit?: number;
};

/** wrapWebContent is a security boundary: markdown is untrusted SERP content. */
export function serpApiResult(
  response: Record<string, unknown> | string,
  opts?: SerpApiResultOptions,
): ReturnType<typeof jsonResult> {
  if (typeof response === "string") {
    let markdown = response;
    if (opts?.markdownHeading && opts.limit !== undefined) {
      markdown = limitResultTable(markdown, { heading: opts.markdownHeading, limit: opts.limit });
    }
    return jsonResult({ markdown: wrapWebContent(markdown, "web_search") });
  }
  return jsonResult(response);
}
