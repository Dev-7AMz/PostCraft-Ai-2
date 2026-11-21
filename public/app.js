const $ = (id) => document.getElementById(id);

let language = "ar";
let lastTopic = "";
let lastPost = "";
let lastHashtags = [];

const words = {
  ar: {
    navWriter:"كاتب المنشورات",navTags:"الهاشتاغات",navEngagement:"حاسبة التفاعل",
    checking:"جارٍ التحقق",connected:"الذكاء الاصطناعي متصل",disconnected:"الذكاء الاصطناعي غير متصل",
    heroKicker:"مساحة عمل ذكية لصناعة المحتوى",
    heroTitle:'أفكارك تستحق أن تتحول إلى محتوى <em>استثنائي.</em>',
    heroText:"اكتب فكرتك، دع الذكاء الاصطناعي يصوغها، ثم عدّلها واختر هاشتاغات تناسب منصتك.",
    pointOne:"كتابة وتحرير ذكي",pointTwo:"اقتراح هاشتاغات",pointThree:"عربي وإنجليزي",
    adLabel:"مساحة إعلانية",adPlaceholder:"سيظهر الإعلان هنا بعد تفعيل شبكة الإعلانات.",
    writerTitle:"استوديو المنشورات",writerDesc:"أنشئ منشوراً ثم طوّره مع مساعد التحرير.",
    ideaTitle:"ابدأ بفكرتك",topicLabel:"ما موضوع المنشور؟",
    topicPlaceholder:"اكتب الفكرة أو الرسالة التي تريد إيصالها...",topicHint:"كلما كانت الفكرة أوضح، كانت النتيجة أفضل.",
    platformLabel:"منصة النشر",toneLabel:"أسلوب الكتابة",toneFriendly:"ودّي وقريب",toneProfessional:"احترافي",
    toneExciting:"حماسي",toneEducational:"تعليمي",toneSelling:"تسويقي",lengthLabel:"طول المنشور",
    short:"قصير",medium:"متوسط",long:"مفصّل",audienceLabel:"الجمهور المستهدف",optional:"اختياري",
    audiencePlaceholder:"مثال: أصحاب المشاريع الصغيرة",keywordsLabel:"كلمات أو نقاط مهمة",
    keywordsPlaceholder:"مثال: الجودة، الثقة، التوصيل",withEmoji:"إضافة رموز تعبيرية",withCTA:"إضافة دعوة للتفاعل",
    generateButton:"أنشئ منشوري بالذكاء الاصطناعي",aiNote:"يستخدم الموقع Cloudflare Workers AI ولا يحتاج إلى مفتاح OpenAI.",
    resultTitle:"منشورك الجاهز",waiting:"بانتظار فكرتك",emptyTitle:"مساحتك الإبداعية جاهزة",
    emptyText:"أدخل فكرتك واضغط زر الإنشاء لتظهر المسودة هنا.",sampleCoffee:"مشروع جديد",sampleTips:"نصائح مفيدة",
    draftLabel:"مسودة قابلة للتعديل",copyPost:"نسخ المنشور",regenerate:"صياغة أخرى ↻",
    words:"كلمة تقريباً",editable:"يمكنك تعديل النص مباشرة.",suggestedTags:"هاشتاغات مقترحة",
    tagsSubtitle:"مختارة لتناسب موضوع المنشور والمنصة",copyTags:"نسخ الهاشتاغات",
    editTitle:"عدّل المنشور مع الحفاظ على سياقه",editSubtitle:"اطلب تغييراً محدداً وسيعيد المساعد صياغة النص الحالي.",
    editPlaceholder:"مثال: اجعله أكثر إقناعاً واختصر المقدمة...",editButton:"تطبيق التعديل",
    tip:"راجع التفاصيل قبل النشر، خصوصاً الأسعار والمعلومات الخاصة بمنتجك.",
    hashtagsTitle:"مستكشف الهاشتاغات",hashtagsDesc:"احصل على اقتراحات مرتبطة بموضوعك ومنصة النشر.",
    hashtagFormTitle:"ما موضوع محتواك؟",hashtagTopicLabel:"موضوع المحتوى",
    hashtagPlaceholder:"مثال: مراجعة هاتف جديد...",makeTags:"اقترح الهاشتاغات",
    tagNote:"الاقتراحات مولّدة بالذكاء الاصطناعي وليست قائمة ترندات مباشرة.",
    tagResultTitle:"اقتراحاتك",tagEmptyText:"ستظهر الهاشتاغات هنا بعد إدخال الموضوع.",copyAllTags:"نسخ الكل",
    engagementTitle:"حاسبة معدل التفاعل",engagementDesc:"احسب معدل التفاعل التقريبي على منشورك.",
    calcTitle:"افهم أداء منشورك",calcText:"أدخل أرقام التفاعل لمعرفة النسبة التقريبية.",
    followers:"عدد المتابعين",likes:"الإعجابات",comments:"التعليقات",shares:"المشاركات والحفظ",
    calculate:"احسب معدل التفاعل",engagementRate:"معدل التفاعل التقريبي",
    formula:"المعادلة: مجموع التفاعلات ÷ عدد المتابعين × 100. النتيجة تقديرية.",
    closingTitle:"اصنع محتوى يحمل بصمتك.",closingText:"ابدأ بفكرة واضحة، حسّنها، ثم شاركها مع جمهورك.",
    backWriter:"إنشاء منشور جديد",footer:"صُنع لمساعدتك على صناعة محتوى أفضل.",
    needTopic:"اكتب فكرة المنشور أولاً.",needTags:"اكتب موضوع الهاشتاغات أولاً.",
    needPost:"أنشئ منشوراً أولاً قبل طلب تعديله.",needInstruction:"اكتب التعديل الذي تريده أولاً.",
    copied:"تم النسخ بنجاح.",copyFailed:"تعذر النسخ. يمكنك تحديد النص ونسخه يدوياً.",
    generating:"جارٍ إنشاء المنشور...",editing:"جارٍ تعديل المنشور...",tagging:"جارٍ اقتراح الهاشتاغات...",
    generated:"تم إنشاء المنشور والهاشتاغات",edited:"تم تعديل المنشور بنجاح",tagged:"تم اقتراح الهاشتاغات",
    waitingStatus:"بانتظار فكرتك",needFollowers:"أدخل عدد متابعين أكبر من صفر.",
    invalidNumbers:"تأكد من أن أرقام التفاعل ليست سالبة.",lowEng:"هناك مجال لتحسين التفاعل. جرّب سؤال جمهورك أو إضافة دعوة واضحة للتفاعل.",
    midEng:"نتيجة جيدة كبداية. استمر في اختبار أنواع المحتوى وأوقات النشر.",
    highEng:"تفاعل قوي! راجع المنشورات الناجحة وكرر العناصر التي تناسب جمهورك.",
    apiError:"تعذر الاتصال بالخدمة. تحقق من اتصال الإنترنت وحاول مجدداً."
  },
  en: {
    navWriter:"Post writer",navTags:"Hashtags",navEngagement:"Engagement",
    checking:"Checking",connected:"AI connected",disconnected:"AI unavailable",
    heroKicker:"Your intelligent content workspace",
    heroTitle:'Your ideas deserve to become <em>standout content.</em>',
    heroText:"Share your idea, let AI shape it, then edit the draft and choose hashtags for your platform.",
    pointOne:"AI writing and editing",pointTwo:"Hashtag suggestions",pointThree:"Arabic and English",
    adLabel:"Advertisement",adPlaceholder:"An ad will appear here after ad network activation.",
    writerTitle:"Post studio",writerDesc:"Create a post, then refine it with the editing assistant.",
    ideaTitle:"Start with your idea",topicLabel:"What is your post about?",
    topicPlaceholder:"Write the idea or message you want to share...",topicHint:"Clearer ideas usually lead to better results.",
    platformLabel:"Publishing platform",toneLabel:"Writing style",toneFriendly:"Friendly",toneProfessional:"Professional",
    toneExciting:"Energetic",toneEducational:"Educational",toneSelling:"Promotional",lengthLabel:"Post length",
    short:"Short",medium:"Medium",long:"Detailed",audienceLabel:"Target audience",optional:"Optional",
    audiencePlaceholder:"Example: small business owners",keywordsLabel:"Important words or points",
    keywordsPlaceholder:"Example: quality, trust, delivery",withEmoji:"Add emojis",withCTA:"Add a call to action",
    generateButton:"Generate with AI",aiNote:"Powered by Cloudflare Workers AI. No OpenAI API key is required.",
    resultTitle:"Your ready-to-edit post",waiting:"Waiting for your idea",emptyTitle:"Your creative space is ready",
    emptyText:"Enter your idea and generate a draft to see it here.",sampleCoffee:"New business",sampleTips:"Useful tips",
    draftLabel:"Editable draft",copyPost:"Copy post",regenerate:"Try another version ↻",
    words:"approx. words",editable:"Edit the text directly if needed.",suggestedTags:"Suggested hashtags",
    tagsSubtitle:"Selected for your topic and platform",copyTags:"Copy hashtags",
    editTitle:"Edit while keeping the original context",editSubtitle:"Describe a change and the assistant will revise the current draft.",
    editPlaceholder:"Example: Make it more persuasive and shorten the opening...",editButton:"Apply edit",
    tip:"Review details before publishing, especially prices and product information.",
    hashtagsTitle:"Hashtag explorer",hashtagsDesc:"Get suggestions related to your topic and platform.",
    hashtagFormTitle:"What is your content about?",hashtagTopicLabel:"Content topic",
    hashtagPlaceholder:"Example: review of a new phone...",makeTags:"Suggest hashtags",
    tagNote:"Suggestions are AI-generated, not live trend data.",
    tagResultTitle:"Your suggestions",tagEmptyText:"Your hashtags will appear here after you enter a topic.",copyAllTags:"Copy all",
    engagementTitle:"Engagement calculator",engagementDesc:"Estimate the engagement rate of a post.",
    calcTitle:"Understand your post performance",calcText:"Enter engagement numbers to estimate the rate.",
    followers:"Followers",likes:"Likes",comments:"Comments",shares:"Shares and saves",
    calculate:"Calculate engagement",engagementRate:"Estimated engagement rate",
    formula:"Formula: total interactions ÷ followers × 100. This is an estimate.",
    closingTitle:"Create content with your own signature.",closingText:"Start with a clear idea, refine it, and share it with your audience.",
    backWriter:"Create a new post",footer:"Made to help you create better content.",
    needTopic:"Please enter a post idea first.",needTags:"Please enter a hashtag topic first.",
    needPost:"Create a post before asking to edit it.",needInstruction:"Describe the change you want first.",
    copied:"Copied successfully.",copyFailed:"Copy failed. Select the text and copy it manually.",
    generating:"Generating your post...",editing:"Editing your post...",tagging:"Finding hashtags...",
    generated:"Post and hashtags created",edited:"Post updated successfully",tagged:"Hashtags suggested",
    waitingStatus:"Waiting for your idea",needFollowers:"Enter a follower count greater than zero.",
    invalidNumbers:"Engagement numbers cannot be negative.",lowEng:"There is room to improve. Try asking your audience a question or adding a clear call to action.",
    midEng:"A good starting point. Keep testing content formats and posting times.",
    highEng:"Strong engagement! Review successful posts and repeat what resonates with your audience.",
    apiError:"Could not connect to the service. Check your internet connection and try again."
  }
};

