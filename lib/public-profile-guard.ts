type GuardLocale = "en" | "zh";

type GuardInput = {
  locale?: GuardLocale;
  userMessage: string;
  assistantMessage: string;
};

const PUBLIC_PROFILE = {
  englishName: "Sean Yu",
  chineseName: "欣禹行",
  chineseNamePinyin: "Xin Yuxing",
  email: "huali6641@gmail.com",
  phone: "+86 15061235115",
  wechat: "Sean_Yu3",
  github: "takagibit18",
} as const;

const UNKNOWN_REFUSAL = {
  en: "The public profile context does not contain that answer, so I should not guess or invent it.",
  zh: "公开个人档案上下文没有包含这个答案，因此我不能猜测或编造。",
} as const;

const CONTACT_ANSWER = {
  en: `Sean's public contact fields are email ${PUBLIC_PROFILE.email}, phone ${PUBLIC_PROFILE.phone}, WeChat ${PUBLIC_PROFILE.wechat}, and GitHub ${PUBLIC_PROFILE.github}.`,
  zh: `Sean 公开展示的联系方式是邮箱 ${PUBLIC_PROFILE.email}、电话 ${PUBLIC_PROFILE.phone}、微信 ${PUBLIC_PROFILE.wechat}、GitHub ${PUBLIC_PROFILE.github}。`,
} as const;

const CHINESE_NAME_ANSWER = {
  en: `Sean's public Chinese name is ${PUBLIC_PROFILE.chineseName} (${PUBLIC_PROFILE.chineseNamePinyin}).`,
  zh: `Sean 公开展示的中文名是${PUBLIC_PROFILE.chineseName}（${PUBLIC_PROFILE.chineseNamePinyin}）。`,
} as const;

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(?:\+\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,}\d{3,4}/g;

function normalizePhone(value: string) {
  const trimmed = value.trim();
  const prefix = trimmed.startsWith("+") ? "+" : "";
  return `${prefix}${trimmed.replace(/\D/g, "")}`;
}

function containsAny(value: string, terms: string[]) {
  const normalized = value.toLowerCase();
  return terms.some((term) => normalized.includes(term.toLowerCase()));
}

function isRefusal(answer: string) {
  return containsAny(answer, [
    "public profile context does not contain",
    "should not guess",
    "cannot guess",
    "can't verify",
    "公开个人档案上下文没有包含",
    "不能猜测",
    "无法确认",
  ]);
}

function isChineseNameQuestion(question: string) {
  return containsAny(question, [
    "chinese name",
    "real name",
    "legal name",
    "中文名",
    "真实姓名",
    "本名",
  ]);
}

function isContactQuestion(question: string) {
  return containsAny(question, [
    "contact",
    "email",
    "phone",
    "wechat",
    "github",
    "联系方式",
    "邮箱",
    "电话",
    "微信",
  ]);
}

function isPrivateIdentityQuestion(question: string) {
  return containsAny(question, [
    "home address",
    "address",
    "birthday",
    "birth date",
    "id number",
    "passport",
    "family",
    "住址",
    "家庭住址",
    "生日",
    "身份证",
    "护照",
    "家庭成员",
  ]);
}

function hasUnsupportedContact(answer: string) {
  const allowedEmails = new Set([PUBLIC_PROFILE.email.toLowerCase()]);
  const allowedPhones = new Set([normalizePhone(PUBLIC_PROFILE.phone)]);
  const emails = answer.match(EMAIL_PATTERN) || [];
  const phones = answer.match(PHONE_PATTERN) || [];

  if (emails.some((email) => !allowedEmails.has(email.toLowerCase()))) {
    return true;
  }

  return phones.some((phone) => !allowedPhones.has(normalizePhone(phone)));
}

export function guardPublicProfileAnswer({
  locale = "en",
  userMessage,
  assistantMessage,
}: GuardInput) {
  const answer = assistantMessage.trim();
  if (!answer) {
    return UNKNOWN_REFUSAL[locale];
  }

  if (isPrivateIdentityQuestion(userMessage) && !isRefusal(answer)) {
    return UNKNOWN_REFUSAL[locale];
  }

  if (isChineseNameQuestion(userMessage) && !answer.includes(PUBLIC_PROFILE.chineseName)) {
    return isRefusal(answer) ? answer : CHINESE_NAME_ANSWER[locale];
  }

  if ((isContactQuestion(userMessage) || hasUnsupportedContact(answer)) && hasUnsupportedContact(answer)) {
    return CONTACT_ANSWER[locale];
  }

  return answer;
}
