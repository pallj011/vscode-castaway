# Publishing Castaway

Everything needed to cut a release. The extension lives in two registries:

| Registry | Who uses it | Page |
|---|---|---|
| VS Code Marketplace | VS Code | <https://marketplace.visualstudio.com/items?itemName=john-palli.vscode-castaway> |
| Open VSX | VSCodium, Cursor, Windsurf, other forks | <https://open-vsx.org/extension/john-palli/vscode-castaway> |

Source: <https://github.com/pallj011/vscode-castaway>

## Release flow (VS Code Marketplace)

1. Make sure `npm test` passes and the working tree is committed.
2. Add a version section to `CHANGELOG.md` and commit it.
3. Publish (bumps the version, creates the `0.x.y` commit + `v0.x.y` tag,
   builds, and uploads):

   ```bash
   npx vsce publish patch      # or minor / major
   git push && git push --tags
   ```

4. The page updates within a few minutes. Manage the listing at the hub:
   <https://marketplace.visualstudio.com/manage/publishers/john-palli/extensions/vscode-castaway/hub>

### Marketplace credentials

- Publisher: **john-palli** (display name "John Palli"), managed at
  <https://marketplace.visualstudio.com/manage/publishers/john-palli>
- Auth is a **Personal Access Token from Azure DevOps** (not GitHub):
  <https://dev.azure.com> → user settings (top right) → Personal access
  tokens → New Token → Organization: *All accessible organizations* →
  Scopes: *Custom defined* → **Marketplace → Manage**.
- When the token expires, refresh the login with:

  ```bash
  npx vsce login john-palli   # paste the new PAT
  ```

## Release flow (Open VSX)

Open VSX doesn't auto-bump; publish the same vsix the Marketplace got:

```bash
npx vsce package                                   # produces vscode-castaway-<version>.vsix
npx ovsx publish vscode-castaway-<version>.vsix -p <TOKEN>
```

### Open VSX credentials (one-time setup)

1. Sign in at <https://open-vsx.org> with GitHub (`pallj011`).
2. Avatar → Settings → sign the **Publisher Agreement** (requires linking an
   Eclipse Foundation account; tokens are rejected as "Invalid access token"
   until this is done): <https://open-vsx.org/user-settings/profile>
3. Generate a token at <https://open-vsx.org/user-settings/tokens> — shown
   once, store it in a password manager.
4. Claim the namespace (first time only; must match the package.json
   `publisher`):

   ```bash
   npx ovsx create-namespace john-palli -p <TOKEN>
   ```

Optional: namespace verification (blue check) is requested by filing an
issue per <https://github.com/EclipseFdn/open-vsx.org/wiki/Namespace-Access>.

## Assets

- **Icon** (`media/icon.png`): regenerate with `node scripts/make-icon.js`,
  then rasterize per the comment at the top of that script.
- **README demo GIF** (`docs/demo.gif`): regenerate with
  `node scripts/make-demo.js` (needs Google Chrome + ffmpeg). Edit the
  `SEGMENTS` list in the script to feature different scenes.
- `docs/` and `scripts/` are excluded from the vsix via `.vscodeignore`;
  the marketplace loads the GIF from GitHub raw, so keep it committed.
