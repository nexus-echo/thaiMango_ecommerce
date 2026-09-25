"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  MessageCircle,
  Play,
  ShoppingBag,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import { InstagramIcon } from "@/components/public/BrandIcons";
import BestSellers from "@/components/public/BestSellers";
import SellingFastBadge from "@/components/public/SellingFastBadge";
import { useStore } from "@/components/public/store";
import { normalizeImagePath, productImage } from "@/lib/images";
import { unwrap } from "@/lib/http";
import { mapProduct, type ApiProduct } from "@/lib/productCard";
import { siteContentDefault } from "@/schemas/siteContent.schema";
import Image from "next/image";
import AvailableByFlavor from "@/components/public/ShopByFlavor";
import FlavorCollections from "@/components/public/FlavorCollections";
import FermentationProcess from "@/components/public/FermentationProcess";
import Testimonials from "@/components/public/Testimonials";
import WhyChoose from "@/components/public/WhyChoose";

interface ApiCategory {
  id: number;
  slug: string;
  name_en: string;
  name_th: string;
  image: string | null;
  cat_id: number | null;
}

interface ContentBlock {
  id: string;
  content: string;
}

const FALLBACK_IMAGES = [
  "/images/products/bangkok-mango-beetroot.png",
  "/images/products/bangkok-mango-chili-lime.png",
];

/* Card shaping (pricing rules, localisation, image fallback) is shared with
   BestSellers via @/lib/productCard so the two sections cannot drift. */