function t(key) {
  return words[language][key] || words.ar[key] || key;
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 2600);
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!words[language][key]) return;
    if (key === "heroTitle") el.innerHTML = words[language][key];
    else el.textContent = words[language][key];
  });

  document.querySelectorAll("[data-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.placeholder);
  });

  $("languageToggle").textContent = language === "ar" ? "EN" : "عربي";
  document.title = language === "ar"
    ? "PostCraft AI — استوديو صناعة المحتوى"
    : "PostCraft AI — Content Studio";
  updateWordCount();
}

function switchPage(page) {
  document.querySelectorAll(".page").forEach((el) => {
    el.classList.toggle("active", el.id === `page-${page}`);
  });
  document.querySelectorAll("[data-page]").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === page);
  });
  $("mobileNav").classList.remove("open");
  $("mobileMenu").setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function apiRequest(payload) {
  let response;
  try {
    response = await fetch("/api/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, language })
    });
  } catch {
    throw new Error(t("apiError"));
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(t("apiError"));
  }

  if (!response.ok || !data.ok) {
    throw new Error(data.error || t("apiError"));
  }
  return data;
}

function setBusy(button, busy, label) {
  if (!button) return;
  if (busy) {
    button.dataset.originalText = button.querySelector("span")?.textContent || button.textContent;
    const span = button.querySelector("span");
    if (span) span.textContent = label;
    button.disabled = true;
  } else {
    const span = button.querySelector("span");
    if (span && button.dataset.originalText) span.textContent = button.dataset.originalText;
    button.disabled = false;
  }
}

