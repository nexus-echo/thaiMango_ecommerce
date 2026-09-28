import CtaBanner from "@/components/public/CtaBanner";
import DoodleBackdrop from "@/components/public/DoodleBackdrop";

export default function TermsPage() {
  return (
    <main>
      {/* Header band: mild graffiti, clear behind the title */}
      <header className="relative overflow-hidden border-b border-cream bg-cream/50 pt-16 pb-12 md:pt-24 md:pb-16">
        <DoodleBackdrop src="/images/doodles/graffiti.svg" tile={380} fade="center" className="text-accent opacity-[0.14]" />
        <div className="relative max-w-4xl mx-auto px-6">
          <span className="text-xs uppercase tracking-widest text-accent font-bold mb-3 block">Terms of Service</span>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">Terms &amp; Conditions</h1>
          <p className="text-xs text-muted">Last updated: February 2026</p>
        </div>
      </header>

      {/* Policy doodles in the side gutters only, away from the text */}
      <div className="relative overflow-hidden py-12 md:py-16">
        <DoodleBackdrop src="/images/doodles/policy.svg" tile={440} fade="edges" className="text-accent opacity-[0.14]" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="prose max-w-none text-sm md:text-base text-muted space-y-8 leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">1. Agreement to Terms</h2>
              <p>By accessing or purchasing from Bangkok Mango, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">2. Product Authenticity &amp; Use</h2>
              <p>All Bangkok Mango products are authentic and manufactured under stringent food safety and sanitary standards. Our dried mango products are intended for personal consumption only.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">3. Pricing &amp; Availability</h2>
              <p>Prices are listed in Indian Rupees (INR) and are inclusive of all applicable taxes. We reserve the right to revise pricing or discontinue products at our discretion.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">4. Intellectual Property</h2>
              <p>All logos, imagery, typography, and product descriptions are the proprietary intellectual property of Bangkok Mango.</p>
            </section>
          </div>
        </div>
      </div>
      <CtaBanner
        eyebrow="The Fine Print, Handled"
        title="Now for the better part"
        description="Policies read, questions always welcome. Explore the flavors or reach out to our team any time."
        primaryLabel="Shop the Collection"
        primaryHref="/shop"
        secondaryLabel="Contact Us"
        secondaryHref="/contact"
      />
    </main>
  );
}
