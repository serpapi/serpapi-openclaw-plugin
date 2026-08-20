import type { OpenClawConfig } from "openclaw/plugin-sdk/config-contracts";
import {
  buildSearchCacheKey,
  readCachedSearchPayload,
  withTrustedWebSearchEndpoint,
  writeCachedSearchPayload,
} from "openclaw/plugin-sdk/provider-web-search";
import {
  resolveSerpApiFormat,
  resolveSerpApiKey,
  resolveSerpApiLanguage,
  SERPAPI_BASE_URL,
  SERPAPI_CACHE_TTL_MS,
  SERPAPI_DEFAULT_TIMEOUT_SECONDS,
  type SerpApiOutputFormat,
} from "./config.js";

// In-process result cache — aligns with SerpApi's 1-hour server-side cache window.
// ZeroTrace requests bypass the cache (caching would defeat the privacy guarantee).
// Uses the shared SEARCH_CACHE (bounded LRU) from provider-web-search.

export type SerpApiCallParams = {
  cfg?: OpenClawConfig;
  engine: string;
  /**
   * Security allowlist — only these keys (plus engine/hl) will be forwarded to SerpApi.
   * "engine" in opts.params is always ignored; it is taken from opts.engine.
   * "hl" in opts.params is honored when "hl" is included here, otherwise the config language is used.
   */
  allowedParams: readonly string[];
  params: Record<string, string | number | boolean | undefined>;
  output?: SerpApiOutputFormat;
  timeoutSeconds?: number;
  signal?: AbortSignal;
};

export type SerpApiResponse = Record<string, unknown> | string;

/** The shared search cache stores records, so markdown payloads are wrapped. */
const MARKDOWN_CACHE_KEY = "__serpapi_markdown";

function wrapForCache(response: SerpApiResponse): Record<string, unknown> {
  return typeof response === "string" ? { [MARKDOWN_CACHE_KEY]: response } : response;
}

function unwrapFromCache(cached: Record<string, unknown>): SerpApiResponse {
  const markdown = cached[MARKDOWN_CACHE_KEY];
  return typeof markdown === "string" ? markdown : cached;
}

function redactApiKey(text: string, apiKey: string): string {
  return text.split(apiKey).join("[redacted]");
}

function resolveOutputFormat(cfg: OpenClawConfig | undefined, override?: SerpApiOutputFormat): SerpApiOutputFormat {
  if (override !== undefined) {
    if (override !== "md" && override !== "json") {
      throw new Error(`serpapi: output must be "md" or "json", got "${override}"`);
    }
    return override;
  }
  return resolveSerpApiFormat(cfg);
}

export async function callSerpApi(opts: SerpApiCallParams): Promise<SerpApiResponse> {
  const apiKey = resolveSerpApiKey(opts.cfg);
  if (!apiKey) {
    throw new Error(
      "serpapi needs a SerpApi API key. Set SERPAPI_API_KEY in the Gateway environment, " +
        "or configure plugins.entries.serpapi.config.webSearch.apiKey.",
    );
  }

  const configHl = resolveSerpApiLanguage(opts.cfg);
  const format = resolveOutputFormat(opts.cfg, opts.output);
  const allowed = new Set(opts.allowedParams);
  // Build raw params; engine is always reserved, hl is honored when allowlisted.
  const rawParams: Record<string, string> = {};
  for (const [k, v] of Object.entries(opts.params)) {
    if (k !== "engine" && v !== undefined && v !== null && v !== "") {
      rawParams[k] = String(v);
    }
  }
  rawParams.engine = opts.engine;
  // Use per-call hl only when explicitly allowlisted and supplied; fall back to config language.
  if (!allowed.has("hl") || !rawParams.hl) {
    rawParams.hl = configHl;
  }

  // Filter to caller-declared allowlist; engine and hl are always forwarded.
  const filtered = Object.fromEntries(
    Object.entries(rawParams).filter(([k]) => k === "engine" || k === "hl" || allowed.has(k)),
  );

  if (format === "md") {
    filtered.output = "md";
  }

  const isZeroTrace = filtered.zero_trace === "true";

  const cacheKey = buildSearchCacheKey([
    "serpapi",
    JSON.stringify(
      Object.entries(filtered)
        .filter(([k]) => k !== "api_key")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, v.trim()]),
    ),
  ]);
  if (!isZeroTrace) {
    const cached = readCachedSearchPayload(cacheKey);
    if (cached) return unwrapFromCache(cached);
  }

  const urlParams = new URLSearchParams({ ...filtered, api_key: apiKey });
  const url = `${SERPAPI_BASE_URL}?${urlParams.toString()}`;

  const result = await withTrustedWebSearchEndpoint(
    {
      url,
      timeoutSeconds: opts.timeoutSeconds ?? SERPAPI_DEFAULT_TIMEOUT_SECONDS,
      signal: opts.signal,
      init: {
        method: "GET",
        headers: {
          "X-Client-Source": "openclaw",
        },
      },
    },
    async (response: Response) => {
      if (!response.ok) {
        const text = await response.text().catch(() => response.statusText);
        if (response.status === 401) throw new Error("SerpApi: invalid or missing API key.");
        if (response.status === 429) throw new Error("SerpApi: quota exhausted. Narrow the request or try later.");
        if (response.status >= 500) throw new Error(`SerpApi: upstream error (${response.status}). Try again shortly.`);
        throw new Error(`SerpApi (${opts.engine}) error (${response.status}): ${redactApiKey(text, apiKey)}`);
      }
      const text = redactApiKey(await response.text(), apiKey);
      if (format === "md") {
        return text;
      }
      try {
        return JSON.parse(text) as Record<string, unknown>;
      } catch {
        throw new Error(`SerpApi (${opts.engine}): malformed JSON response`);
      }
    },
  );

  if (!isZeroTrace) {
    writeCachedSearchPayload(cacheKey, wrapForCache(result), SERPAPI_CACHE_TTL_MS);
  }
  return result;
}
