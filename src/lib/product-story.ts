/**
 * Editorial copy for the long-form half of the product page — the Uses,
 * Benefits, Shelf Life and Know Your Mango sections.
 *
 * None of this is shopper data, and none of it is per-SKU: it describes how a
 * *kind* of mango snack is eaten and what it is made of, so it is keyed by
 * category slug with a shared fallback. Keeping it here (rather than in the
 * Product table) means marketing can rewrite a whole collection's story in one
 * place, and a newly added SKU inherits its category's story with no admin
 * step. Anything genuinely per-SKU — ingredients, how it's made, storage —
 * already lives on the product row and is rendered from there.
 *
 * Same shape as src/lib/flavor-tips.ts: a keyed record plus a lookup that
 * always returns something renderable.
 */

export interface StoryPoint {
    title: string;
    body: string;
}

export interface KnowFact {
    label: string;
    value: string;
    /** One line of context under the value — keeps the grid from reading as a spec sheet. */
    note: string;
}

export interface NutritionRow {
    label: string;
    /** Per 70 g pouch, exactly as printed on the pack. */
    value: string;
    /**
     * The pack's own "% Thai RDI" figure, which drives the bar. `null` where
     * the label declares no percentage — those rows render without a bar
     * rather than with one we worked out ourselves.
     */
    share: number | null;
    /** Sub-row of the line above it (e.g. "of which sugars"). */
    nested?: boolean;
}

export interface ProductStory {
    /** "Uses" — ways the snack actually gets eaten. */
    uses: StoryPoint[];
    /** "Benefits" — what the fruit and the drying method give you. */
    benefits: StoryPoint[];
    /** "Know Your Mango" — provenance and craft. */
    know: {
        intro: string;
        facts: KnowFact[];
        image: string;
        imageAlt: string;
    };
}

/**
 * The nutrition panel transcribed from the back of the 70 g pouch (the Chili
 * Salt artwork in public/images/all_products.jpeg), percentages included —
 * nothing here is estimated or converted, so the site cannot contradict the
 * pack.
 *
 * Per-flavor labels differ. When artwork for the other flavors is available,
 * move this to a per-category field on ProductStory rather than editing these
 * numbers in place.
 */
export const NUTRITION: NutritionRow[] = [
    { label: "Energy", value: "210 kcal", share: null },
    { label: "Total fat", value: "0 g", share: 0 },
    { label: "Sodium", value: "190 mg", share: 8 },
    { label: "Total carbohydrate", value: "52 g", share: 17 },
    { label: "of which sugars", value: "45 g", share: null, nested: true },
    { label: "Dietary fibre", value: "2 g", share: 8 },
    { label: "Protein", value: "1 g", share: null },
];

/** The vitamins and minerals the same panel declares, as % Thai RDI. */
export const MICRONUTRIENTS: { label: string; percent: number }[] = [
    { label: "Vitamin C", percent: 10 },
    { label: "Iron", percent: 2 },
    { label: "Vitamin A", percent: 0 },
    { label: "Calcium", percent: 0 },
];

/* Facts shared by every collection — the fruit and the drying shed don't
   change between flavors, only what goes on the fruit afterwards.
   "Made in" and "The pouch" are read off the pack artwork; the variety, the
   season, the yield ratio and the cut are house figures — confirm them against
   production before this page goes live. */
const BASE_FACTS: KnowFact[] = [
    {
        label: "Fruit",
        value: "Nam Dok Mai",
        note: "Thailand's honey-sweet dessert mango, picked tree-ripe rather than gassed green.",
    },
    {
        label: "Made in",
        value: "Nakhon Pathom, Thailand",
        note: "Packed by Bangkok Mango Co., Ltd. — the address printed on every pouch.",
    },
    {
        label: "Season",
        value: "March – June",
        note: "One harvest a year. The season's fruit is dried and packed to order.",
    },
    {
        label: "Fruit in, fruit out",
        value: "≈ 5 kg → 1 kg",
        note: "Only water leaves. Nothing is added back to make up the weight.",
    },
    {
        label: "The cut",
        value: "6–8 mm strips",
        note: "Thick enough to stay chewy, thin enough to dry evenly to the centre.",
    },
    {
        label: "The pouch",
        value: "Double-walled, zip-locked",
        note: "A printed outer sleeve over a vacuum-sealed inner bag, with a tear notch to open.",
    },
];

