# Contributing to `@serpapi/openclaw-plugin`

Thanks for helping improve the SerpApi plugin for OpenClaw.

## Development setup

The plugin requires Node 22.19+ and [pnpm](https://pnpm.io). Install the locked
development environment with:

```bash
pnpm install --frozen-lockfile
```

## Tests and checks

Run the type checker and the build before opening a pull request:

```bash
pnpm run typecheck
pnpm run build
```

Validate the packaged plugin against the ClawHub schema:

```bash
clawhub package validate .
```

There is no automated test suite yet. Verify behavior changes manually against a
local OpenClaw install with a real key:

```bash
export SERPAPI_API_KEY=your_private_api_key
openclaw plugins install file:.
```

Never commit an API key, and never paste one into an issue or pull request.

## Pull requests

- Keep each pull request focused on one change.
- Add or update tests when behavior changes.
- Update the documentation when the user-facing workflow changes.
- Make sure the type checker and the build pass.
- Specialized SerpApi verticals (news, flights, maps, shopping, scholar,
  finance, YouTube, hotels, events, e-commerce, etc.) should follow the existing
  tool pattern in `src/`, one vertical per pull request.

## Releasing

Releases are published from
[`serpapi/serpapi-openclaw-plugin`](https://github.com/serpapi/serpapi-openclaw-plugin)
to [npm](https://www.npmjs.com/package/@serpapi/openclaw-plugin) and to
[ClawHub](https://docs.openclaw.ai/clawhub). Both targets are enabled in the
`openclaw.release` section of `package.json`.

Releases will be published by GitHub Actions, triggered by publishing a GitHub
Release. The workflow will use npm trusted publishing, so the repository will
not need an `NPM_TOKEN` secret. That workflow is not in place yet, so until
`.github/workflows/release.yml` lands, a maintainer publishes manually with the
steps below.

### Publish a release

1. Set the package version:

   ```bash
   pnpm version 1.0.1 --no-git-tag-version
   ```

2. Run the full check set:

   ```bash
   pnpm install --frozen-lockfile
   pnpm run typecheck
   pnpm run build
   clawhub package validate .
   ```

3. Merge the version change into `main`.
4. Tag the release with `v` followed by the package version, such as `v1.0.1`,
   and publish a GitHub Release for that tag.
5. Publish the package:

   ```bash
   pnpm publish --access public
   clawhub package publish . --family code-plugin --dry-run
   clawhub package publish . --family code-plugin
   ```

`prepublishOnly` cleans `dist/` and rebuilds, so the published files always come
from a fresh build.

npm does not allow an uploaded version to be replaced. If publishing fails after
the tarball has reached the registry, increment the package version and create a
new GitHub Release.

### Compatibility

When the plugin starts relying on a newer OpenClaw plugin SDK, update all of
`peerDependencies.openclaw`, `openclaw.install.minHostVersion`,
`openclaw.compat`, and `openclaw.build` in `package.json` together, and note the
new minimum host version in the release notes.
