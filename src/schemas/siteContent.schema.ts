/* Admin-editable storefront copy (Admin → Site Content). Every id here is
   read by the storefront; the seeder creates missing rows from these
   defaults, and the storefront falls back to them while a row is missing. */

export interface SiteContentDefault {
    id: string;
    section: string;
    location: string;
    content: string;
}

export const SITE_CONTENT_DEFAULTS: SiteContentDefault[] = [
    { id: "hero_desc", section: "Hero Description", location: "Home", content: "Where orchard tradition meets modern craft. Discover naturally sun-dried mango, hand-selected in Thailand for timeless tropical sweetness." },
    { id: "best_sellers_intro", section: "Best Selling Intro", location: "Home", content: "The flavors our customers come back for — ranked by what actually leaves the orchard." },
    { id: "expert_intro", section: "Flavor Expert Intro", location: "Home", content: "Tell us your taste preferences — sweet, spicy, tangy, or classic — and we'll point you toward the flavors that fit, or connect you with our team for bulk and gifting orders." },
    /* Founder section (home #our-founder) — edited together in one admin card.
       The photo is the founder poster already in the S3 bucket; seed the URL,
       never re-upload it per environment. */
    { id: "founder_image", section: "Founder Photo", location: "Home · Founder", content: "https://s3.nexusneural.online/thai-mango/site-content/dr-patr-nangsue-founder-c64a8ab9.jpg" },
    { id: "founder_name", section: "Founder Name", location: "Home · Founder", content: "Dr. Patr Nangsue" },
    { id: "founder_quote", section: "Founder Quote", location: "Home · Founder", content: "Food is not simply fuel for the body. It is biological information connecting nature, the microbiome and the human biological system." },
    { id: "founder_point1_title", section: "Founder Highlight 1 Title", location: "Home · Founder", content: "30+ Years With Plants" },
    { id: "founder_point1_text", section: "Founder Highlight 1 Text", location: "Home · Founder", content: "Medicinal plants, herbal formulations, natural foods and plant-based health products." },
    { id: "founder_point2_title", section: "Founder Highlight 2 Title", location: "Home · Founder", content: "Foundational Medicine" },
    { id: "founder_point2_text", section: "Founder Highlight 2 Text", location: "Home · Founder", content: "Founder of the Foundational Medicine Institute in Thailand." },
];

/* Blocks the storefront never read. The seeder deletes them so they stop
   appearing in admin as if editing them changed the site. */
export const OBSOLETE_SITE_CONTENT_IDS = [
    "announcement",
    "hero",
    "hero_title",
    "community_intro",
    "heritage_title",
    "journal_intro",
    "story",
    "ingredients",
    "faq",
    "footer",
];

/* Fields of the founder admin card, in display order. */
export const FOUNDER_FIELDS = [
    { id: "founder_image", label: "Photo", kind: "image" },
    { id: "founder_name", label: "Name", kind: "text" },
    { id: "founder_quote", label: "Quote", kind: "textarea" },
    { id: "founder_point1_title", label: "Highlight 1 — title", kind: "text" },
    { id: "founder_point1_text", label: "Highlight 1 — text", kind: "text" },
    { id: "founder_point2_title", label: "Highlight 2 — title", kind: "text" },
    { id: "founder_point2_text", label: "Highlight 2 — text", kind: "text" },
] as const;

export type FounderFieldId = (typeof FOUNDER_FIELDS)[number]["id"];

export const FOUNDER_FIELD_IDS: ReadonlySet<string> = new Set(FOUNDER_FIELDS.map((f) => f.id));

/** Blocks holding an image path/URL — the PATCH route validates these. */
export const IMAGE_CONTENT_IDS: ReadonlySet<string> = new Set(["founder_image"]);

const DEFAULTS_BY_ID = new Map(SITE_CONTENT_DEFAULTS.map((b) => [b.id, b.content]));

export function siteContentDefault(id: string): string {
    return DEFAULTS_BY_ID.get(id) ?? "";
}
