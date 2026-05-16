# Preview Contract

Use one local preview surface for this portfolio:

```txt
http://127.0.0.1:4182/
```

Do not add source-level stage query tags to imports such as `App.tsx?t=...`.

Before sharing a preview URL, run:

```sh
npm run verify
npm run check:preview
```

`check:preview` expects the existing local server to be running. It does not start a new dev server.

If `check:preview` is run from a sandboxed environment, localhost network access must be allowed for that command. A fetch failure means the checker could not reach the local server; it does not mean a browser plugin is required.
