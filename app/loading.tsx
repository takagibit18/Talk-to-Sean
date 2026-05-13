export default function Loading() {
  return (
    <main id="main-content" className="cv-container min-h-screen py-24">
      <div className="grid gap-12">
        <section className="grid gap-8 md:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-5">
            <div className="h-7 w-52 animate-pulse rounded-full bg-[rgba(244,234,216,0.08)]" />
            <div className="h-20 max-w-xl animate-pulse rounded bg-[rgba(244,234,216,0.08)]" />
            <div className="h-6 max-w-2xl animate-pulse rounded bg-[rgba(244,234,216,0.08)]" />
            <div className="flex gap-3">
              <div className="h-11 w-36 animate-pulse rounded-full bg-[rgba(201,154,62,0.18)]" />
              <div className="h-11 w-32 animate-pulse rounded-full bg-[rgba(244,234,216,0.06)]" />
            </div>
          </div>
          <div className="cv-section-panel h-72 animate-pulse" />
        </section>

        {Array.from({ length: 4 }).map((_, index) => (
          <section key={index} className="cv-section">
            <div className="mb-8 h-10 w-44 animate-pulse rounded bg-[rgba(244,234,216,0.08)]" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-40 animate-pulse rounded-[0.5rem] bg-[rgba(244,234,216,0.06)]" />
              <div className="h-40 animate-pulse rounded-[0.5rem] bg-[rgba(244,234,216,0.06)]" />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
