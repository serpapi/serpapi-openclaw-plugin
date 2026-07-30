# @serpapi/openclaw-plugin

SerpApi search plugin for [OpenClaw](https://docs.openclaw.ai). Registers a
`web_search` provider plus specialized SerpApi tools, distributed through
[ClawHub](https://docs.openclaw.ai/clawhub).

> This is the ClawHub/external-plugin distribution of the SerpApi integration.
> It replaces the earlier attempt to bundle SerpApi into OpenClaw core
> ([openclaw/openclaw#86440](https://github.com/openclaw/openclaw/pull/86440)),
> which was closed with the guidance that optional, credentialed third-party
> providers should ship as installable ClawHub plugins rather than core code.

## What it provides

- **`web_search` provider** — "SerpApi Search", backed by SerpApi's Google Light
  engine (fastest Google Search API).
- **30 specialized tools** covering Google News, Scholar, Maps (+reviews),
  Shopping, Flights, Hotels, Events, Jobs, Trends, Finance, Lens, Autocomplete,
  Bing, DuckDuckGo, Yahoo, YouTube (search, video, transcript), Amazon, eBay,
  Walmart, Google Immersive Product, Tripadvisor, Weather, and Facebook /
  Instagram public profiles.

See [`skills/serpapi/SKILL.md`](skills/serpapi/SKILL.md) for per-tool parameters
and usage guidance.

## Install

```bash
openclaw plugins install clawhub:@serpapi/openclaw-plugin
```

Or via npm during launch cutover:

```bash
openclaw plugins install npm:@serpapi/openclaw-plugin
```

## Configure

Set the API key via config or the `SERPAPI_API_KEY` environment variable:

```json5
{
  plugins: {
    entries: {
      serpapi: {
        enabled: true,
        config: { webSearch: { apiKey: "YOUR_SERPAPI_KEY", hl: "en" } },
      },
    },
  },
}
```

```bash
export SERPAPI_API_KEY="YOUR_SERPAPI_KEY"
```

Get a key at [serpapi.com/users/sign_up](https://serpapi.com/users/sign_up).

## Develop

Requires Node 22.19+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm run typecheck
pnpm run build
```

The plugin targets `openclaw >= 2026.6.11` and imports the plugin SDK from the
`openclaw/plugin-sdk/*` subpaths.

## Publish to ClawHub

```bash
pnpm run build
clawhub package validate .
clawhub package publish . --family code-plugin --dry-run
clawhub package publish . --family code-plugin
```

## License

MIT
