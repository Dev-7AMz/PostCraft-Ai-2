
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function cleanText(value, max = 1800) {
  return typeof value === "string"
    ? value.trim().slice(0, max)
    : "";
}

function extractText(result) {
  const candidates = [
    result?.response,
    result?.choices?.[0]?.message?.content,
    result?.output_text,
    result?.generated_text
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      const text = value
        .map(item => typeof item === "string" ? item : item?.text || "")
        .join("")
        .trim();

      if (text) return text;
    }
  }

  return "";
}

const MODEL = "@cf/zai-org/glm-4.7-flash";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "PostCraft AI",
        configured: Boolean(env.AI && typeof env.AI.run === "function"),
        provider: "Cloudflare Workers AI",
        model: MODEL
      });
    }

    if (url.pathname === "/api/generate" && request.method === "POST") {
      if (!env.AI || typeof env.AI.run !== "function") {
        return json({
          error: "Workers AI binding باسم AI غير متصل."
        }, 503);
      }

      let body;

      try {
        body = await request.json();
      } catch {
        return json({
          error: "تعذر قراءة البيانات المرسلة."
        }, 400);
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
        return json({
          error: "اكتب موضوع المنشور أولاً."
        }, 400);
      }

      const systemPrompt = action === "hashtags"
        ? `You are an expert social media hashtag strategist.
Generate relevant hashtags only.
No explanations or duplicates.
Use ${language}.`
        : `You are an expert social media copywriter.
Write engaging, natural social media content in ${language}.
Respect the platform, tone, audience and length.
Do not invent facts or statistics.
Return the finished post directly.`;

      const userPrompt = action === "hashtags"
        ? `Generate 12-18 relevant hashtags.

Topic: ${topic}
Platform: ${platform}
Audience: ${audience || "General"}
Keywords: ${keywords || "None"}

Return hashtags only.`
        : `Create one ready-to-publish social media post.

Topic: ${topic}
Platform: ${platform}
Language: ${language}
Tone: ${tone}
Length: ${length}
Audience: ${audience || "General"}
Keywords: ${keywords || "None"}
Call to action: ${callToAction || "Use a suitable call to action"}

Requirements:
- Start with an engaging opening.
- Use readable paragraphs.
- Use suitable emojis.
- Do not add an introductory explanation.
- Include 3-6 relevant hashtags at the end.`;

      try {
        const result = await env.AI.run(MODEL, {
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: userPrompt
            }
          ],
          max_tokens: action === "hashtags" ? 300 : 1000,
          temperature: 0.7,
          chat_template_kwargs: {
            enable_thinking: false,
            clear_thinking: true
          }
        });

        const output = extractText(result);

        if (!output) {
          console.error(
            "Empty AI response:",
            JSON.stringify(result).slice(0, 3000)
          );

          return json({
            error: "لم يُرجع النموذج نصاً. حاول مرة أخرى."
          }, 502);
        }

        return json({
          ok: true,
          output
        });

      } catch (error) {
        console.error("Workers AI error:", error);

        const message = String(error?.message || error || "");

        if (/limit|quota|rate|429|neuron/i.test(message)) {
          return json({
            error: "تم بلوغ حد الاستخدام المتاح حالياً. حاول لاحقاً."
          }, 429);
        }

        return json({
          error: "تعذر تشغيل النموذج: " + message.slice(0, 250)
        }, 502);
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return json({
        error: "المسار غير موجود."
      }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};
          
