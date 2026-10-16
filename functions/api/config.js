export const onRequestGet = ({ env }) =>
  Response.json({ clientId: env.GOOGLE_CLIENT_ID || null,
                  ready: !!(env.GOOGLE_CLIENT_ID && env.GITHUB_TOKEN && env.COOKS),
                  eth: !!(env.GITHUB_TOKEN && env.COOKS_ETH && env.SESSION_SECRET),
                  walletConnectProjectId: env.WALLETCONNECT_PROJECT_ID || null },
    { headers: { "cache-control": "no-store" } });