function setResultStatus(message, type = "") {
  const el = $("resultStatus");
  el.className = `status-pill ${type}`.trim();
  el.querySelector("span").textContent = message;
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return [...new Set(tags.map((tag) => {
    const clean = String(tag).trim().replace(/^#+/, "").replace(/[^\p{L}\p{N}_]/gu, "");
    return clean ? `#${clean}` : "";
  }).filter(Boolean))].slice(0, 18);
}

function renderTags(container, tags) {
  container.replaceChildren();
  tags.forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tag-chip";
    button.textContent = tag;
    button.addEventListener("click", () => copyText(tag));
    container.appendChild(button);
  });
}

function updateWordCount() {
  const value = $("postOutput").value.trim();
  const count = value ? value.split(/\s+/).length : 0;
  $("wordCount").textContent = count;
}

function showPost(post, hashtags) {
  lastPost = post;
  lastHashtags = normalizeTags(hashtags);
  $("postOutput").value = post;
  $("emptyState").classList.add("hidden");
  $("postOutputWrap").classList.remove("hidden");
  $("editBox").classList.remove("hidden");
  renderTags($("tagList"), lastHashtags);
  updateWordCount();
}

async function makePost() {
  const topic = $("topic").value.trim();
  if (!topic) {
    toast(t("needTopic"));
    $("topic").focus();
    return;
  }

  lastTopic = topic;
  const button = $("generatePost");
  setBusy(button, true, t("generating"));
  setResultStatus(t("generating"));

  try {
    const data = await apiRequest({
      action: "post",
      topic,
      platform: $("platform").value,
      tone: $("tone").value,
      length: $("length").value,
      audience: $("audience").value.trim(),
      keywords: $("keywords").value.trim(),
      withEmoji: $("withEmoji").checked,
      withCTA: $("withCTA").checked
    });

    showPost(data.post || data.output || "", data.hashtags || []);
    setResultStatus(t("generated"), "success");
    $("editInstruction").value = "";
  } catch (error) {
    setResultStatus(language === "ar" ? "تعذر الإنشاء" : "Generation failed", "error");
    toast(error.message || t("apiError"));
  } finally {
    setBusy(button, false);
  }
}

