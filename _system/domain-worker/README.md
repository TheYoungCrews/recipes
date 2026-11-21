# recipes.crews.fyi proxy

A small Cloudflare Worker that serves the Blind Tiger site at `https://recipes.crews.fyi`. It forwards each request to `https://blind-tiger.pages.dev` and rewrites `Location` headers plus cookie `Domain` attributes so sign-in stays host-only on the custom hostname.

Deploy (from this folder, with a Cloudflare API token in the environment):

```
npx wrangler deploy
```

The `pages.dev` address keeps working. Do not put secrets in this folder.
