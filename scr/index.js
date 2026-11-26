const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const MODEL = "@cf/zai-org/glm-4.7-flash";
const MAX_BODY_SIZE = 36000;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function cleanText(value, max = 1800) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function textFromContent(value) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) {
    return value.map((part) => {
      if (typeof part === "string") return part;
      if (typeof part?.text === "string") return part.text;
      if (typeof part?.content === "string") return part.content;
      return "";
    }).filter(Boolean).join("\n").trim();
  }
  if (value && typeof value === "object") {
    if (typeof value.text === "string" && value.text.trim()) return value.text.trim();
    if (typeof value.content === "string" && value.content.trim()) return value.content.trim();
    if (Array.isArray(value.content)) return textFromContent(value.content);
    if (typeof value.response === "string" && value.response.trim()) return value.response.trim();
  }
  return "";
}

function extractText(result) {
  // Workers AI chat models normally return choices[0].message.content.
  // Keep fallbacks for other response envelopes, but skip empty candidates.
  if (typeof result === "string" && result.trim()) return result.trim();

  const candidates = [
    result?.choices?.[0]?.message?.content,
    result?.choices?.[0]?.text,
    result?.response,
    result?.output_text,
    result?.generated_text,
    result?.result?.response,
    result?.result?.choices?.[0]?.message?.content,
    result?.message?.content,
    result?.content
  ];

  for (const candidate of candidates) {
    const text = textFromContent(candidate);
    if (text) return text;
  }

  return "";
}

function parseModelJson(raw) {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      try {
        return JSON.parse(cleaned.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function recoverModelJson(raw) {
  const recovered = {};
  const postMatch = raw.match(/"post"\s*:\s*"((?:\\.|[^"\\])*)"/s);
  if (postMatch) {
    try { recovered.post = JSON.parse(`"${postMatch[1]}"`); } catch { /* ignore malformed field */ }
  }
  const tagMatch = raw.match(/"hashtags"\s*:\s*\[([\s\S]*?)(?:\]|$)/);
  if (tagMatch) {
    recovered.hashtags = [...tagMatch[1].matchAll(/"((?:\\.|[^"\\])*)"/g)].map((match) => {
      try { return JSON.parse(`"${match[1]}"`); } catch { return ""; }
    }).filter(Boolean);
  }
  return Object.keys(recovered).length ? recovered : null;
}

function normalizeHashtags(value) {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/\s+/)
      : [];

  const tags = [];
  for (const item of source) {
    const tag = String(item || "")
      .trim()
      .replace(/^#+/, "")
      .replace(/[^\p{L}\p{N}_]/gu, "");

    if (tag.length < 2) continue;
    const normalized = `#${tag}`;
    if (!tags.includes(normalized)) tags.push(normalized);
    if (tags.length >= 18) break;
  }
  return tags;
}

function fallbackHashtags(raw) {
  const matches = raw.match(/#[\p{L}\p{N}_]+/gu) || [];
  return normalizeHashtags(matches);
}

function platformName(value) {
  const allowed = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    youtube: "YouTube",
    x: "X",
    linkedin: "LinkedIn"
  };
  return allowed[value] || "Social media";
}

function toneName(value) {
  const allowed = {
    friendly: "Friendly and approachable",
    professional: "Professional",
    exciting: "Energetic",
    educational: "Educational",
    selling: "Promotional"
  };
  return allowed[value] || "Professional";
}

function lengthName(value) {
  const allowed = {
    short: "Short",
    medium: "Medium",
    long: "Detailed"
  };
  return allowed[value] || "Medium";
}