/**
 * The photo beside the Uses list. One image for every product on purpose:
 * the section is about how the snack is eaten, which is the same whichever
 * flavor is in the pouch, and a flavor-specific shot here actively misleads —
 * a product's category is not a reliable guide to what it looks like (the
 * catalog already has a Classic strip filed under Fusion Blends).
 *
 * Plain sun-dried strips, which is what every flavor starts as. Swap for the
 * purpose-shot serving photo when it exists — see the brief in
 * public/images/product-story/generation-prompts.json.
 */
export const USES_IMAGE = "/images/ingredients/dried-mango-classic.webp";
export const USES_IMAGE_ALT =
    "A plate of golden sun-dried mango strips beside a whole ripe mango";

const DEFAULT_STORY: ProductStory = {
    uses: [
        {
            title: "Straight from the pouch",
            body: "Three or four strips is a serving. Resealable, so the rest of the pouch keeps for the week.",
        },
        {
            title: "Desk and lunchbox",
            body: "No fridge, no melting, no crumbs — it survives a commute and a school bag equally well.",
        },
        {
            title: "Stirred into breakfast",
            body: "Snip into oats, yoghurt or granola. The strips soften overnight and sweeten the bowl on their own.",
        },
        {
            title: "On a board",
            body: "Sweet fruit against a sharp cheddar or aged gouda, the way dried figs are usually used.",
        },
        {
            title: "Baked in",
            body: "Chopped through muffin, scone or banana-bread batter in place of raisins.",
        },
        {
            title: "Steeped",
            body: "A strip dropped into hot jasmine or black tea gives the cup a soft mango finish.",
        },
    ],
    benefits: [
        {
            title: "Whole fruit, nothing stripped",
            body: "The only thing removed is water. What is left is the same flesh you would eat off a fresh mango, just concentrated — fibre, natural sugars and colour included.",
        },
        {
            title: "Sweet without the additions",
            body: "Tree-ripened Nam Dok Mai is sweet enough on its own, so our classic strips carry no added sugar, no glucose syrup and no artificial sweetener.",
        },
        {
            title: "Naturally a source of fibre",
            body: "Dried mango keeps the fruit's dietary fibre, which is why a small handful sits better and lasts longer than the same calories of confectionery.",
        },
        {
            title: "Vitamins the fruit came with",
            body: "Slow, low-temperature drying is gentler on the fruit's naturally occurring vitamin A and vitamin C than high-heat processing.",
        },
        {
            title: "No preservatives, no colours",
            body: "Colour comes from the mango itself. Nothing is added to hold it — which is also why the strips vary a little in shade from batch to batch.",
        },
        {
            title: "Keeps without a fridge",
            body: "Shelf-stable for a year unopened. It travels, posts and gifts well in a way fresh fruit simply cannot.",
        },
    ],
    know: {
        intro: "Every pouch starts as whole Thai mango and ends as whole Thai mango. Here is what happens in between — and what to look for when you open one.",
        facts: BASE_FACTS,
        image: "/images/processing/mango-drying.webp",
        imageAlt: "Sliced Thai mango laid out on drying racks",
    },
};

/* Per-collection overrides. Anything not listed falls back to DEFAULT_STORY,
   so a new category renders correctly the day it is created. */
