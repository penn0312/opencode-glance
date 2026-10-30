# Releasing

Versions are published by the `Release` workflow when a `v*` tag is pushed. The workflow refuses a tag
that disagrees with `package.json`, verifies the committed GUI bundle, and skips a version that is
already on the registry, so a re-run is always safe.

## Current setup

`opencode-glance@0.1.1` was the first release. It was published by the workflow with a granular access
token stored as `NPM_TOKEN`, because npm does not let you configure a trusted publisher for a package
that does not exist yet.

That token bypasses 2FA and **must be replaced**. npm retires direct publishing for bypass-2FA tokens in
January 2027, and a long-lived publish token is a credential worth removing anyway.

### Switch to trusted publishing (once)

1. On npmjs.com open `opencode-glance` → **Settings** → **Trusted Publisher** → **GitHub Actions** and
   fill in:

   | Field | Value |
   | --- | --- |
   | Organization or user | `penn0312` |
   | Repository | `opencode-glance` |
   | Workflow filename | `release.yml` |
   | Environment | leave empty |

   The same configuration can be written from a logged-in CLI with npm 11.19 or later:

   ```bash
   npm trust github opencode-glance \
     --file release.yml \
     --repository penn0312/opencode-glance \
     --allow-publish
   ```

2. Delete the stored token:

   ```bash
   gh secret remove NPM_TOKEN
   ```

   The workflow checks the secret first: when it is empty it publishes through the OIDC exchange
   instead. Nothing else changes.

3. Confirm with a re-run of the latest release. The version already exists, so the publish steps are
   skipped and the run should finish green.

## Every release

```bash
npm version patch --no-git-tag-version   # or minor / major
npm run typecheck && npm test && npm run build
git commit -am "chore: release v0.1.2"   # use the version npm just wrote
git tag v0.1.2
git push --follow-tags
```

The tag push runs `Release`: it checks the tag against `package.json`, runs the tests, verifies that
`dist/gui-experimental.cjs` matches a fresh build, and publishes with provenance. `CI` runs on the branch
push as usual.

If the publish step fails, fix the cause and re-run the workflow from the Actions tab
(`workflow_dispatch`) on the same tag. Do not delete and re-push the tag.

## First publish, for reference

There is no supported way to publish a brand-new package through trusted publishing: npm configures
trusted publishers per existing package. The first version needs either an interactive publish
(`npm login && npm publish`) or a bypass-2FA granular token. Both leave the package ready for OIDC
afterwards.
