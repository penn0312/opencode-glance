# Releasing

Versions are published by the `Release` workflow when a `v*` tag is pushed. The workflow refuses to
publish when the tag and `package.json` disagree, and it verifies the committed GUI bundle before it
touches the registry.

## One-time bootstrap (only before the first npm release)

npm does not let you configure trusted publishing for a package that does not exist yet, and the
registry requires 2FA or a granular token with **bypass 2FA** for the first publish of any package.
The first release therefore needs a token:

1. Create a granular access token at npmjs.com → **Access Tokens** → **Generate New Token** with
   **Read and write** and **Bypass 2FA** enabled. The flag is fixed at creation time.
2. Store it for the workflow:

   ```bash
   gh secret set NPM_TOKEN
   ```

3. Push the release tag (see below). `opencode-glance@0.1.1` and every later version can be published
   by the workflow.

After the first version exists, the token can be replaced by OIDC trusted publishing:

```bash
npm trust github opencode-glance --file release.yml --repository penn0312/opencode-glance --allow-publish
```

Then delete the `NODE_AUTH_TOKEN` environment block from `.github/workflows/release.yml`, so npm uses
the workflow's `id-token` instead of a stored secret.

## Every release

```bash
npm version patch --no-git-tag-version   # or minor / major
npm run typecheck && npm test && npm run build
git commit -am "chore: release v0.1.1"   # use the version npm just wrote
git tag v0.1.1
git push --follow-tags
```

The tag push runs `Release`: it checks the tag against `package.json`, runs the tests, verifies that
`dist/gui-experimental.cjs` matches a fresh build, and publishes with provenance. `CI` runs on the
branch push as usual.

If the publish step fails, fix the cause and re-run the workflow from the Actions tab
(`workflow_dispatch`) on the same commit. Do not delete and re-push the tag.
