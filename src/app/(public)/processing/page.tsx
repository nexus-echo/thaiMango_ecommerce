import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Droplets, Leaf, PackageCheck, Scissors, Sparkles, Sun } from "lucide-react";
import CtaBanner from "@/components/public/CtaBanner";

export const metadata: Metadata = {
  title: "Our Process | Bangkok Mango",
  description: "Explore the journey from ripe Thai mangoes to delicious dried mango: selection, preparation, drying, flavoring and packing.",
};

const stages = [
  { number: "01", title: "Start with the fruit", label: "Selection", Icon: Leaf, image: "/images/processing/mango-selection.webp", alt: "Ripe golden Thai mangoes with green leaves in a harvest crate", description: "Ripe Thai mangoes are the starting point. Their aroma, golden flesh and natural sweetness set the character of the finished snack." },
  { number: "02", title: "Prepare with care", label: "Washing & peeling", Icon: Droplets, image: "/images/processing/mango-preparation.webp", alt: "Washed mangoes in a colander beside a peeled mango", description: "The fruit is washed and peeled, and the stone is removed to reveal the mango flesh ready for slicing." },
  { number: "03", title: "Find the right cut", label: "Slicing", Icon: Scissors, image: "/images/processing/mango-slicing.webp", alt: "Even mango slices arranged on a cutting board", description: "Mango flesh is cut into slices. Consistent pieces help the fruit dry evenly and give each bite its familiar shape." },
  { number: "04", title: "Let the flavor deepen", label: "Drying", Icon: Sun, image: "/images/processing/mango-drying.webp", alt: "Golden mango slices spread across mesh drying trays", description: "Slices are spread out for drying. As moisture reduces, the mango develops a more concentrated flavor and a soft, chewy texture." },
  { number: "05", title: "Give each flavor its finish", label: "Flavoring", Icon: Sparkles, image: "/images/ingredients/dried-mango-chili-lime.webp", alt: "Dried mango seasoned with chili alongside fresh lime", description: "Classic mango keeps the fruit in focus. Other varieties bring together ingredients such as beetroot, honey, or Thai chili and lime." },
  { number: "06", title: "Ready for your next moment", label: "Packing", Icon: PackageCheck, image: "/images/processing/bangkok-mango-packing.webp", alt: "Gold and ivory Bangkok Mango Original Flavor pouches beside dried mango and a packing scoop", description: "The finished mango is portioned and packed. Check your pouch for its ingredient list, storage guidance and best-before date." },
];

export default function ProcessingPage() {
  return (
    <main>
      <section className="overflow-hidden bg-beetroot text-white">
        <div className="mx-auto grid max-w-screen-2xl lg:min-h-[620px] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 md:px-12 md:py-24 lg:pr-16">
            <nav aria-label="Breadcrumb" className="mb-12 flex items-center gap-3 text-xs text-white/65">
              <Link href="/" className="transition hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-white">Our Process</span>
            </nav>
            <span className="mb-5 block text-[11px] font-bold uppercase tracking-[0.3em] text-gold">The craft behind every bite</span>
            <h1 className="max-w-xl text-4xl font-medium leading-[1.08] tracking-tight md:text-6xl xl:text-7xl">
              Good fruit.<br />Thoughtful process.<br /><span className="text-gold">Golden results.</span>
            </h1>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/80 md:text-base">
              Follow the journey from ripe Thai mango to the golden, chewy slices you love. A little care at every stage makes the fruit the hero.
            </p>
            <a href="#the-process" className="mt-9 inline-flex w-fit items-center gap-4 rounded-full border border-white/30 px-6 py-4 text-xs font-semibold uppercase tracking-widest transition hover:bg-white hover:text-beetroot">
              Discover the process <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
          <figure className="relative min-h-[360px] sm:min-h-[460px] lg:min-h-full">
            <Image src="/images/processing/mango-drying.webp" alt="Golden dried mango slices arranged on stainless-steel mesh drying trays" fill preload sizes="(max-width: 1023px) 100vw, (max-width: 1535px) 50vw, 768px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden="true" />
            <figcaption className="absolute inset-x-0 bottom-0 px-6 py-7 md:px-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">A closer look</span>
              <p className="mt-2 text-lg font-medium">Simple fruit. Beautiful transformation.</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="the-process" aria-labelledby="process-heading" className="scroll-mt-28 bg-ivory px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 grid items-end gap-6 md:grid-cols-2">
            <div>
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-beetroot">From mango to moment</p>
              <h2 id="process-heading" className="text-3xl font-medium leading-tight tracking-tight md:text-5xl">Six stages.<br />One delicious journey.</h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-muted md:justify-self-end md:text-base">
              Every stage has a purpose: prepare the fruit, develop its texture, and bring its flavor to your pouch.
            </p>
          </div>
          <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {stages.map(({ number, title, label, Icon, image, alt, description }) => (
              <li key={number} className="rounded-2xl border border-cream bg-white p-7 md:p-9">
                <div className="relative -mx-7 -mt-7 mb-6 aspect-[16/10] overflow-hidden rounded-t-[15px] bg-cream md:-mx-9 md:-mt-9">
                  <Image
                    src={image}
                    alt={alt}
                    fill
                    sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) calc((100vw - 116px) / 2), (max-width: 1375px) calc((100vw - 136px) / 3), 413px"
                    className="object-cover"
                  />
                </div>
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-4xl font-light tracking-tight text-beetroot/35">{number}</span>
                  <Icon aria-hidden="true" className="h-6 w-6 text-beetroot" strokeWidth={1.5} />
                </div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-beetroot">{label}</p>
                <h3 className="mb-4 text-xl font-medium tracking-tight">{title}</h3>
                <p className="text-sm leading-7 text-muted">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="texture-heading" className="border-y border-cream bg-white px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-cream">
            <Image src="/images/ingredients/dried-mango-classic.webp" alt="A plate of golden dried mango slices beside a whole ripe mango" fill sizes="(max-width: 1023px) 100vw, 600px" className="object-cover" />
          </div>
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.25em] text-beetroot">It&apos;s all in the texture</p>
            <h2 id="texture-heading" className="mb-6 text-3xl font-medium leading-tight tracking-tight md:text-5xl">The mango you know.<br />A bite to slow down for.</h2>
            <p className="mb-8 text-sm leading-7 text-muted md:text-base">Drying transforms the experience of mango: a deeper fruit flavor, a golden color and a satisfying chew. The character of the fruit stays at the heart of it.</p>
            <dl className="divide-y divide-cream border-y border-cream">
              {[["Golden color", "A warm palette inspired by ripe mango flesh."], ["Fruit-forward flavor", "Mango takes the lead, with a finish for every taste."], ["A satisfying chew", "A different way to enjoy a familiar favorite."]].map(([title, description]) => (
                <div key={title} className="py-4">
                  <dt className="mb-1 text-sm font-semibold">{title}</dt>
                  <dd className="text-sm leading-6 text-muted">{description}</dd>
                </div>
              ))}
            </dl>
            <Link href="/ingredients" className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-beetroot underline decoration-beetroot/30 underline-offset-8 transition hover:decoration-beetroot">
              Meet the ingredients <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <CtaBanner eyebrow="The next step is the best part" title="From our process to your first bite." description="Explore classic dried mango and discover a new favorite among our fruit, spice and honey varieties." primaryLabel="Explore the Collection" primaryHref="/shop" secondaryLabel="Ask Us a Question" secondaryHref="/contact" />
    </main>
  );
}