async function editPost() {
  if (!lastPost) {
    toast(t("needPost"));
    return;
  }

  const instruction = $("editInstruction").value.trim();
  if (!instruction) {
    toast(t("needInstruction"));
    $("editInstruction").focus();
    return;
  }

  const button = $("editPost");
  setBusy(button, true, t("editing"));
  try {
    const data = await apiRequest({
      action: "edit",
      topic: lastTopic,
      originalPost: $("postOutput").value || lastPost,
      instruction,
      platform: $("platform").value,
      tone: $("tone").value,
      length: $("length").value,
      audience: $("audience").value.trim(),
      keywords: $("keywords").value.trim()
    });
    showPost(data.post || data.output || "", data.hashtags || []);
    setResultStatus(t("edited"), "success");
    $("editInstruction").value = "";
    toast(t("edited"));
  } catch (error) {
    toast(error.message || t("apiError"));
  } finally {
    setBusy(button, false);
  }
}

async function makeHashtags() {
  const topic = $("hashtagTopic").value.trim();
  if (!topic) {
    toast(t("needTags"));
    $("hashtagTopic").focus();
    return;
  }

  const button = $("generateTags");
  setBusy(button, true, t("tagging"));
  try {
    const data = await apiRequest({
      action: "hashtags",
      topic,
      platform: $("hashtagPlatform").value
    });
    const tags = normalizeTags(data.hashtags || []);
    renderTags($("standaloneTagList"), tags);
    $("tagCount").textContent = String(tags.length);
    $("tagEmpty").classList.toggle("hidden", tags.length > 0);
    $("copyAllTags").classList.toggle("hidden", tags.length === 0);
    toast(t("tagged"));
  } catch (error) {
    toast(error.message || t("apiError"));
  } finally {
    setBusy(button, false);
  }
}

