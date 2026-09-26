/* The one section-heading style for the site, modelled on "From Fresh Mango /
   to Finished Product": serif, same size everywhere, first words in burgundy
   on line one, last words in amber on line two. It renders the heading
   element itself so no section can drift in size, weight or case — callers
   pass only layout classes (margins, alignment) via `className`.

   - accentWords: how many trailing words take the accent (default: the second
     half). Words come from Intl.Segmenter, so Thai — which has no spaces —
     splits on real word boundaries too.
   - onGold: for gold (bg-mango) sections, where amber would vanish — black
     lead, burgundy accent, the pack's dark-ink-on-gold rule.
   - ALL-CAPS Latin text (e.g. "THE SELECTION" from translations) is shown in
     title case so every heading shares one case. */
const SMALL_WORDS = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to"]);

const titleCase = (s: string) =>
  /[a-z]/.test(s) || !/[A-Z]/.test(s)
    ? s
    : s
      .toLowerCase()
      .replace(/\b([a-z])([a-z']*)/g, (w, first: string, rest: string, offset: number) =>
        offset > 0 && SMALL_WORDS.has(w) ? w : first.toUpperCase() + rest,
      );

export default function TwoToneTitle({
  text,
  accentWords,
  onGold = false,
  as: Tag = "h2",
  id,
  className = "",
  isbreak = false
}: {
  text: string;
  accentWords?: number;
  onGold?: boolean;
  as?: "h2" | "h3";
  id?: string;
  className?: string;
  isbreak?: boolean;
}) {
  const leadTone = onGold ? "text-charcoal" : "text-burgundy";
  const accentTone = onGold ? "text-burgundy" : "text-accent";
  const heading = titleCase(text.trim());

  const starts = [...new Intl.Segmenter(undefined, { granularity: "word" }).segment(heading)]
    .filter((s) => s.isWordLike)
    .map((s) => s.index);
  const count = accentWords ?? Math.floor(starts.length / 2);
  const split = starts.length >= 2 && count >= 1 && count < starts.length;
  let cut = split ? starts[starts.length - count] : heading.length;
  /* Keep opening punctuation (“ ( ‘) with the word it belongs to */
  while (split && cut > 0 && /[\p{Ps}\p{Pi}"']/u.test(heading[cut - 1])) cut--;

  return (
    <Tag
      id={id}
      className={`font-serif font-normal normal-case tracking-normal text-3xl md:text-4xl leading-tight ${className}`}
    >
      <span className={`${isbreak && "block"} ${leadTone}`}>{heading.slice(0, cut).trim()}</span>
      {split && <span className={`${isbreak && "block"} ${accentTone}`}> {heading.slice(cut).trim()}</span>}
    </Tag>
  );
}