export default function Home() {
  const { t, localized, addToCart, showToast, formatPrice } = useStore();

  /* Admin-editable copy (Admin → Site Content) */
  const contentQuery = useQuery({
    queryKey: ["site-content"],
    queryFn: async (): Promise<ContentBlock[]> =>
      unwrap<ContentBlock[]>(axios.get("/api/site-content")),
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ["home-products"],
    queryFn: async (): Promise<ApiProduct[]> => {
      const data = await unwrap<{ products: ApiProduct[] }>(
        axios.get("/api/products?limit=6")
      );
      return data.products;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<ApiCategory[]> =>
      unwrap<ApiCategory[]>(axios.get("/api/categories")),
  });

  const blocks = new Map(
    (contentQuery.data ?? []).map((b) => [b.id, b.content])
  );
  const content = (id: string, fallback = siteContentDefault(id)) =>
    blocks.get(id)?.trim() || fallback;

  const products = (productsQuery.data ?? []).map((p) =>
    mapProduct(p, formatPrice, localized)
  );
  const showcase = products.slice(0, 3);
  const collections = products.length > 4 ? products.slice(2, 6) : products;

  const rootCategories = (categoriesQuery.data ?? [])
    .filter((c) => c.cat_id === null)
    .slice(0, 4);

  /* Admin-set category image first, then a photo from one of its products. */
  const categoryImage = (category: ApiCategory, index: number) => {
    if (category.image) return normalizeImagePath(category.image);
    const match = productsQuery.data?.find((p) => p.category.slug === category.slug)?.images[0];
    return match ? productImage([match]) : FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  };

  /* Hero title: fixed brand name, accent word in the accent color */
  const heroLead = "BANGKOK";
  const heroAccent = "MANGO";

  const productsPending = productsQuery.isPending;

  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="/images/ei_video_ta_background_e_dao.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-[#0A0A0A]/60"></div>
        </div>

        {/* Corner Frame Accent */}
        <div className="hidden md:block absolute inset-6 md:inset-10 lg:inset-12 z-5 pointer-events-none">
          <span className="absolute top-0 left-0 w-14 h-14 border-t border-l border-ivory/30"></span>
          <span className="absolute top-0 right-0 w-14 h-14 border-t border-r border-ivory/30"></span>
          <span className="absolute bottom-0 left-0 w-14 h-14 border-b border-l border-ivory/30"></span>
          <span className="absolute bottom-0 right-0 w-14 h-14 border-b border-r border-ivory/30"></span>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 md:px-12 flex-1 flex items-center justify-start">
          <div className="max-w-4xl text-left text-white reveal">
            <h1 className="font-serif font-medium text-5xl md:text-[5rem] leading-[1.1] mb-6 tracking-tight uppercase">
              {heroLead && <span>{heroLead} </span>}
              <span className="text-[#ECA40C]">{heroAccent}</span>
            </h1>

            <p className="text-white/90 text-sm md:text-lg leading-relaxed mb-10 max-w-xl font-medium">
              {content("hero_desc", t("hero_desc"))}
            </p>

            <div className="flex flex-col sm:flex-row items-start justify-start gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-mango border border-mango text-charcoal text-[10px] md:text-xs tracking-widest uppercase hover:bg-charcoal hover:text-mango hover:border-charcoal transition duration-300 rounded-full font-bold shadow-lg"
              >
                <span>{t("shop_products")}</span>
                <ArrowRight className="w-4 h-4 ml-3" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-white/10 border border-white/20 text-white text-[10px] md:text-xs tracking-widest uppercase hover:bg-white hover:text-charcoal transition duration-300 rounded-full font-bold backdrop-blur-sm"
              >
                <span>{t("skin_consultation")}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quality & Origin 5-Badge Banner */}
        <div className="relative z-10 w-full border-t border-[#B47404]/40 bg-mango text-charcoal reveal">
          <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-10 md:py-6 grid grid-cols-2 md:grid-cols-5 gap-y-10 md:gap-y-0 gap-x-6 md:gap-x-0 md:divide-x md:divide-charcoal/20 text-center items-center">
            {/* 1: 100% Natural */}
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-charcoal/45 flex items-center justify-center text-charcoal mb-3 group-hover:scale-110 group-hover:bg-charcoal/10 transition-all duration-300 shadow-sm">
                <svg className="w-7 h-7 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V10"></path>
                  <path d="M12 10C12 5 8 3 4 3c0 5 2 9 8 9"></path>
                  <path d="M12 14c0-4 3-7 8-7 0 4-2 7-8 7"></path>
                  <line x1="8" y1="22" x2="16" y2="22"></line>
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-charcoal mb-1">ธรรมชาติ 100%</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#502500]">100% NATURAL</span>
            </div>

            {/* 2: Finest Quality Mango */}
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-charcoal/45 flex items-center justify-center text-charcoal mb-3 group-hover:scale-110 group-hover:bg-charcoal/10 transition-all duration-300 shadow-sm">
                <svg className="w-7 h-7 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8"></path>
                  <path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z"></path>
                  <path d="M10 4.5c1-1.5 2-2 3-2"></path>
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-charcoal mb-1">คัดสรรจากมะม่วงคุณภาพ</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#502500]">FINEST QUALITY MANGO</span>
            </div>

            {/* 3: Product of Thailand */}
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 md:w-14 md:h-14 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                <svg className="w-14 h-9 md:w-14 md:h-9 drop-shadow-md" viewBox="0 0 54 36" fill="none">
                  <path d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z" fill="#ED1C24" />
                  <path d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z" fill="#FFFFFF" />
                  <path d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z" fill="#241D4F" />
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-charcoal mb-1">ผลิตในประเทศไทย</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#502500]">PRODUCT OF THAILAND</span>
            </div>

            {/* 4: Delicious & Chewy */}
            <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
              <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-charcoal/45 flex items-center justify-center text-charcoal mb-3 group-hover:scale-110 group-hover:bg-charcoal/10 transition-all duration-300 shadow-sm">
                <svg className="w-7 h-7 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5.5 14c1 4.5 4.5 6.5 8.5 6.5 4 0 7-3 7-7 0-3.2-2.2-5.2-4.5-5.2-3 0-5 2-6.5 4-2 0-3.5 1-4.5 1.7z"></path>
                  <circle cx="9" cy="8" r="1" fill="currentColor"></circle>
                  <circle cx="15" cy="7" r="0.8" fill="currentColor"></circle>
                  <path d="M7 6l.4 1.2L8.5 7.5l-1.1.4L7 9l-.4-1.1L5.5 7.5l1.1-.3L7 6z" fill="currentColor"></path>
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-charcoal mb-1">อร่อย เพลิน เคี้ยวหนึบ</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#502500]">DELICIOUS &amp; CHEWY</span>
            </div>

            {/* 5: For All Ages */}
            <div className="col-span-2 md:col-span-1 px-2 md:px-4 flex flex-col items-center justify-center group max-w-xs mx-auto">
              <span className="w-14 h-14 md:w-14 md:h-14 rounded-full border-2 border-charcoal/45 flex items-center justify-center text-charcoal mb-3 group-hover:scale-110 group-hover:bg-charcoal/10 transition-all duration-300 shadow-sm">
                <svg className="w-7 h-7 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="5.5" r="2.2"></circle>
                  <path d="M5.5 21v-5a3 3 0 0 1 5.5 0v5"></path>
                  <circle cx="16.5" cy="7" r="1.8"></circle>
                  <path d="M14 21v-4a2.5 2.5 0 0 1 5 0v4"></path>
                </svg>
              </span>
              <span className="text-sm md:text-sm font-semibold tracking-wide text-charcoal mb-1">เหมาะสำหรับทุกวัย</span>
              <span className="text-[10px] md:text-[11px] tracking-[0.18em] uppercase font-bold text-[#502500]">FOR ALL AGES</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Showcase */}
      <section className="pt-16 pb-12 bg-[#F4E4D4]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12 mb-8 reveal">
          <h2 className="text-xl md:text-[26px] font-serif font-normal tracking-[0.08em] text-menutext uppercase">
            {t("the_selection")}
          </h2>
        </div>
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {productsPending ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-4xl aspect-4/5 bg-white/70 animate-pulse" />
              ))}
            </div>
          ) : showcase.length === 0 ? (
            <p className="py-16 text-center text-xs uppercase tracking-widest text-muted">
              No products available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {showcase.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/product-detail/${product.slug}`}
                  className="relative overflow-hidden rounded-4xl aspect-4/5 group cursor-pointer reveal block"
                  style={i > 0 ? { transitionDelay: `${i * 200}ms` } : undefined}
                >
                  {/* Background Image */}
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={300}
                    quality={60}
                    className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-out group-hover:scale-105 bg-ivory"
                  />

                  {/* Dark linear Overlay for text readability */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 text-white">
                    <h2 className="text-lg xl:text-xl font-serif font-medium mb-3 tracking-tight leading-snug pr-4 uppercase">
                      {product.name}
                    </h2>
                    <p className="text-[13px] text-white/80 line-clamp-2 mb-8 font-medium max-w-sm pr-4">
                      {product.desc}
                    </p>

                    <span className="inline-flex items-center gap-3 text-[10px] tracking-widest uppercase font-bold group-hover:text-white transition duration-300">
                      <span className="border-b border-white pb-0.5">{t("discover_more")}</span>
                      <span className="w-7 h-7 rounded-full border border-white/40 flex items-center justify-center group-hover:bg-white/20 transition duration-300">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Flavor collections — pins full-screen and swaps slides on scroll */}
      <FlavorCollections />

      <AvailableByFlavor />

      {/* Why Choose — four brand pillars with illustrations */}
      <WhyChoose />

      {/* Shop by Category */}
      <section className="pb-16 pt-8 bg-[#F4E4D4]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 reveal">
            <h2 className="text-xl md:text-[26px] font-serif font-normal tracking-[0.08em] text-[#A4741C] uppercase mb-6 md:mb-0">
              {t("shop_by_category")}
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-accent text-white text-[10px] md:text-xs tracking-[0.15em] uppercase hover:bg-charcoal transition duration-300 rounded-full font-bold shadow-md"
            >
              <span>Explore Complete Selection</span>
              <ArrowRight className="w-4 h-4 ml-3" />
            </Link>
          </div>

          {/* Banner Cards Grid */}
          {categoriesQuery.isPending ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-4xl aspect-4/3 md:aspect-video lg:aspect-2/1 bg-white/70 animate-pulse" />
              ))}
            </div>
          ) : rootCategories.length === 0 ? (
            <p className="py-16 text-center text-xs uppercase tracking-widest text-muted">
              No categories available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {rootCategories.map((category, i) => (
                <Link
                  key={category.slug}
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="relative overflow-hidden rounded-4xl aspect-4/3 md:aspect-video lg:aspect-2/1 group block reveal"
                  style={i > 0 ? { transitionDelay: `${(i % 2) * 200}ms` } : undefined}
                >
                  <Image
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    quality={60}
                    src={categoryImage(category, i)}
                    alt={`${localized(category.name_en, category.name_th)} Category`}
                    className={`${category.image ? "object-cover" : "object-fill"} transition-transform duration-1000 ease-out group-hover:scale-105`}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 md:p-10 z-10 w-full">
                    <span className="block text-menuaccent text-[10px] md:text-xs tracking-[0.2em] font-bold uppercase mb-2">Selection</span>
                    <h3 className="text-white text-3xl md:text-4xl font-serif font-medium uppercase tracking-tight">{localized(category.name_en, category.name_th)}</h3>

                    {/* Hover Button */}
                    <div className="flex items-center gap-3 mt-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      <span className="text-white text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold">Explore Flavors</span>
                      <span className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center group-hover:border-white transition duration-300">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The Collections */}
      <section id="collections" className="pb-16 pt-8 bg-[#F4E4D4]">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 reveal">
            <h2 className="text-xl md:text-[26px] font-serif font-normal tracking-[0.08em] text-[#A4741C] uppercase mb-6 md:mb-0">
              OUR COLLECTIONS
            </h2>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3.5 bg-accent text-white text-[10px] md:text-xs tracking-[0.15em] uppercase hover:bg-charcoal transition duration-300 rounded-full font-bold shadow-md"
            >
              Explore Complete Collections
              <ArrowRight className="w-4 h-4 ml-3" />
            </Link>
          </div>

          {/* Product Cards Grid */}
          {productsPending ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
              {[0, 1, 2, 4].map((i) => (
                <div key={i} className="rounded-3xl aspect-4/5 bg-white/70 animate-pulse" />
              ))}
            </div>
          ) : collections.length === 0 ? (
            <p className="py-16 text-center text-xs uppercase tracking-widest text-muted">
              No products available yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
              {collections.map((product, i) => (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm group cursor-pointer reveal"
                  style={i > 0 ? { transitionDelay: `${i * 200}ms` } : undefined}
                >
                  <div className="relative aspect-4/5 overflow-hidden bg-[#F4E4D4]">
                    <Link href={`/product-detail/${product.slug}`} className="absolute inset-0">
                      <Image
                        width={300}
                        height={300}
                        quality={60}
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object- transition-transform duration-1000 ease-out group-hover:scale-105"
                      />
                    </Link>

                    {/* Badges */}
                    {product.badges.length > 0 && (
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                        {product.badges.map((badge) => (
                          <span key={badge} className="bg-[#ECA40C] text-charcoal text-[9px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}
                    {product.discountPct !== undefined && product.discountPct > 0 && (
                      <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-10 pointer-events-none">
                        {product.discountPct}%
                      </span>
                    )}

                    {/* Quick Add */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart({
                          slug: product.slug,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        });
                      }}
                      className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white flex items-center justify-center text-accent shadow-md z-10 hover:bg-accent hover:text-white transition"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>

                    {product.sellingFast && (
                      <SellingFastBadge className="absolute bottom-3 left-3 z-10" />
                    )}
                  </div>

                  <div className="px-6 py-2">
                    <h3 className="text-sm md:text-base font-serif font-semibold uppercase tracking-tight text-[#0A0A0A] mb-2 truncate">
                      <Link href={`/product-detail/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="text-[13px] text-muted line-clamp-2 mb-4 leading-relaxed">{product.desc}</p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="text-[9px] tracking-widest uppercase font-bold text-accent bg-[#F4E4D4] px-3 py-1.5 rounded-full">
                        {product.categoryName}
                      </span>
                    </div>

                    <div className="flex items-end justify-between py-4 border-t border-cream">
                      <div className="flex flex-row-reverse items-center justify-center gap-3">
                        {product.comparePriceDisplay && (
                          <span className="block text-xs text-muted line-through">{product.comparePriceDisplay}</span>
                        )}
                        <span className="text-lg font-bold text-[#B47404]">{product.priceDisplay}</span>
                      </div>
                      <Link
                        href={`/product-detail/${product.slug}`}
                        className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-bold text-[#0A0A0A] group-hover:text-accent transition"
                      >
                        Explore
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Where tradition meets biotechnology — the slow fermentation story */}
      <FermentationProcess />

      {/* The Visionary */}
      <section id="our-founder" className="py-12 md:py-16 bg-ivory">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Image */}
            <div className="w-full lg:w-1/2">
              {/* Portrait frame: the founder photo is a 1055×1491 poster */}
              <div className="relative mx-auto max-w-lg aspect-[5/7] rounded-[28px] overflow-hidden border border-accent/10 bg-cream">
                {/* Admin → Site Content → Founder Section */}
                <Image
                  fill
                  sizes="(max-width: 559px) calc(100vw - 48px), 512px"
                  src={normalizeImagePath(content("founder_image"))}
                  alt={`${content("founder_name")}, founder of Bangkok Mango`}
                  className="object-cover object-top"
                />
              </div>
            </div>
            {/* Text */}
            <div className="w-full lg:w-1/2 reveal text-center lg:text-left">
              <span className="text-[10px] tracking-[0.3em] uppercase text-accent font-bold block mb-4">The Visionary</span>
              <h2 className="font-serif text-4xl md:text-5xl mb-6">Our Founder</h2>
              <figure className="mb-10 max-w-xl mx-auto lg:mx-0">
                <blockquote className="border-l-2 border-accent pl-5 italic text-muted text-base md:text-lg">
                  &quot;{content("founder_quote")}&quot;
                </blockquote>
                <figcaption className="mt-4 pl-5 text-xs font-bold uppercase tracking-widest text-charcoal">
                  — {content("founder_name")}
                </figcaption>
              </figure>

              <div className="grid grid-cols-2 gap-8 mb-10 max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="w-11 h-11 rounded-full bg-[#F4E4D4] flex items-center justify-center mb-3 mx-auto lg:mx-0">
                    <Star className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wide mb-1">{content("founder_point1_title")}</h3>
                  <p className="text-xs text-muted">{content("founder_point1_text")}</p>
                </div>
                <div>
                  <div className="w-11 h-11 rounded-full bg-[#F4E4D4] flex items-center justify-center mb-3 mx-auto lg:mx-0">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wide mb-1">{content("founder_point2_title")}</h3>
                  <p className="text-xs text-muted">{content("founder_point2_text")}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/contact" className="inline-flex items-center justify-center px-8 py-3.5 bg-accent text-white text-[10px] md:text-xs tracking-widest uppercase hover:bg-charcoal transition duration-300 rounded-full font-bold">
                  Request a Sample
                  <ArrowRight className="w-4 h-4 ml-3" />
                </Link>
                <Link href="/our-story" className="inline-flex items-center justify-center px-8 py-3.5 border border-accent text-accent text-[10px] md:text-xs tracking-widest uppercase hover:bg-accent hover:text-white transition duration-300 rounded-full font-bold">
                  <User className="w-4 h-4 mr-2" /> Meet the Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Selling — ranked by real order volume (/api/products/best-sellers) */}
      <BestSellers intro={content("best_sellers_intro", "")} />

      {/* Testimonials — curated in Admin → Testimonials; hidden when none are live */}
      <Testimonials />

      {/* AI Skin Expert */}
      <section id="skin-consultant" className="flex flex-col lg:flex-row min-h-[70vh]">
        {/* Image */}
        <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-auto">
          <Image
            width={800}
            height={800}
            src="/Gemini_Generated_Image_3moitt3moitt3moi.png"
            alt="Thai Mango orchard"
            className="absolute inset-0 w-full h-full"
          />
          <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:max-w-xs bg-charcoal/70 backdrop-blur-sm rounded-2xl p-5">
            <h3 className="text-ivory text-xs font-bold tracking-widest uppercase mb-2">Hand-Picked Quality</h3>
            <p className="text-ivory/70 text-xs leading-relaxed">Blending orchard heritage with careful ripeness testing for a snack that&apos;s actually worth it.</p>
          </div>
        </div>

        {/* Panel */}
        <div className="w-full lg:w-1/2 bg-mango flex items-center p-8 md:p-16">
          <div className="max-w-lg">
            <h2 className="text-charcoal text-2xl md:text-3xl font-serif font-bold uppercase tracking-tight mb-5">Your Mango Flavor Expert</h2>
            <p className="text-charcoal/85 text-sm md:text-base leading-relaxed mb-8">
              {content("expert_intro")}
            </p>

            {/* <form
              className="flex flex-col sm:flex-row gap-3 mb-6"
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Thank you! Your request has been received.");
                e.currentTarget.reset();
              }}
            >
              <input type="text" placeholder="Describe your taste preferences…" className="flex-1 px-5 py-4 rounded-full text-charcoal text-sm bg-white focus:outline-none" />
              <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-charcoal text-ivory text-sm font-semibold rounded-full hover:bg-black transition shrink-0">
                <MessageCircle className="w-4 h-4" /> Get My Recommendation
              </button>
            </form> */}

            <Link href="/contact" className="inline-flex items-center gap-3 px-6 py-3.5 border border-charcoal/40 text-charcoal text-[10px] md:text-xs tracking-widest uppercase font-bold rounded-full hover:bg-charcoal/10 transition">
              <Stethoscope className="w-4 h-4" /> Talk to Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-cream text-center border-t border-cream reveal">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-serif text-4xl md:text-5xl mb-6">{t("join_circle_title")}</h2>
          <p className="text-muted text-sm md:text-base mb-10 leading-relaxed">{t("join_circle_desc")}</p>

          <form
            className="flex flex-col sm:flex-row gap-4 mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              showToast("Thank you! Your request has been received.");
              e.currentTarget.reset();
            }}
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 bg-transparent border-b border-charcoal py-3 px-2 focus:outline-none focus:border-accent text-sm transition text-center sm:text-left"
              required
            />
            <button type="submit" className="px-8 py-3.5 bg-accent text-white text-xs tracking-widest uppercase hover:bg-charcoal transition duration-300">
              {t("join_circle_btn")}
            </button>
          </form>
          <p className="text-[10px] text-muted uppercase tracking-widest">By subscribing, you agree to receive updates from Thai Mango.</p>
        </div>
      </section>

      {/* Trust / Quality Pillars */}
      <section className="py-16 bg-mango text-charcoal border-y border-burgundy/30 reveal">
        <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.3em] uppercase text-burgundy font-bold">Quality &amp; Authenticity</span>
            <h2 className="font-serif text-3xl md:text-4xl text-charcoal mt-2">The Thai Mango Standard</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-y-10 md:gap-y-4 gap-x-6 md:gap-x-4 text-center">
            {/* 1 */}
            <div className="px-2 md:px-3 flex flex-col items-center group">
              <span className="w-14 h-14 rounded-full border-2 border-charcoal/45 flex items-center justify-center text-charcoal mb-3 group-hover:scale-110 group-hover:bg-charcoal/10 transition-all duration-300 shadow">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22V10"></path>
                  <path d="M12 10C12 5 8 3 4 3c0 5 2 9 8 9"></path>
                  <path d="M12 14c0-4 3-7 8-7 0 4-2 7-8 7"></path>
                  <line x1="8" y1="22" x2="16" y2="22"></line>
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-charcoal mb-0.5">ธรรมชาติ 100%</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#502500] font-bold mb-2">100% Natural</p>
              <p className="text-xs text-charcoal/75">Pure natural fruit with zero artificial preservatives.</p>
            </div>

            {/* 2 */}
            <div className="px-2 md:px-3 flex flex-col items-center group">
              <span className="w-14 h-14 rounded-full border-2 border-charcoal/45 flex items-center justify-center text-charcoal mb-3 group-hover:scale-110 group-hover:bg-charcoal/10 transition-all duration-300 shadow">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8"></path>
                  <path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z"></path>
                  <path d="M10 4.5c1-1.5 2-2 3-2"></path>
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-charcoal mb-0.5">คัดสรรจากมะม่วงคุณภาพ</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#502500] font-bold mb-2">Finest Quality Mango</p>
              <p className="text-xs text-charcoal/75">Hand-selected ripe mangoes for maximum sweetness and aroma.</p>
            </div>

            {/* 3 */}
            <div className="px-2 md:px-3 flex flex-col items-center group">
              <span className="w-14 h-14 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
                <svg className="w-14 h-9 drop-shadow-md" viewBox="0 0 54 36" fill="none">
                  <path d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z" fill="#ED1C24" />
                  <path d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z" fill="#FFFFFF" />
                  <path d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z" fill="#241D4F" />
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-charcoal mb-0.5">ผลิตในประเทศไทย</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#502500] font-bold mb-2">Product of Thailand</p>
              <p className="text-xs text-charcoal/75">Authentically produced and packed in Thailand.</p>
            </div>

            {/* 4 */}
            <div className="px-2 md:px-3 flex flex-col items-center group">
              <span className="w-14 h-14 rounded-full border-2 border-charcoal/45 flex items-center justify-center text-charcoal mb-3 group-hover:scale-110 group-hover:bg-charcoal/10 transition-all duration-300 shadow">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5.5 14c1 4.5 4.5 6.5 8.5 6.5 4 0 7-3 7-7 0-3.2-2.2-5.2-4.5-5.2-3 0-5 2-6.5 4-2 0-3.5 1-4.5 1.7z"></path>
                  <circle cx="9" cy="8" r="1" fill="currentColor"></circle>
                  <circle cx="15" cy="7" r="0.8" fill="currentColor"></circle>
                  <path d="M7 6l.4 1.2L8.5 7.5l-1.1.4L7 9l-.4-1.1L5.5 7.5l1.1-.3L7 6z" fill="currentColor"></path>
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-charcoal mb-0.5">อร่อย เพลิน เคี้ยวหนึบ</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#502500] font-bold mb-2">Delicious &amp; Chewy</p>
              <p className="text-xs text-charcoal/75">Gently dried for that irresistibly soft, chewy mouthfeel.</p>
            </div>

            {/* 5 */}
            <div className="col-span-2 md:col-span-1 px-2 md:px-3 flex flex-col items-center group max-w-xs mx-auto">
              <span className="w-14 h-14 rounded-full border-2 border-charcoal/45 flex items-center justify-center text-charcoal mb-3 group-hover:scale-110 group-hover:bg-charcoal/10 transition-all duration-300 shadow">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="5.5" r="2.2"></circle>
                  <path d="M5.5 21v-5a3 3 0 0 1 5.5 0v5"></path>
                  <circle cx="16.5" cy="7" r="1.8"></circle>
                  <path d="M14 21v-4a2.5 2.5 0 0 1 5 0v4"></path>
                </svg>
              </span>
              <h3 className="text-sm font-semibold text-charcoal mb-0.5">เหมาะสำหรับทุกวัย</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#502500] font-bold mb-2">For All Ages</p>
              <p className="text-xs text-charcoal/75">Wholesome, guilt-free snacking for kids and adults alike.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
