import Link from "next/link";
import Image from "next/image";

interface Flavor {
  name: string;
  image: string;
  /* Soft wash behind the pack, picked from the flavor's own colour */
  tint: string;
}

const FLAVORS: Flavor[] = [
  { name: "Original", image: "/images/products/bangkok-mango-original.jpeg", tint: "#F9D98A" },
  { name: "Chili Lime", image: "/images/products/bangkok-mango-chili-lime.png", tint: "#D9E8A6" },
  { name: "Chili Salt", image: "/images/products/bangkok-mango-chili-salt.png", tint: "#F4B79A" },
  { name: "Beetroot", image: "/images/products/bangkok-mango-beetroot.png", tint: "#E7A6B8" },
  { name: "Ginger", image: "/images/products/bangkok-mango-Ginger.png", tint: "#EFCB9A" },
  { name: "Turmeric", image: "/images/products/bangkok-mango-Turmeric.png", tint: "#F6CF6B" },
  { name: "Lychee", image: "/images/products/bangkok-mango-Lychee.png", tint: "#F6C9CF" },
  { name: "Roselle", image: "/images/products/bangkok-mango-Roselle.png", tint: "#E3A0AE" },
  { name: "Passion Fruit", image: "/images/products/bangkok-mango-passion.png", tint: "#E8C57E" },
  { name: "Plum", image: "/images/products/bangkok-mango-plum.jpeg", tint: "#CDB1D6" },
  { name: "Strawberry", image: "/images/products/bangkok-mango-strawberry.png", tint: "#F5AFAF" },
];

/* Home-page flavor rail: stacked "Shop by / Flavors" heading with a tilted
   highlight tag, then a row of tinted flavor tiles. Scrolls sideways on small
   screens, wraps into a grid from lg up. */
export default function AvailableByFlavor() {
  return (
    <section className="pt-8 pb-16 bg-[#F4E4D4]">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <div className="mb-10 flex justify-center items-center text-center reveal">
          {/* <h2 className="font-serif text-xl md:text-5xl font-medium uppercase tracking-tight text-charcoal leading-none">
            Available
          </h2> */}
          <span className="-rotate-2 bg-mango px-3 py-1 font-serif text-lg md:text-2xl font-semibold uppercase tracking-wide text-charcoal shadow-sm">
            Available Flavors
          </span>
        </div>

        <ul className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:-mx-12 md:px-12 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-5 lg:overflow-visible lg:px-0 xl:grid-cols-11 xl:gap-4 [scrollbar-width:none]">
          {FLAVORS.map((flavor, i) => (
            <li
              key={flavor.name}
              className="w-36 shrink-0 snap-start md:w-44 lg:w-auto reveal"
              style={{ transitionDelay: `${Math.min(i, 6) * 60}ms` }}
            >
              {/* <Link href="/shop" className="group block"> */}
              <div
                className="relative aspect-3/4 overflow-hidden rounded-2xl border border-mango/40 transition duration-300 group-hover:border-mango group-hover:shadow-lg group block"
                style={{
                  background: `linear-gradient(180deg, ${flavor.tint} 0%, #FFF9E9 100%)`,
                }}
              >
                <Image
                  src={flavor.image}
                  alt={`${flavor.name} dried mango`}
                  fill
                  sizes="(min-width: 1280px) 9vw, (min-width: 1024px) 16vw, 176px"
                  quality={60}
                  className="object-cover p-2 rounded-2xl transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-charcoal transition-colors group-hover:text-accent">
                {flavor.name}
              </p>
              {/* </Link> */}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
