# SerpApi for OpenClaw personal AI Assistant

[![ClawHub version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fclawhub.ai%2Fapi%2Fv1%2Fpackages%2F%40serpapi%2Fopenclaw-plugin&query=%24.package.latestVersion&prefix=v&label=clawhub&color=blue)](https://clawhub.ai/serpapi/plugins/@serpapi/openclaw-plugin)
[![ClawHub downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fclawhub.ai%2Fapi%2Fv1%2Fpackages%2F%40serpapi%2Fopenclaw-plugin&query=%24.package.stats.downloads&label=downloads&color=blue)](https://clawhub.ai/serpapi/plugins/@serpapi/openclaw-plugin)
[![CI](https://github.com/serpapi/serpapi-openclaw-plugin/actions/workflows/ci.yml/badge.svg)](https://github.com/serpapi/serpapi-openclaw-plugin/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D22.19-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/serpapi/serpapi-openclaw-plugin/blob/main/LICENSE)

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
pnpm run lint
pnpm run typecheck
pnpm run build
```

Formatting and linting are handled by [Biome](https://biomejs.dev). `pnpm run
lint` is the check CI runs; `pnpm run format` applies the fixes.

The plugin targets `openclaw >= 2026.6.11` and imports the plugin SDK from the
`openclaw/plugin-sdk/*` subpaths.

## Publishing

Publishing a GitHub Release runs the
[release workflow](.github/workflows/release.yml): `test` → `build` → `verify`
→ `publish-npm` and `publish-clawhub`. `build` packs a single tarball, and both
registries publish that same artifact, so the compiled output is never rebuilt
after it has been verified. The release tag must equal
`v<package.json version>` or the workflow fails before publishing anywhere.

Running the workflow manually stops after `verify` and publishes nothing.

Both registries require a repository secret: `CLAWHUB_TOKEN` and `NPM_TOKEN`.
npm releases carry [provenance](https://docs.npmjs.com/generating-provenance-statements)
attestations, so `NPM_TOKEN` must permit publishing to the `@serpapi` scope.

Publish manually only as a fallback:

```bash
pnpm run build
clawhub login
clawhub package validate .
clawhub package publish . --family code-plugin --owner serpapi --dry-run
clawhub package publish . --family code-plugin --owner serpapi

npm publish --access public --dry-run
npm publish --access public
```

The `serpapi` organization is created once, by a maintainer, with:

```bash
clawhub publisher create serpapi --display-name "SerpApi"
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, tests, pull
request guidelines, and the release process.

## License

[MIT](LICENSE)
