import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface ProductBreadcrumbsProps {
  categorySlug: string;
  categoryName: string;
  productName: string;
}

/** Home › Shop › Category › Product, above the showcase. */
export default function ProductBreadcrumbs({
  categorySlug,
  categoryName,
  productName,
}: ProductBreadcrumbsProps) {
  return (
    <div className="bg-cream/40 border-b border-cream py-4">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-muted uppercase tracking-widest">
          <Link href="/" className="hover:text-charcoal transition">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-charcoal transition">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/shop?category=${encodeURIComponent(categorySlug)}`}
            className="hover:text-charcoal transition"
          >
            {categoryName}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-charcoal font-semibold truncate max-w-xs">
            {productName}
          </span>
        </nav>
      </div>
    </div>
  );
}