async function copyText(value) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
    } else {
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    toast(t("copied"));
  } catch {
    toast(t("copyFailed"));
  }
}

function calculateEngagement() {
  const followers = Number($("followers").value);
  const likes = Number($("likes").value || 0);
  const comments = Number($("comments").value || 0);
  const shares = Number($("shares").value || 0);

  if (!Number.isFinite(followers) || followers <= 0) {
    toast(t("needFollowers"));
    $("followers").focus();
    return;
  }
  if ([likes, comments, shares].some((value) => !Number.isFinite(value) || value < 0)) {
    toast(t("invalidNumbers"));
    return;
  }

  const rate = ((likes + comments + shares) / followers) * 100;
  $("engagementValue").textContent = `${rate.toFixed(2)}%`;
  $("engagementAdvice").textContent = rate < 1
    ? t("lowEng")
    : rate < 4
      ? t("midEng")
      : t("highEng");
  $("engagementResult").classList.remove("hidden");
}

async function checkHealth() {
  const status = $("connectionStatus");
  status.classList.remove("ready", "failed");
  $("connectionText").textContent = t("checking");
  try {
    const response = await fetch("/api/health", { cache: "no-store" });
    const data = await response.json();
    if (response.ok && data.configured) {
      status.classList.add("ready");
      $("connectionText").textContent = t("connected");
    } else {
      status.classList.add("failed");
      $("connectionText").textContent = t("disconnected");
    }
  } catch {
    status.classList.add("failed");
    $("connectionText").textContent = t("disconnected");
  }
}

function bindEvents() {
  document.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => switchPage(button.dataset.page));
  });

  $("languageToggle").addEventListener("click", () => {
    language = language === "ar" ? "en" : "ar";
    applyLanguage();
    checkHealth();
  });

  $("mobileMenu").addEventListener("click", () => {
    const open = $("mobileNav").classList.toggle("open");
    $("mobileMenu").setAttribute("aria-expanded", String(open));
  });

  $("topic").addEventListener("input", () => {
    $("topicCount").textContent = `${$("topic").value.length} / 1200`;
  });

  $("generatePost").addEventListener("click", makePost);
  $("regeneratePost").addEventListener("click", makePost);
  $("editPost").addEventListener("click", editPost);
  $("generateTags").addEventListener("click", makeHashtags);
  $("calculate").addEventListener("click", calculateEngagement);

  $("copyPost").addEventListener("click", () => {
    const post = $("postOutput").value.trim();
    if (post) copyText(post);
  });

  $("copyTags").addEventListener("click", () => {
    if (lastHashtags.length) copyText(lastHashtags.join(" "));
  });

  $("copyAllTags").addEventListener("click", () => {
    const tags = [...$("standaloneTagList").querySelectorAll(".tag-chip")]
      .map((button) => button.textContent);
    if (tags.length) copyText(tags.join(" "));
  });

  $("postOutput").addEventListener("input", () => {
    lastPost = $("postOutput").value;
    updateWordCount();
  });

  $("backToWriter").addEventListener("click", () => {
    switchPage("writer");
    $("topic").focus();
  });

  document.querySelectorAll("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      $("topic").value = button.dataset.sample;
      $("topic").dispatchEvent(new Event("input"));
      $("topic").focus();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  applyLanguage();
  checkHealth();
});
