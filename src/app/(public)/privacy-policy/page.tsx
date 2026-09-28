import CtaBanner from "@/components/public/CtaBanner";
import DoodleBackdrop from "@/components/public/DoodleBackdrop";

export default function PrivacyPolicyPage() {
  return (
    <main>
      {/* Header band: mild graffiti, clear behind the title */}
      <header className="relative overflow-hidden border-b border-cream bg-cream/50 pt-16 pb-12 md:pt-24 md:pb-16">
        <DoodleBackdrop src="/images/doodles/graffiti.svg" tile={380} fade="center" className="text-accent opacity-[0.14]" />
        <div className="relative max-w-4xl mx-auto px-6">
          <span className="text-xs uppercase tracking-widest text-accent font-bold mb-3 block">Legal &amp; Transparency</span>
          <h1 className="font-serif text-4xl md:text-5xl text-charcoal mb-4">Privacy Policy</h1>
          <p className="text-xs text-muted">Last updated: February 2026</p>
        </div>
      </header>

      {/* Policy doodles in the side gutters only, away from the text */}
      <div className="relative overflow-hidden py-12 md:py-16">
        <DoodleBackdrop src="/images/doodles/policy.svg" tile={440} fade="edges" className="text-accent opacity-[0.14]" />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="prose max-w-none text-sm md:text-base text-muted space-y-8 leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">1. Information We Collect</h2>
              <p>We collect information you provide directly to us when purchasing our dried mango snack products, subscribing to our inner circle, placing a bulk or wholesale order, or contacting our customer care team.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">2. How We Use Your Information</h2>
              <p>Your details are used strictly to fulfill orders, process payments securely, provide order tracking, personalize product recommendations, and communicate important updates regarding your purchases.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">3. Data Security &amp; Sharing</h2>
              <p>We do not sell, rent, or trade your personal data. Payment transactions are processed through encrypted, PCI-DSS compliant payment gateways.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-charcoal mb-3">4. Contact Our Data Protection Officer</h2>
              <p>For questions regarding your data or to request record removal, email us at <a href="mailto:privacy@thaimango.com" className="text-accent underline">privacy@thaimango.com</a>.</p>
            </section>
          </div>
        </div>
      </div>
      <CtaBanner
        eyebrow="Your Data, Respected"
        title="The same honesty, everywhere"
        description="The transparency we bring to our ingredient list, we bring to your data. Questions? We're one message away."
        primaryLabel="Contact Us"
        primaryHref="/contact"
        secondaryLabel="Shop the Collection"
        secondaryHref="/shop"
      />
    </main>
  );
}