function buildPrompt(body, action) {
  const language = body.language === "en" ? "English" : "Arabic";
  const platform = platformName(body.platform);
  const topic = cleanText(body.topic, 1200);
  const audience = cleanText(body.audience, 300) || "General audience";
  const keywords = cleanText(body.keywords, 350) || "None";
  const tone = toneName(body.tone);
  const length = lengthName(body.length);
  const originalPost = cleanText(body.originalPost, 5000);
  const instruction = cleanText(body.instruction, 1200);

  if (action === "hashtags") {
    return {
      system: `You are a careful social media hashtag strategist. Reply only with valid JSON. Do not claim that a hashtag is trending or guaranteed to increase reach unless the user supplied verified trend data. Return relevant, specific, non-spammy tags in ${language}.`,
      user: `Create 8 to 15 relevant hashtags for this content topic.
Topic: ${topic}
Platform: ${platform}
Audience: ${audience}
Keywords: ${keywords}
Return exactly this JSON shape: {"hashtags":["tag1","tag2"]}. Do not include the # symbol inside the JSON values.`
    };
  }

  if (action === "edit") {
    return {
      system: `You are an expert social media editor and copywriter. Reply only with valid JSON. Preserve the original post's subject, intended meaning, and factual details unless the user explicitly asks to change them. Never invent facts, numbers, testimonials, offers, or guarantees. Write in ${language}.`,
      user: `Edit the existing post according to the user's instruction. Keep the same context and topic.
Platform: ${platform}
Tone: ${tone}
Length: ${length}
Audience: ${audience}
User instruction: ${instruction}
Original post:
${originalPost}

Return exactly this JSON shape:
{"post":"the complete revised post without hashtags","hashtags":["tag1","tag2"]}
The hashtags must fit the revised post and platform. Do not include the # symbol inside the JSON values.`
    };
  }

  return {
    system: `You are a skilled social media copywriter and hashtag strategist. Reply only with valid JSON. Create natural, useful, ready-to-publish content in ${language}. Do not invent facts, statistics, testimonials, product features, or guarantees. Avoid generic filler and avoid promising reach or virality.`,
    user: `Create one original social media post and matching hashtags.
Topic or idea: ${topic}
Platform: ${platform}
Writing tone: ${tone}
Length: ${length}
Target audience: ${audience}
Keywords to include naturally: ${keywords}
Add emojis: ${body.withEmoji !== false ? "Yes, sparingly" : "No"}
Add a call to action: ${body.withCTA !== false ? "Yes, natural and relevant" : "No"}

Write a strong opening, readable short paragraphs, and platform-appropriate wording.
Suggest 8 to 12 relevant hashtags: mix specific topic tags with a few broader tags. Do not use unrelated or spammy tags. Do not claim they are currently trending.

Return exactly this JSON shape:
{"post":"the complete post without hashtags","hashtags":["tag1","tag2"]}
Do not include the # symbol inside the JSON values.`
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health" && request.method === "GET") {
      const configured = Boolean(env.AI && typeof env.AI.run === "function");
      return json({
        ok: true,
        service: "PostCraft AI",
        configured,
        provider: "Cloudflare Workers AI",
        model: MODEL
      }, configured ? 200 : 503);
    }

    if (url.pathname === "/api/generate" && request.method === "POST") {
      if (!env.AI || typeof env.AI.run !== "function") {
        return json({
          error: "خدمة الذكاء الاصطناعي غير مربوطة. تأكد من إضافة Workers AI Binding باسم AI ثم أعد النشر."
        }, 503);
      }

      const contentType = request.headers.get("content-type") || "";
      if (!contentType.toLowerCase().includes("application/json")) {
        return json({ error: "صيغة الطلب غير مدعومة. أرسل البيانات بصيغة JSON." }, 415);
      }

      let rawBody;
      try {
        rawBody = await request.text();
      } catch {
        return json({ error: "تعذر قراءة البيانات المرسلة." }, 400);
      }

      if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_SIZE) {
        return json({ error: "حجم الطلب كبير جداً. اختصر النص وحاول مجدداً." }, 413);
      }

      let body;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return json({ error: "تعذر قراءة البيانات المرسلة." }, 400);
      }

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return json({ error: "بيانات الطلب غير صحيحة." }, 400);
      }

      if (body.action !== undefined && !["post", "edit", "hashtags"].includes(body.action)) {
        return json({ error: "نوع العملية غير معروف." }, 400);
      }

      const action = body.action || "post";

      const topic = cleanText(body?.topic, 1200);
      const originalPost = cleanText(body?.originalPost, 5000);
      const instruction = cleanText(body?.instruction, 1200);

      if (action === "edit" && !originalPost) {
        return json({ error: "لا يوجد منشور لتعديله. أنشئ منشوراً أولاً." }, 400);
      }
      if (action === "edit" && !instruction) {
        return json({ error: "اكتب التعديل الذي تريده أولاً." }, 400);
      }
      if (action !== "edit" && !topic) {
        return json({ error: "اكتب موضوع المنشور أولاً." }, 400);
      }

      const prompts = buildPrompt({ ...body, topic, originalPost, instruction }, action);

      try {
        const result = await env.AI.run(MODEL, {
          messages: [
            { role: "system", content: prompts.system },
            { role: "user", content: prompts.user }
          ],
          temperature: 0.7,
          max_completion_tokens: action === "hashtags" ? 300 : 1100,
          response_format: { type: "json_object" },
          chat_template_kwargs: { enable_thinking: false }
        });

        const raw = extractText(result);
        if (!raw) {
          return json({ error: "وصل رد فارغ من نموذج الذكاء الاصطناعي. حاول مرة أخرى." }, 502);
        }

        const parsed = parseModelJson(raw) || recoverModelJson(raw);

        if (action === "hashtags") {
          const hashtags = normalizeHashtags(parsed?.hashtags ?? fallbackHashtags(raw));
          if (!hashtags.length) {
            return json({ error: "لم نتمكن من استخراج هاشتاغات واضحة. حاول بصياغة موضوع أكثر تحديداً." }, 502);
          }
          return json({ ok: true, hashtags, output: hashtags.join(" ") });
        }

        const post = cleanText(parsed?.post, 7000) ||
          (parsed ? "" : raw.replace(/#[\p{L}\p{N}_]+/gu, "").trim());
        const hashtags = normalizeHashtags(parsed?.hashtags ?? fallbackHashtags(raw));

        if (!post) {
          return json({ error: "لم نحصل على نص منشور صالح. حاول مرة أخرى." }, 502);
        }

        return json({
          ok: true,
          post,
          hashtags,
          output: post
        });
      } catch (error) {
        const details = String(error?.message || "").toLowerCase();
        console.error("PostCraft Workers AI error:", error);

        if (
          details.includes("limit") ||
          details.includes("quota") ||
          details.includes("billing") ||
          details.includes("neuron") ||
          details.includes("rate")
        ) {
          return json({
            error: "تم بلوغ حد الاستخدام المتاح حالياً في Cloudflare AI. انتظر تجدد الحد أو راجع إعدادات الاستخدام."
          }, 429);
        }

        if (details.includes("model") || details.includes("not found")) {
          return json({
            error: "تعذر الوصول إلى نموذج الذكاء الاصطناعي. تحقق من توفر النموذج وربط Workers AI."
          }, 502);
        }

        return json({
          error: "حدث خطأ أثناء تشغيل الذكاء الاصطناعي. تحقق من إعدادات Cloudflare AI ثم حاول مجدداً."
        }, 502);
      }
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "المسار غير موجود." }, 404);
    }

    if (!env.ASSETS || typeof env.ASSETS.fetch !== "function") {
      return new Response("Static assets binding ASSETS is not configured.", { status: 500 });
    }

    return env.ASSETS.fetch(request);
  }
};
