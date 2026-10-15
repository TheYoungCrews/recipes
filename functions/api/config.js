export const onRequestGet = ({ env }) =>
  Response.json({ clientId: env.GOOGLE_CLIENT_ID || null, ready: !!(env.GOOGLE_CLIENT_ID && env.GITHUB_TOKEN && env.COOKS) },
    { headers: { "cache-control": "no-store" } });
