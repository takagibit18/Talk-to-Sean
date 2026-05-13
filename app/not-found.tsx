import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="cv-container flex min-h-screen items-center py-20">
      <section className="cv-section-panel max-w-2xl p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-[color:var(--color-accent-strong)]">
          404
        </p>
        <h1 className="cv-heading-lg mt-4">Page not found</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--color-text)]">
          This page is not part of Sean's public homepage or AI profile assistant.
        </p>
        <Link href="/" className="cv-cta cv-cta-primary focus-ring mt-6">
          Back to homepage
        </Link>
      </section>
    </main>
  );
}
