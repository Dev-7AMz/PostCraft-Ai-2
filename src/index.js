
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const AI_MODEL = "@cf/zai-org/glm-4.7-flash";

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

function extractOutput(result) {
  const content =
    result?.choices?.[0]?.message?.content ??
    result?.response ??
    result?.output_text ??
    result?.generated_text ??
    "";

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map(part =>
        typeof part === "string" ? part : part?.text || ""
      )
      .join("")
      .trim();
  }

  return "";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (
      url.pathname === "/api/health" &&
      request.method === "GET"
    ) {
      return json({
        ok: true,
        service: "PostCraft AI",
        configured: Boolean(env.AI),
        provider: "Cloudflare Workers AI",
        model: AI_MODEL
      });
    }

    if (
      url.pathname === "/api/generate" &&
      request.method === "POST"
    ) {
      if (!env.AI || typeof env.AI.run !== "function") {
        return json({
          error: "خدمة الذكاء الاصطناعي غير مربوطة بعد. أضف Workers AI Binding باسم AI في إعدادات Cloudflare ثم أعد النشر."
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

      const action =
        body.action === "hashtags" ? "hashtags" : "post";

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
        const result = await env.AI.run(AI_MODEL, {
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
          temperature: 0.8,
          max_tokens: action === "hashtags" ? 220 : 850
        });

        const output = extractOutput(result);

        if (!output) {
          return json({
            error: "وصل رد فارغ من نموذج الذكاء الاصطناعي. حاول مرة أخرى."
          }, 502);
        }

        return json({
          ok: true,
          output
        });

      } catch (error) {
        const details = String(error?.message || "");
        const lower = details.toLowerCase();

        if (
          lower.includes("limit") ||
          lower.includes("quota") ||
          lower.includes("billing") ||
          lower.includes("neurons") ||
          lower.includes("rate")
        ) {
          return json({
            error: "تم الوصول إلى حد الاستخدام المتاح حالياً في Cloudflare AI. انتظر حتى يتجدد الحد ثم حاول مجدداً."
          }, 429);
        }

        return json({
          error: "تعذر تشغيل نموذج الذكاء الاصطناعي في Cloudflare. تأكد من تفعيل Workers AI Binding باسم AI وأن النموذج متاح لحسابك."
        }, 502);
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return json({
        error: "المسار غير موجود."
      }, 404);
    }

    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return json({
        error: "إعدادات ملفات الموقع الثابتة غير مكتملة."
      }, 500);
    }

    return env.ASSETS.fetch(request);
  }
};
