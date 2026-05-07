"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface WeChatModalTriggerProps {
  label: string;
  wechatId: string;
  modalCopy: string;
  modalCopied: string;
  modalCopyFailed: string;
  modalClose: string;
  modalQrAlt: string;
}

export default function WeChatModalTrigger({
  label,
  wechatId,
  modalCopy,
  modalCopied,
  modalCopyFailed,
  modalClose,
  modalQrAlt,
}: WeChatModalTriggerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [showQr, setShowQr] = useState(true);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const id = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      window.cancelAnimationFrame(id);
    };
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wechatId);
      setCopyStatus("ok");
    } catch {
      setCopyStatus("fail");
    }
    window.setTimeout(() => setCopyStatus("idle"), 2800);
  };

  const openModal = () => {
    setCopyStatus("idle");
    setShowQr(true);
    setOpen(true);
  };

  const modal =
    open && mounted ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            role="presentation"
            onClick={() => setOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-[201] max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[var(--radius-card)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-bg-elevated)] p-6 shadow-[var(--shadow-lift)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                ref={closeBtnRef}
                type="button"
                className="focus-ring absolute right-3 top-3 rounded-full p-2 text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text-strong)]"
                aria-label={modalClose}
                onClick={() => setOpen(false)}
              >
                <X size={20} aria-hidden />
              </button>

              <h2 id={titleId} className="cv-row-title pr-12">
                {label}
              </h2>

              <p className="mt-5 break-all font-mono text-lg leading-relaxed text-[color:var(--color-text-strong)]">
                {wechatId}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button type="button" className="cv-cta cv-cta-primary text-sm" onClick={handleCopy}>
                  {modalCopy}
                </button>
              </div>

              {(copyStatus === "ok" || copyStatus === "fail") && (
                <p
                  className="mt-3 text-sm text-[color:var(--color-text-muted)]"
                  role="status"
                  aria-live="polite"
                >
                  {copyStatus === "ok" ? modalCopied : modalCopyFailed}
                </p>
              )}

              {showQr && (
                <div className="mt-6 border-t border-[color:var(--color-border)] pt-6">
                  {/* Place `public/wechat-qr.png`; on 404 the image hides automatically. */}
                  <img
                    src="/wechat-qr.png"
                    alt={modalQrAlt}
                    className="mx-auto max-h-52 w-auto max-w-full rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)]"
                    onError={() => setShowQr(false)}
                  />
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className="focus-ring group inline-flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left"
        onClick={openModal}
        aria-haspopup="dialog"
      >
        <span className="cv-row-title transition group-hover:text-[color:var(--color-accent-strong)]">{label}</span>
      </button>
      {modal}
    </>
  );
}
