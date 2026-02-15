// 8 colorful avatar presets — vibrant, distinct characters
const svgToDataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;

export const AVATAR_PRESETS: Record<string, string> = {
    // Blue - friendly smile
    preset_1: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#3b82f6"/><circle cx="35" cy="40" r="5" fill="white"/><circle cx="65" cy="40" r="5" fill="white"/><path d="M35 62 Q50 75 65 62" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`),
    // Green - wide eyes
    preset_2: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#22c55e"/><circle cx="35" cy="40" r="7" fill="white"/><circle cx="65" cy="40" r="7" fill="white"/><circle cx="35" cy="40" r="3" fill="#0f172a"/><circle cx="65" cy="40" r="3" fill="#0f172a"/><rect x="38" y="63" width="24" height="4" rx="2" fill="white"/></svg>`),
    // Red - determined
    preset_3: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#ef4444"/><rect x="28" y="35" width="14" height="10" rx="2" fill="white"/><rect x="58" y="35" width="14" height="10" rx="2" fill="white"/><path d="M38 65 Q50 55 62 65" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`),
    // Orange - surprised
    preset_4: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#f97316"/><circle cx="35" cy="42" r="7" fill="white"/><circle cx="65" cy="42" r="7" fill="white"/><circle cx="37" cy="42" r="3" fill="#0f172a"/><circle cx="67" cy="42" r="3" fill="#0f172a"/><ellipse cx="50" cy="68" rx="8" ry="5" fill="white"/></svg>`),
    // Purple - cool X eyes
    preset_5: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#a855f7"/><line x1="30" y1="35" x2="42" y2="45" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="30" y1="45" x2="42" y2="35" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="58" y1="35" x2="70" y2="45" stroke="white" stroke-width="4" stroke-linecap="round"/><line x1="58" y1="45" x2="70" y2="35" stroke="white" stroke-width="4" stroke-linecap="round"/><path d="M35 68 Q50 78 65 68" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`),
    // Teal - antenna alien
    preset_6: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#14b8a6"/><circle cx="38" cy="38" r="8" fill="white"/><circle cx="62" cy="38" r="8" fill="white"/><circle cx="40" cy="38" r="4" fill="#0f172a"/><circle cx="64" cy="38" r="4" fill="#0f172a"/><path d="M30 60 Q50 75 70 60" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/><line x1="50" y1="12" x2="50" y2="4" stroke="#14b8a6" stroke-width="3"/><circle cx="50" cy="3" r="3" fill="#fff"/></svg>`),
    // Pink - sleepy
    preset_7: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#ec4899"/><rect x="25" y="38" width="20" height="6" rx="3" fill="white"/><rect x="55" y="38" width="20" height="6" rx="3" fill="white"/><path d="M40 62 L50 70 L60 62" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
    // Gold - cyclops
    preset_8: svgToDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#eab308"/><circle cx="50" cy="40" r="12" fill="white"/><circle cx="50" cy="40" r="6" fill="#0f172a"/><path d="M32 65 Q50 80 68 65" stroke="white" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`),
};

export const PRESET_KEYS = Object.keys(AVATAR_PRESETS);
