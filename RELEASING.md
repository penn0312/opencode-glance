# Releasing

Versions are published by the `Release` workflow when a `v*` tag is pushed. The workflow refuses a tag
that disagrees with `package.json`, verifies the committed GUI bundle, and skips a version that is
already on the registry.

It publishes with [trusted publishing](https://docs.npmjs.com/trusted-publishers): the runner exchanges
its OIDC identity for a short-lived registry credential, so the repository stores no npm token. npm only
allows configuring a trusted publisher for a package that already exists, which is why the first release
is manual.

## Bootstrap (only once, before the first npm release)

1. Publish the first version from a local checkout:

   ```bash
   npm login
   npm publish          # prepublishOnly runs typecheck, tests, and the GUI build
   ```

2. Point npm at this repository as the package's trusted publisher:

   ```bash
   npm trust github opencode-glance \
     --file release.yml \
     --repository penn0312/opencode-glance \
     --allow-publish
   ```

3. Record the version on GitHub. The workflow sees the version on the registry and skips the publish,
   so this is a no-op apart from the tag itself:

   ```bash
   git tag v0.1.1
   git push origin v0.1.1
   ```

Every later version is fully automatic.

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
(`workflow_dispatch`) on the same commit. Do not delete and re-push the tag.
