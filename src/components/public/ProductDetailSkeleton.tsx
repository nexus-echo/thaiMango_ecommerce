/**
 * Placeholder shown while /api/products/[slug] is in flight.
 *
 * Mirrors the real showcase's geometry block for block — same grid, same
 * aspect ratios, same stack of controls — so the page does not jump when the
 * data lands. Only the above-the-fold half is drawn: the long-form sections
 * below it are far enough down that a shimmer there would never be seen.
 */
export default function ProductDetailSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading product">
      {/* Breadcrumbs */}
      <div className="bg-cream/40 border-b border-cream py-4">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2">
            <span className="h-3 w-10 rounded-full bg-cream animate-pulse" />
            <span className="h-3 w-3 rounded-full bg-cream animate-pulse" />
            <span className="h-3 w-10 rounded-full bg-cream animate-pulse" />
            <span className="h-3 w-3 rounded-full bg-cream animate-pulse" />
            <span className="h-3 w-24 rounded-full bg-cream animate-pulse" />
          </div>
        </div>
      </div>

      {/* Showcase */}
      <section className="py-12 md:py-20 bg-ivory">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left: gallery */}
            <div className="lg:col-span-6 flex flex-col sm:flex-row-reverse gap-3 sm:gap-4 w-full max-w-[520px] mx-auto lg:mx-0">
              <div className="flex-1 min-w-0">
                <div className="rounded-[28px] aspect-3/4 bg-cream animate-pulse ring-1 ring-black/5" />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-1 content-start gap-3 sm:w-20 md:w-24 shrink-0">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl aspect-square bg-cream animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Right: info */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <div className="border-b border-cream pb-6 mb-6">
                <span className="block h-3 w-40 rounded-full bg-cream animate-pulse mb-4" />
                <span className="block h-9 md:h-12 w-3/4 rounded-2xl bg-cream animate-pulse mb-4" />
                <span className="block h-4 w-48 rounded-full bg-cream animate-pulse mb-5" />
                <div className="flex items-baseline gap-3">
                  <span className="h-9 w-32 rounded-2xl bg-cream animate-pulse" />
                  <span className="h-4 w-16 rounded-full bg-cream animate-pulse" />
                </div>
              </div>

              <div className="space-y-2.5 mb-8">
                <span className="block h-3.5 w-full rounded-full bg-cream animate-pulse" />
                <span className="block h-3.5 w-11/12 rounded-full bg-cream animate-pulse" />
                <span className="block h-3.5 w-2/3 rounded-full bg-cream animate-pulse" />
              </div>

              {/* Size pills */}
              <div className="mb-6">
                <span className="block h-3 w-24 rounded-full bg-cream animate-pulse mb-3" />
                <div className="flex flex-wrap gap-3">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="h-11 w-32 rounded-full bg-cream animate-pulse"
                    />
                  ))}
                </div>
              </div>

              {/* Qty + CTA */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <span className="h-12 w-full sm:w-36 rounded-full bg-cream animate-pulse" />
                <span className="h-12 flex-1 rounded-full bg-cream animate-pulse" />
                <span className="h-12 w-full sm:w-24 rounded-full bg-cream animate-pulse" />
              </div>

              {/* Key benefits */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-cream/40 rounded-2xl border border-cream mb-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cream animate-pulse" />
                    <span className="h-3 w-16 rounded-full bg-cream animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Accordion rows */}
              <div className="border-t border-cream divide-y divide-cream">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="py-4 flex justify-between items-center">
                    <span className="h-3 w-36 rounded-full bg-cream animate-pulse" />
                    <span className="h-4 w-4 rounded-full bg-cream animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
