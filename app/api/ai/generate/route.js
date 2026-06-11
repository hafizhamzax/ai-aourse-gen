export async function POST(req) {
  try {
    const { prompt } = await req.json();
    console.log("AI Generation Request for prompt length:", prompt?.length);
    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free";
    if (!apiKey) {
      return Response.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 500 });
    }
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!resp.ok) {
      let err;
      try {
        err = await resp.json();
      } catch {
        err = {};
      }
      const retryAfter = resp.headers.get("retry-after");
      return Response.json(
        { error: err?.error?.message || "OpenRouter request failed", status: resp.status, retryAfter },
        { status: resp.status }
      );
    }
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || "";
    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: String(e?.message || e) }, { status: 500 });
  }
}
