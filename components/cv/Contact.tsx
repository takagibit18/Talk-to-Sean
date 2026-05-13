import { ArrowUpRight } from "lucide-react";
import SectionHeader from "./SectionHeader";
import WeChatModalTrigger from "./WeChatModalTrigger";
import type { CVData } from "@/lib/cv-data";

function toTelHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "tel:";
}

export default function Contact({
  data,
  talkToSeanUrl,
}: {
  data: CVData;
  talkToSeanUrl: string | null;
}) {
  const c = data.contact;
  const isExternalChat = talkToSeanUrl ? !talkToSeanUrl.startsWith("/") : false;

  const Row = ({
    label,
    value,
    href,
    external,
  }: {
    label: string;
    value: string;
    href: string;
    external?: boolean;
  }) => (
    <div className="cv-contact-link group">
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="focus-ring group min-w-0 flex-1"
      >
        <span className="mb-4 block text-sm font-semibold text-[color:var(--color-text-strong)]">
          {label}
        </span>
        <span className="cv-row-title block break-words transition group-hover:text-[color:var(--color-accent-strong)]">
          {value}
        </span>
      </a>
      <ArrowUpRight
        size={20}
        className="mt-9 shrink-0 text-[color:var(--color-text-muted)] transition group-hover:text-[color:var(--color-accent-strong)]"
      />
    </div>
  );

  return (
    <section id="contact" className="cv-section">
      <SectionHeader number="07" label={data.sections.contact} />
      <div className="cv-contact-panel">
        {c.phone && <Row label={c.phoneLabel} value={c.phone} href={toTelHref(c.phone)} />}
        {c.email && <Row label={c.emailLabel} value={c.email} href={`mailto:${c.email}`} />}
        {c.site && <Row label={c.siteLabel} value={c.site} href={c.siteHref} external />}
        {talkToSeanUrl && (
          <Row
            label={c.talkToSeanLabel}
            value={c.talkToSeanValue}
            href={talkToSeanUrl}
            external={isExternalChat}
          />
        )}
        <div className="cv-contact-link cv-contact-social">
          <div className="min-w-0 flex-1">
            <span className="mb-4 block text-sm font-semibold text-[color:var(--color-text-strong)]">
              {c.socialsLabel}
            </span>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {c.socials.map((s) =>
                s.href ? (
                  <a
                    key={`${s.label}-${s.href}`}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring group inline-flex items-center gap-2"
                  >
                    <span className="cv-row-title transition group-hover:text-[color:var(--color-accent-strong)]">
                      {s.label}
                    </span>
                    <ArrowUpRight
                      size={20}
                      className="text-[color:var(--color-text-muted)] transition group-hover:text-[color:var(--color-accent-strong)]"
                    />
                  </a>
                ) : s.kind === "wechat" && s.text ? (
                  <WeChatModalTrigger
                    key={`${s.label}-wechat`}
                    label={s.label}
                    wechatId={s.text}
                    modalCopy={c.weChat.modalCopy}
                    modalCopied={c.weChat.modalCopied}
                    modalCopyFailed={c.weChat.modalCopyFailed}
                    modalClose={c.weChat.modalClose}
                    modalQrAlt={c.weChat.modalQrAlt}
                  />
                ) : s.text ? (
                  <div
                    key={`${s.label}-${s.text}`}
                    className="inline-flex max-w-full flex-wrap items-baseline gap-x-2 gap-y-1"
                  >
                    <span className="cv-row-title text-[color:var(--color-text-strong)]">{s.label}</span>
                    <span className="text-base text-[color:var(--color-text)]">{s.text}</span>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
