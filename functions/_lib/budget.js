// Hard daily cap for Workers AI so usage stays inside the 10,000-neuron free daily allocation (resets 00:00 UTC).
// Model: @cf/meta/llama-3.1-8b-instruct-fp8-fast = 4119 neurons / M input tokens, 34868 / M output tokens.
export const MODEL = "@cf/meta/llama-3.1-8b-instruct-fp8-fast";
export const MAX_ASKS = 200, MAX_NEURONS = 7000, MAX_TOKENS = 400, MAX_Q = 500;
const IN_RATE = 4119 / 1e6, OUT_RATE = 34868 / 1e6;
export const estTokens = s => Math.ceil(String(s).length / 3); // conservative (real ~4 chars/token)
export const neurons = (inTok, outTok) => inTok * IN_RATE + outTok * OUT_RATE;
const key = (now = Date.now()) => "ai:" + new Date(now).toISOString().slice(0, 10);
export async function reserve(kv, worstNeurons, now) {
  if (!kv) throw new Error("no counter");
  const k = key(now), cur = JSON.parse((await kv.get(k)) || '{"n":0,"neurons":0}');
  if (cur.n >= MAX_ASKS || cur.neurons + worstNeurons > MAX_NEURONS) return null;
  cur.n += 1; cur.neurons += worstNeurons;
  await kv.put(k, JSON.stringify(cur), { expirationTtl: 3 * 86400 });
  return cur;
}
