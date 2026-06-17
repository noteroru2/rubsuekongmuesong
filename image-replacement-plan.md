# Image Replacement Plan

**Status:** Phase 1 implemented in codebase + `public/images/site/`

## Completed (Phase 1)

| Area | Old | New | Notes |
|---|---|---|---|
| Homepage hero | `/images/uploads/.../รับซื้อกล้องมือสอง.webp` | `/images/site/hero-home-1600x900.webp` | 1600×900, 117KB, preload |
| Homepage process steps | text only | 3 process images | alt ตาม brief |
| Homepage reviews | text only | LINE + transfer examples | wording: "ตัวอย่างขั้นตอน" |
| /models/ brands | mixed uploads | `/images/site/brand-*-1200x800.webp` | unified alt |
| /process/ | text only | 6-photo grid + 3 guide images | |
| /review/ | "รีวิวจริง" wording | "ตัวอย่างประสบการณ์" + gallery | no false claims |
| /about/ | map only | trust gallery 4 images | อุบล local alt |

## Phase 2 — needs real photography

| Asset needed | Purpose | Alt keyword |
|---|---|---|
| หน้าร้านจริง (wide shot) | About hero | รับซื้อกล้องมือสอง อุบลราชธานี หน้าร้าน |
| เจ้าของ/ทีม + กล้อง | About trust | ทีมงานรับซื้อกล้องมือสอง อุบลราชธานี |
| แชท LINE จริง (blur PII) | Review proof | ตัวอย่างขั้นตอนแชท LINE |
| สลิปโอนจริง (blur PII) | Review proof | ตัวอย่างขั้นตอนโอนเงิน |
| Google Business screenshot | Review | รีวิว Google รับซื้อกล้องมือสอง อุบล |

## Phase 2 — blog ogImage dedupe

See `image-plan-blog.md` for per-article mapping.

## Wording rules (enforced)

- Mockup / stock / re-used shop photos → **"ตัวอย่างขั้นตอน"** not "รีวิวจริง"
- No "อันดับ 1", "ดีที่สุด", "ราคาสูงสุด" without proof
- Blur all customer PII in chat/slip photos
