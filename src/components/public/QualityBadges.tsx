/**
 * The five promises printed along the bottom of every Bangkok Mango pouch,
 * reproduced as the closing band of the product page: 100% natural, finest
 * quality mango, product of Thailand, delicious & chewy, for all ages.
 *
 * Thai above, English below — the same order as the pack. The icons are
 * inline SVG rather than an icon set because three of them (the mango, the
 * Thai flag, the two figures) have no equivalent in lucide.
 */
export default function QualityBadges() {
  return (
    <div className="relative z-10 w-full border-t border-[#B47404]/40 bg-[#ECA40C] text-[#0A0A0A] reveal">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-10 py-10 md:py-6 grid grid-cols-2 md:grid-cols-5 gap-y-10 md:gap-y-0 gap-x-6 md:gap-x-0 md:divide-x md:divide-[#0A0A0A]/20 text-center items-center">
        <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
          <span className="w-14 h-14 rounded-full border-2 border-[#0A0A0A]/45 flex items-center justify-center text-[#0A0A0A] mb-3 group-hover:scale-110 group-hover:bg-[#0A0A0A]/10 transition-all duration-300 shadow-sm">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22V10" />
              <path d="M12 10C12 5 8 3 4 3c0 5 2 9 8 9" />
              <path d="M12 14c0-4 3-7 8-7 0 4-2 7-8 7" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-wide text-[#0A0A0A] mb-1">ธรรมชาติ 100%</span>
          <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#502500]">100% NATURAL</span>
        </div>
        <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
          <span className="w-14 h-14 rounded-full border-2 border-[#0A0A0A]/45 flex items-center justify-center text-[#0A0A0A] mb-3 group-hover:scale-110 group-hover:bg-[#0A0A0A]/10 transition-all duration-300 shadow-sm">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M10 4c-1.2-1.8-3-2.5-5-1.8 0 2.8 1.8 3.8 4.8 3.8" />
              <path d="M9.8 6.5C6 6.5 3 10.2 4 15c1 4.8 5.8 6.8 8.8 4.8 4-2.8 5-8.8 3-11.8-1.5-1.8-3.8-2.2-6-1.5z" />
              <path d="M10 4.5c1-1.5 2-2 3-2" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-wide text-[#0A0A0A] mb-1">คัดสรรจากมะม่วงคุณภาพ</span>
          <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#502500]">FINEST QUALITY MANGO</span>
        </div>
        <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
          <span className="w-14 h-14 flex items-center justify-center mb-3 group-hover:scale-110 transition-all duration-300">
            <svg className="w-14 h-9 drop-shadow-md" viewBox="0 0 54 36" fill="none">
              <path d="M2 10C12 2 24 20 34 10C40 4 48 12 52 8V24C48 28 40 20 34 26C24 36 12 18 2 26V10Z" fill="#ED1C24" />
              <path d="M2 13C12 5 24 23 34 13C40 7 48 15 52 11V21C48 25 40 17 34 23C24 33 12 15 2 23V13Z" fill="#FFFFFF" />
              <path d="M2 15.5C12 7.5 24 25.5 34 15.5C40 9.5 48 17.5 52 13.5V18.5C48 22.5 40 14.5 34 20.5C24 30.5 12 12.5 2 20.5V15.5Z" fill="#241D4F" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-wide text-[#0A0A0A] mb-1">ผลิตในประเทศไทย</span>
          <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#502500]">PRODUCT OF THAILAND</span>
        </div>
        <div className="px-2 md:px-4 flex flex-col items-center justify-center group">
          <span className="w-14 h-14 rounded-full border-2 border-[#0A0A0A]/45 flex items-center justify-center text-[#0A0A0A] mb-3 group-hover:scale-110 group-hover:bg-[#0A0A0A]/10 transition-all duration-300 shadow-sm">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5.5 14c1 4.5 4.5 6.5 8.5 6.5 4 0 7-3 7-7 0-3.2-2.2-5.2-4.5-5.2-3 0-5 2-6.5 4-2 0-3.5 1-4.5 1.7z" />
              <circle cx="9" cy="8" r="1" fill="currentColor" />
              <circle cx="15" cy="7" r="0.8" fill="currentColor" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-wide text-[#0A0A0A] mb-1">อร่อย เพลิน เคี้ยวหนึบ</span>
          <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#502500]">DELICIOUS &amp; CHEWY</span>
        </div>
        <div className="col-span-2 md:col-span-1 px-2 md:px-4 flex flex-col items-center justify-center group max-w-xs mx-auto">
          <span className="w-14 h-14 rounded-full border-2 border-[#0A0A0A]/45 flex items-center justify-center text-[#0A0A0A] mb-3 group-hover:scale-110 group-hover:bg-[#0A0A0A]/10 transition-all duration-300 shadow-sm">
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="8" cy="5.5" r="2.2" />
              <path d="M5.5 21v-5a3 3 0 0 1 5.5 0v5" />
              <circle cx="16.5" cy="7" r="1.8" />
              <path d="M14 21v-4a2.5 2.5 0 0 1 5 0v4" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-wide text-[#0A0A0A] mb-1">เหมาะสำหรับทุกวัย</span>
          <span className="text-[10px] tracking-[0.18em] uppercase font-bold text-[#502500]">FOR ALL AGES</span>
        </div>
      </div>
    </div>
  );
}
