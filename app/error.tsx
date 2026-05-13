"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Homepage error:", error);
  }, [error]);

  return (
    <main id="main-content" className="cv-container flex min-h-screen items-center py-20">
      <section className="cv-section-panel max-w-2xl p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
          GitHub data temporarily unavailable
        </p>
        <h1 className="cv-heading-lg mt-4">Sean Yu</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--color-text)]">
          The live GitHub activity feed did not load, but the static profile is still
          available. You can retry the page data request or continue to the contact links.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="cv-cta cv-cta-primary focus-ring">
            Retry
          </button>
          <a href="#contact" className="cv-cta cv-cta--ghost focus-ring">
            Contact
          </a>
        </div>
      </section>
    </main>
  );
}
