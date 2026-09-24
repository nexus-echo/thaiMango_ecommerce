"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useStore } from "@/components/public/store";
import { PRODUCT_PLACEHOLDER, normalizeImagePath } from "@/lib/images";
import { unwrap } from "@/lib/http";
import type { DetailProduct } from "@/lib/productDetail";
import { USES_IMAGE, USES_IMAGE_ALT, productStory } from "@/lib/product-story";
import CtaBanner from "@/components/public/CtaBanner";
import KnowYourMango from "@/components/public/KnowYourMango";
import ProductBenefits from "@/components/public/ProductBenefits";
import ProductBreadcrumbs from "@/components/public/ProductBreadcrumbs";
import ProductBuyBox from "@/components/public/ProductBuyBox";
import ProductDetailSkeleton from "@/components/public/ProductDetailSkeleton";
import ProductFaq from "@/components/public/ProductFaq";
import ProductGallery from "@/components/public/ProductGallery";
import ProductLightbox from "@/components/public/ProductLightbox";
import ProductReviews from "@/components/public/ProductReviews";
import ProductShelfLife from "@/components/public/ProductShelfLife";
import ProductUses from "@/components/public/ProductUses";
import QualityBadges from "@/components/public/QualityBadges";
import RelatedProducts from "@/components/public/RelatedProducts";

/**
 * Product detail route.
 *
 * Fetches the product and composes the page; every section below is its own
 * component. The only state kept here is the pair the gallery and the
 * lightbox both need — which photo is showing, and whether the lightbox is
 * open. Purchase state (variant, quantity) belongs to the buy box, and the
 * zoom/pan machinery belongs to the two image components, because nothing
 * outside them reads it.
 */
export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { localized } = useStore();

  const productQuery = useQuery({
    queryKey: ["product", slug],
    queryFn: async (): Promise<DetailProduct> =>
      unwrap<DetailProduct>(axios.get(`/api/products/${slug}`)),
  });

  const product = productQuery.data;

  const images = useMemo(
    () =>
      product?.images.length
        ? product.images.map(normalizeImagePath)
        : [PRODUCT_PLACEHOLDER],
    [product]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  /* Clamped rather than trusted: navigating between two products keeps this
     component mounted, so an index from a product with more photos can arrive
     at one with fewer. */
  const safeIndex = Math.min(activeIndex, images.length - 1);

  if (productQuery.isPending) {
    return <ProductDetailSkeleton />;
  }

  if (productQuery.isError || !product) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center">
        <h1 className="font-serif text-3xl text-charcoal mb-3">Product not found</h1>
        <p className="text-sm text-muted mb-8">
          This product may have been removed or is no longer available.
        </p>
        <Link
          href="/shop"
          className="px-6 py-3 bg-charcoal text-white rounded-full text-xs uppercase tracking-widest font-bold hover:bg-accent transition"
        >
          Browse the Shop
        </Link>
      </main>
    );
  }

  const productName = localized(product.name_en, product.name_th);
  const story = productStory(product.category.slug);

  return (
    <>
      <main>
        <ProductBreadcrumbs
          categorySlug={product.category.slug}
          categoryName={localized(
            product.category.name_en,
            product.category.name_th
          )}
          productName={productName}
        />

        {/* Product Showcase */}
        <section className="py-12 md:py-20 bg-ivory">
          <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              <ProductGallery
                images={images}
                alt={productName}
                badge={product.highlights[0]}
                index={safeIndex}
                onIndexChange={setActiveIndex}
                onExpand={() => setLightboxOpen(true)}
              />
              <ProductBuyBox product={product} image={images[safeIndex]} />
            </div>
          </div>
        </section>

        {/* ---- The long-form half of the page ----
            The order follows the order the questions arrive in: how do I eat
            it, why would I, how long does it keep, what else should I ask,
            what is it exactly, and who else has already bought it. */}

        <ProductUses
          uses={story.uses}
          image={USES_IMAGE}
          imageAlt={USES_IMAGE_ALT}
          productName={productName}
        />

        <ProductBenefits
          benefits={story.benefits}
          highlights={product.highlights}
        />

        <ProductShelfLife storageInfo={product.storage_info} />

        <ProductFaq />

        <KnowYourMango
          intro={story.know.intro}
          facts={story.know.facts}
          ingredients={product.ingredients}
        />

        <ProductReviews
          slug={product.slug}
          productImage={images[0]}
          reviews={product.reviews}
          average={product.ratingAverage}
          count={product.ratingCount}
          productName={productName}
        />

        <RelatedProducts
          products={product.relatedProducts ?? []}
          categorySlug={product.category.slug}
        />

        <CtaBanner
          eyebrow="Build Your Box"
          title="There's a whole range where this came from"
          description="From classic Nam Dok Mai to chili-lime, every flavor is sun-dried the same slow way. Mix and match a selection that's entirely yours."
          primaryLabel="Browse All Flavors"
          primaryHref="/shop"
          secondaryLabel="Ask a Question"
          secondaryHref="/contact"
        />

        <QualityBadges />
      </main>

      {/* Outside <main> so no section's stacking or overflow can clip it. */}
      <ProductLightbox
        open={lightboxOpen}
        images={images}
        alt={productName}
        index={safeIndex}
        onIndexChange={setActiveIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
