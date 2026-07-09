---
name: serpapi
description: SerpApi web search for OpenClaw. Real-time Google results (Google Light engine) plus access to 100+ SerpApi search engines. Specialized SerpApi tools follow in subsequent releases.
metadata:
  { "openclaw": { "emoji": "🔎", "requires": { "config": ["plugins.entries.serpapi.enabled"] } } }
---

# SerpApi Search

SerpApi gives OpenClaw real-time access to Google and 100+ other search engines.
This plugin registers a `web_search` provider backed by SerpApi's Google Light
engine (the fastest Google Search API).

Specialized SerpApi verticals (news, flights, hotels, maps, shopping, scholar,
finance, YouTube, events, e-commerce, and more) are added as dedicated tools in
subsequent releases.

## Configuration

Set the API key either through config or the `SERPAPI_API_KEY` environment
variable.

```json5
{
  plugins: {
    entries: {
      serpapi: {
        enabled: true,
        config: {
          webSearch: {
            apiKey: "YOUR_SERPAPI_KEY",
            // Optional default language for all searches (e.g. en, de, uk).
            hl: "en",
          },
        },
      },
    },
  },
}
```

Environment fallback:

```bash
export SERPAPI_API_KEY="YOUR_SERPAPI_KEY"
```

## web_search

The provider-backed web search uses SerpApi's Google Light engine. It returns
titles, URLs, snippets, related questions, and related searches.

Parameters:

- `query` (required) — search query string.
- `count` (1-10) — number of results to return.
- `gl` — country code for Google Search (e.g. `us`, `de`, `ua`). Defaults to `us`.
- `location` — location to originate the search from (e.g. `Austin, Texas`).
  Cannot be combined with `uule`.
- `uule` — Google encoded location string. Cannot be combined with `location`.
- `google_domain` — Google domain to use (e.g. `google.com`, `google.de`).
- `lr` — limit results to specific languages (e.g. `lang_en|lang_de`).
- `safe` — SafeSearch level: `active` or `off`.
- `start` — result offset for pagination (0, 10, 20, ...).
