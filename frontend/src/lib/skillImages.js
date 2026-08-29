/**
 * Curated thematic cover photos — every skill maps to a relevant image.
 * Fallbacks stay on-theme (category/keyword), never random stock.
 */

const UNSPLASH = (id, w = 640, h = 360) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;

const IMAGES = {
  code:       UNSPLASH('photo-1461749280684-dccba630e2f6'),
  guitar:     UNSPLASH('photo-1550291652-0639f8f7262b'),
  music:      UNSPLASH('photo-1511379938546-c1f69419868d'),
  piano:      UNSPLASH('photo-1520523839897-bd0555441736'),
  dance:      UNSPLASH('photo-1508700115892-45ecd05ae2ad'),
  keyboard:   UNSPLASH('photo-1587829741301-dc798b83add3'),
  design:     UNSPLASH('photo-1561070791-2526d30994b5'),
  business:   UNSPLASH('photo-1454165804603-c3d57bc86b40'),
  language:   UNSPLASH('photo-1546410531-bb4caa6b424d'),
  cooking:    UNSPLASH('photo-1556910103-1c02745aae4d'),
  fitness:    UNSPLASH('photo-1571019614242-c5c5dee9f50b'),
  academic:   UNSPLASH('photo-1523050854058-8df90110c9f1'),
  security:   UNSPLASH('photo-1550751827-4bd374c3f58b'),
  arts:       UNSPLASH('photo-1456513080510-7bf3a84b82f8'),
  learning:   UNSPLASH('photo-1434030214721-735608b0cfe0'),
  laptop:     UNSPLASH('photo-1517694712202-14dd9538aa57'),
};

const CATEGORY_IMAGES = {
  Technology:      IMAGES.code,
  Design:          IMAGES.design,
  Business:        IMAGES.business,
  Language:        IMAGES.language,
  Languages:       IMAGES.language,
  Music:           IMAGES.music,
  'Arts & Crafts': IMAGES.arts,
  Cooking:         IMAGES.cooking,
  Fitness:         IMAGES.fitness,
  Academic:        IMAGES.academic,
  Cybersecurity:   IMAGES.security,
  Other:           IMAGES.learning,
  General:         IMAGES.learning,
};

/** Multiple on-theme variants per category for visual variety */
const CATEGORY_VARIANTS = {
  Music:       [IMAGES.guitar, IMAGES.music, IMAGES.piano],
  Technology:  [IMAGES.code, IMAGES.laptop, IMAGES.security],
  Design:      [IMAGES.design, IMAGES.laptop],
  'Arts & Crafts': [IMAGES.dance, IMAGES.arts],
  Fitness:     [IMAGES.fitness, IMAGES.dance],
};

/** Most-specific keyword rules first */
const KEYWORD_IMAGES = [
  { keys: ['bass guitar', 'bass', 'guitar', 'ukulele', 'violin', 'cello'], image: IMAGES.guitar },
  { keys: ['piano', 'keyboard instrument', 'synthesizer'], image: IMAGES.piano },
  { keys: ['dance', 'ballet', 'choreography', 'salsa', 'hip hop'], image: IMAGES.dance },
  { keys: ['typing', 'typewriter', 'keyboard'], image: IMAGES.keyboard },
  { keys: ['python', 'java', 'javascript', 'programming', 'coding', 'software', 'developer', 'web dev', 'html', 'css', 'react', 'node'], image: IMAGES.code },
  { keys: ['cyber', 'security', 'hacking', 'network'], image: IMAGES.security },
  { keys: ['design', 'figma', 'ui', 'ux', 'graphic', 'photoshop'], image: IMAGES.design },
  { keys: ['cook', 'baking', 'recipe', 'chef', 'culinary'], image: IMAGES.cooking },
  { keys: ['fitness', 'yoga', 'gym', 'workout', 'exercise'], image: IMAGES.fitness },
  { keys: ['french', 'spanish', 'english', 'language', 'translate', 'speak'], image: IMAGES.language },
  { keys: ['math', 'physics', 'science', 'academic', 'study', 'exam'], image: IMAGES.academic },
  { keys: ['business', 'marketing', 'finance', 'entrepreneur'], image: IMAGES.business },
  { keys: ['music', 'sing', 'vocal', 'audio', 'song', 'play'], image: IMAGES.music },
  { keys: ['craft', 'paint', 'draw', 'art'], image: IMAGES.arts },
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i);
  return Math.abs(h);
}

function matchKeyword(name) {
  const lower = (name || '').toLowerCase();
  for (const { keys, image } of KEYWORD_IMAGES) {
    if (keys.some(k => lower.includes(k))) return image;
  }
  return null;
}

function categoryImage(skill) {
  const cat = skill?.category;
  const variants = CATEGORY_VARIANTS[cat];
  if (variants?.length) {
    const key = `${skill?.name || ''}-${skill?._id || skill?.id || ''}`;
    return variants[hashString(key) % variants.length];
  }
  return CATEGORY_IMAGES[cat] || IMAGES.learning;
}

/** Primary thematic image for a skill */
export function getSkillImageUrl(skill) {
  if (skill?.imageUrl) return skill.imageUrl;
  return matchKeyword(skill?.name) || categoryImage(skill);
}

/** On-theme fallback — never random unrelated photos */
export function getSkillImageFallback(skill) {
  return categoryImage(skill);
}

/** Ordered list to try if a CDN URL fails */
export function getSkillImageCandidates(skill) {
  if (skill?.imageUrl) return [skill.imageUrl];

  const candidates = [];
  const keyword = matchKeyword(skill?.name);
  const category = categoryImage(skill);
  const cat = skill?.category;
  const variants = CATEGORY_VARIANTS[cat] || [];

  if (keyword) candidates.push(keyword);
  variants.forEach(v => { if (!candidates.includes(v)) candidates.push(v); });
  if (!candidates.includes(category)) candidates.push(category);
  if (!candidates.includes(IMAGES.learning)) candidates.push(IMAGES.learning);

  return candidates;
}
