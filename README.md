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

Specialized SerpApi verticals (news, flights, maps, shopping, scholar, finance,
YouTube, hotels, events, e-commerce, etc.) follow the same tool pattern and are
added as dedicated tools in subsequent releases, delivered through pull
requests.

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

## License

MIT
