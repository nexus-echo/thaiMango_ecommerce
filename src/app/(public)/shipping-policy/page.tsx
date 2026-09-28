import { baseCurrencyOf, getStoreSettings } from "@/lib/storeSettings";
import { formatMoney } from "@/lib/currency";
import CtaBanner from "@/components/public/CtaBanner";
import DoodleBackdrop from "@/components/public/DoodleBackdrop";

export const dynamic = "force-dynamic";

export default async function ShippingPolicyPage() {
  const settings = await getStoreSettings();
  const base = baseCurrencyOf(settings);
  const freeAbove = formatMoney(settings.free_shipping_above, base);
  const flatRate = formatMoney(settings.standard_shipping, base);
  return (
    <main>
      {/* Header band: mild graffiti, clear behind the title */}
      <header className="relative overflow-hidden border-b border-cream bg-cream/50 pt-16 pb-12 md:pt-24 md:pb-16">
        <DoodleBackdrop src="/images/doodles/graffiti.svg" tile={380} fade="center" className="text-accent opacity-[0.14]" />
        <div className="relative max-w-4xl mx-auto px-6">
          <span className="text-xs uppercase tracking-widest text-accent font-bold mb-3 block">Orders &amp; Dispatch</span>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">Shipping &amp; Returns Policy</h1>
          <p className="text-xs text-muted">Last updated: February 2026</p>
        </div>
      </header>

      {/* Policy doodles in the side gutters only, away from the text */}
      <div className="relative overflow-hidden py-12 md:py-16">
        <DoodleBackdrop src="/images/doodles/policy.svg" tile={440} fade="edges" className="text-accent opacity-[0.14]" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="prose max-w-none text-sm md:text-base text-muted space-y-8 leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">1. Dispatch &amp; Delivery Timelines</h2>
              <p>All orders placed before 2:00 PM IST Monday through Saturday are dispatched on the same business day. Delivery across major metro cities typically takes 2–3 business days. Non-metro and regional addresses take 3–5 business days.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">2. Shipping Charges</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Free Standard Delivery:</strong> On all orders above {freeAbove}.</li>
                <li><strong>Standard Flat Rate:</strong> {flatRate} on orders under {freeAbove}.</li>
                <li><strong>Cash on Delivery:</strong> Available with no additional surcharge.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">3. Temperature-Controlled Eco Packaging</h2>
              <p>All Bangkok Mango pouches are packed inside biodegradable insulated sleeves to ensure total freshness, even in warm climates.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">4. Damaged or Missing Shipments</h2>
              <p>If your package arrives damaged, please photograph the package and notify us within 48 hours at <a href={`mailto:${settings.support_email}`} className="text-accent underline">{settings.support_email}</a> for an immediate replacement dispatch.</p>
            </section>
          </div>
        </div>
      </div>
      <CtaBanner
        eyebrow="Packed Fresh, Shipped Fast"
        title="Ready when you are"
        description="Temperature-controlled, eco-packed and dispatched within 24 hours. Fill a box worth sending."
        primaryLabel="Shop the Collection"
        primaryHref="/shop"
        secondaryLabel="Delivery FAQ"
        secondaryHref="/faq"
      />
    </main>
  );
}