const STORIES: Record<string, Partial<ProductStory>> = {
    /* "classic-cuts" is the default story, so it needs no entry. */

    "spiced-zesty": {
        uses: [
            {
                title: "The afternoon wake-up",
                body: "Chili and lime hit before the sweetness does — it reads more like a snack than a dessert.",
            },
            {
                title: "Alongside a cold drink",
                body: "Sweet-sour-spicy is built for a lager, a soda water with lime, or iced tea.",
            },
            {
                title: "Chopped into salad",
                body: "A few strips through a green papaya or slaw salad, the way som tam uses dried fruit for sweetness.",
            },
            {
                title: "On a grazing board",
                body: "The heat cuts through soft cheese and cured meat better than plain dried fruit does.",
            },
            {
                title: "Rimmed and blended",
                body: "Blitzed into a powder, it makes a chili-lime rim for a margarita or a michelada.",
            },
            {
                title: "Travel snack",
                body: "Resealable and unsquashable — it handles a backpack far better than fresh fruit.",
            },
        ],
        benefits: [
            {
                title: "Heat that comes from chili, not additives",
                body: "Real Thai chili and lime, tossed by hand over the dried fruit. No flavouring powder, no acidity regulator, no artificial colour.",
            },
            {
                title: "Whole fruit underneath",
                body: "Strip the seasoning away and it is the same slow-dried Nam Dok Mai as our classic cuts — fibre, natural sugars and colour intact.",
            },
            {
                title: "Mild-to-medium, not punishing",
                body: "The heat is bright and short. It is built so the mango still comes through, rather than to win a spice contest.",
            },
            {
                title: "Naturally a source of fibre",
                body: "Dried mango keeps the fruit's dietary fibre, so a small handful satisfies for longer than the same calories of confectionery.",
            },
            {
                title: "No preservatives",
                body: "Nothing is added to hold the colour or the heat, which is why shade and spice vary a little between batches.",
            },
            {
                title: "Keeps without a fridge",
                body: "Shelf-stable for a year unopened — it posts, packs and gifts in a way fresh fruit cannot.",
            },
        ],
    },

    "glazed-sweet": {
        uses: [
            {
                title: "Dessert, portioned",
                body: "Two or three slices closes a meal without anyone having to bake something.",
            },
            {
                title: "Over yoghurt or ice cream",
                body: "Chopped over plain yoghurt or vanilla ice cream, where the honey glaze does the work of a sauce.",
            },
            {
                title: "With the cheese course",
                body: "Honey and sharp cheese is an old pairing — this is that, in one bite.",
            },
            {
                title: "Folded into baking",
                body: "Through a muffin, scone or sticky-bun batter in place of candied peel.",
            },
            {
                title: "Afternoon tea",
                body: "The glaze is sweet enough to stand up to a strong black tea or a flat white.",
            },
            {
                title: "Gift-box filler",
                body: "The glossiest slices in the range, which is why they carry a gift box best.",
            },
        ],
        benefits: [
            {
                title: "Real honey, not syrup",
                body: "Finished with wildflower honey rather than glucose syrup or invert sugar — a glaze you can read on the ingredient list in one word.",
            },
            {
                title: "Whole fruit underneath",
                body: "The glaze goes onto fruit that is already dry. The mango is the same slow-dried Nam Dok Mai, not a rehydrated, sugar-soaked slice.",
            },
            {
                title: "Sweeter by design, not by volume",
                body: "The honey lets us use less fruit per serving for the same satisfaction, which is the point of a dessert-weight snack.",
            },
            {
                title: "Naturally a source of fibre",
                body: "Glazed or not, the dried fruit keeps the mango's dietary fibre.",
            },
            {
                title: "No preservatives or colours",
                body: "The amber shade is honey and mango. Nothing is added to fix it, so batches differ slightly.",
            },
            {
                title: "Keeps without a fridge",
                body: "Shelf-stable for a year unopened, and the glaze reseals rather than weeping.",
            },
        ],
    },

    "fusion-blends": {
        uses: [
            {
                title: "The colourful handful",
                body: "Ruby against gold — the most striking thing in a snack bowl, and it tastes like mango first.",
            },
            {
                title: "Through a grain bowl",
                body: "Chopped over quinoa, farro or a beet salad, where the colour already belongs.",
            },
            {
                title: "In trail mix",
                body: "With cashews and pumpkin seeds, for the sweet element that isn't chocolate.",
            },
            {
                title: "Kids' lunchboxes",
                body: "No spice, bright colour, and nothing in it that needs explaining to a five-year-old.",
            },
            {
                title: "On a cheese board",
                body: "The earthiness of beetroot works where plain sweet fruit can be one-note.",
            },
            {
                title: "Blended into smoothies",
                body: "Soaked for ten minutes first, then blitzed — it colours and sweetens in one go.",
            },
        ],
        benefits: [
            {
                title: "Colour from vegetables, not dye",
                body: "The ruby shade is natural beetroot juice infused before drying. No E-numbers, no artificial colour, no titanium dioxide.",
            },
            {
                title: "Two whole ingredients",
                body: "Mango and beetroot. That is the list — both dried down rather than reconstituted from concentrate.",
            },
            {
                title: "Gentle on the nutrients",
                body: "Low-temperature drying is kinder to the fruit's naturally occurring vitamins and the beetroot's plant pigments than high-heat processing.",
            },
            {
                title: "Naturally a source of fibre",
                body: "Both ingredients arrive whole, so the fibre arrives with them.",
            },
            {
                title: "No added sugar, no preservatives",
                body: "Beetroot is sweet on its own. Nothing is added to sweeten it or to hold the colour.",
            },
            {
                title: "Keeps without a fridge",
                body: "Shelf-stable for a year unopened, colour and chew intact.",
            },
        ],
    },

    "gift-sets": {
        uses: [
            {
                title: "The house gift",
                body: "Arrives as a box rather than a bag — nothing to arrange, nothing to refrigerate.",
            },
            {
                title: "Corporate and festive gifting",
                body: "Vegetarian, alcohol-free and nut-free by recipe, so it clears most office gifting lists.",
            },
            {
                title: "The tasting flight",
                body: "Open every flavor at once and find out whether your table is classic, spiced or glazed.",
            },
            {
                title: "Travelling home",
                body: "Sealed, shelf-stable and light — it makes the trip in a suitcase without a thought.",
            },
            {
                title: "The shared desk drawer",
                body: "One box covers an office of people who each want something different.",
            },
            {
                title: "Your own stock-up",
                body: "The cheapest way per gram to keep more than one flavor in the cupboard.",
            },
        ],
        benefits: [
            {
                title: "Every flavor, one decision",
                body: "Classic, spiced, glazed and fusion in a single box — the easiest way to find out which one you'll reorder.",
            },
            {
                title: "Gift-ready out of the carton",
                body: "Packed to be handed over as-is: rigid box, fitted insert, nothing to re-wrap.",
            },
            {
                title: "Whole fruit throughout",
                body: "Every pouch inside is the same slow-dried Nam Dok Mai — no filler flavors added to make up the count.",
            },
            {
                title: "No preservatives or colours",
                body: "Across the whole box, without exception.",
            },
            {
                title: "Ships anywhere",
                body: "Shelf-stable for a year and unaffected by heat in transit, so it can be sent rather than carried.",
            },
            {
                title: "Suits almost any table",
                body: "Vegetarian and vegan by recipe, with no nuts, dairy or alcohol in any pouch.",
            },
        ],
    },
};

/** The story for a product's category, filled out from the shared default. */
export function productStory(categorySlug: string | undefined): ProductStory {
    const override = categorySlug ? STORIES[categorySlug] : undefined;
    if (!override) return DEFAULT_STORY;
    return {
        ...DEFAULT_STORY,
        ...override,
        know: { ...DEFAULT_STORY.know, ...override.know },
    };
}

/**
 * Shelf-life figures shown in the Shelf Life band. The prose beside them comes
 * from the product's own `storage_info`, so only the numerals live here.
 */
export const SHELF_LIFE = {
    unopenedMonths: 12,
    openedLabel: "2 weeks",
    /** Ideal storage range, printed on the pouch. */
    storeAt: "Below 25°C",
};
