const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function cleanText(value, max = 1800) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "PostCraft AI",
        configured: Boolean(env.OPENAI_API_KEY),
        model: env.OPENAI_MODEL || "gpt-4o-mini"
      });
    }

    if (url.pathname === "/api/generate" && request.method === "POST") {
      if (!env.OPENAI_API_KEY) {
        return json({
          error: "لم يتم إعداد مفتاح OpenAI بعد. أضف OPENAI_API_KEY في Cloudflare Secrets."
        }, 503);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "تعذر قراءة البيانات المرسلة." }, 400);
      }

      const action = body.action === "hashtags" ? "hashtags" : "post";
      const topic = cleanText(body.topic, 1200);
      const platform = cleanText(body.platform, 80) || "عام";
      const language = body.language === "en" ? "English" : "Arabic";
      const tone = cleanText(body.tone, 80) || "احترافي";
      const audience = cleanText(body.audience, 300);
      const keywords = cleanText(body.keywords, 300);
      const length = cleanText(body.length, 40) || "متوسط";
      const callToAction = cleanText(body.callToAction, 240);

      if (!topic) {
        return json({ error: "اكتب موضوع المنشور أولاً." }, 400);
      }

      const systemPrompt = action === "hashtags"
        ? `You are a social media hashtag strategist. Return only useful hashtags for the topic. Avoid explanations, duplicates, and misleading tags. Output in ${language}.`
        : `You are an expert social media copywriter. Write polished, natural, engaging content. Output in ${language}. Respect the requested platform and tone. Do not invent facts, statistics, testimonials, or guarantees.`;

      const userPrompt = action === "hashtags"
        ? `Suggest 12-18 relevant hashtags for this topic.
Topic: ${topic}
Platform: ${platform}
Audience: ${audience || "General"}
Keywords: ${keywords || "None"}
Return hashtags only, separated by spaces.`
        : `Create one ready-to-publish social media post.
Topic/brief: ${topic}
Platform: ${platform}
Language: ${language}
Tone: ${tone}
Length: ${length}
Target audience: ${audience || "General"}
Keywords to include naturally: ${keywords || "None"}
Call to action: ${callToAction || "Use a suitable natural call to action"}
Requirements: Start with an engaging opening, use readable short paragraphs, keep emojis tasteful and relevant, and do not add a heading such as "Here is your post". Include 3-6 relevant hashtags at the end.`;

      try {
        const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "content-type": "application/json"
          },
          body: JSON.stringify({
            model: env.OPENAI_MODEL || "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: action === "hashtags" ? 220 : 850
          })
        });

        const result = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          const message = result?.error?.message || "حدث خطأ أثناء الاتصال بخدمة OpenAI.";
          return json({ error: message }, upstream.status === 429 ? 429 : 502);
        }

        const output = result?.choices?.[0]?.message?.content?.trim();
        if (!output) return json({ error: "لم يصل محتوى من نموذج الذكاء الاصطناعي. حاول مرة أخرى." }, 502);

        return json({ ok: true, output });
      } catch {
        return json({ error: "تعذر الاتصال بخدمة الذكاء الاصطناعي. تحقق من الاتصال ثم حاول مجدداً." }, 502);
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "المسار غير موجود." }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};
