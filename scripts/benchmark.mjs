/** Local deterministic-runtime smoke benchmark. Never a claim about model inference or platform scale. */
import { performance } from "node:perf_hooks";
const origin = process.env.PRESENCE_TEST_URL || "http://127.0.0.1:3001";
if (!["localhost", "127.0.0.1"].includes(new URL(origin).hostname))
  throw new Error("Local benchmark only");
let cookie = "";
async function request(path, body) {
  const response = await fetch(`${origin}/api/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  if (response.headers.get("set-cookie"))
    cookie = response.headers.get("set-cookie").split(";")[0];
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}
await request("demo", { role: "creator" });
const auth = await fetch(`${origin}/api/v1/creator`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Origin: origin,
    Cookie: cookie,
  },
  body: JSON.stringify({
    licenseStatus: "active",
    enabled: true,
    likenessAuthorized: true,
    voiceAuthorized: true,
  }),
});
if (!auth.ok) throw new Error("Authorization failed");
const sessions = await Promise.all(
  ["fan-alex", "fan-jordan", "fan-sam"].map((fanId) =>
    request("sessions", { fanId, surface: "text" }),
  ),
);
const latencies = [];
let last;
for (let i = 0; i < 30; i++) {
  const start = performance.now();
  last = await request(`sessions/${sessions[i % 3].sessionId}/messages`, {
    text: "What do you remember about me?",
    requestId: crypto.randomUUID(),
  });
  latencies.push(performance.now() - start);
}
latencies.sort((a, b) => a - b);
console.log(
  JSON.stringify(
    {
      measuredAt: new Date().toISOString(),
      mode: "optimized local build; deterministic adapter; loopback HTTP; no external inference",
      samples: 30,
      relationships: 3,
      medianMs: Number(latencies[15].toFixed(2)),
      p95Ms: Number(latencies[28].toFixed(2)),
      maxMs: Number(latencies[29].toFixed(2)),
      deliveredReplies: last.metrics.aiMessages,
      sandboxEvents: last.events.length,
      grossCents: last.metrics.sandboxRevenueCents,
      realCharges: 0,
      limitations:
        "Sequential smoke benchmark, not a concurrent-load or generative-model latency test.",
    },
    null,
    2,
  ),
);
