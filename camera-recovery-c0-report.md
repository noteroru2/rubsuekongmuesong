# Camera Recovery — Batch C0: Ranking Loss + Index Surface Audit

## Verdict

`ALGORITHMIC_VISIBILITY_INDEX_SURFACE_RECOVERY_NEEDED`

ความเชื่อมั่น: **สูง**

Batch C0 เป็น audit-only batch ไม่มีการเปลี่ยน production behavior ของเว็บไซต์

## GSC inflection

ข้อมูล Search Console finalized ถึง `2026-09-06`

| ช่วง | Clicks | Impressions | CTR | Avg position |
|---|---:|---:|---:|---:|
| 2026-07-13 → 2026-08-09 | 533 | 7,848 | 6.79% | 6.92 |
| 2026-08-10 → 2026-09-06 | 371 | 5,167 | 7.18% | 7.80 |
| 2026-08-17 → 2026-08-30 | 216 | 3,007 | 7.18% | 7.30 |
| 2026-08-31 → 2026-09-06 | 39 | 353 | 11.05% | 12.88 |

จุดเปลี่ยนหลักคือ **31 สิงหาคม 2026**

- 28 ส.ค.: 17 clicks / 205 impressions / position 6.19
- 29 ส.ค.: 11 / 162 / 7.67
- 30 ส.ค.: 14 / 132 / 8.13
- **31 ส.ค.: 4 / 44 / 19.52**
- หลังจากนั้น impressions อยู่เพียงประมาณ 38–65 ต่อวันจนถึงข้อมูล finalized ล่าสุด

CTR หลังจุดตกกลับสูงขึ้น จึงไม่ใช่ CTR collapse แต่เป็น **visibility/ranking coverage loss**

## Repository / deployment findings

- `main` HEAD ตอน audit คือ `3d82193dca0bd284a3291d7510f2613b04c1fda3`
- commit ล่าสุดของ source อยู่วันที่ 21 มิถุนายน 2026
- ไม่มี source commit ใกล้วันที่ 31 สิงหาคม 2026
- WordPress → Astro production cutover ถูก verify ตั้งแต่ 17 มิถุนายน 2026
- `robots.txt` ไม่ได้ block Google
- canonical/index defaults ไม่พบ site-wide catastrophic bug

ดังนั้น rollback source commit รอบ 31 สิงหาคมไม่ใช่แนวทางหลัก เพราะไม่มี commit ดังกล่าวใน repo

## Index-surface risk found

### 1. Sitemap เกือบเป็น index-all

`astro.config.mjs` กรอง sitemap ออกเพียง `/404/` เท่านั้น จึงไม่มี lifecycle quality gate สำหรับ routes อื่น

### 2. Dynamic route สร้าง manifest แทบทั้งหมด

`src/pages/[...path].astro` ใช้ `getAllRoutes()` แล้วสร้าง static path สำหรับ route ส่วนใหญ่ใน manifest

### 3. Blog รวม service/location SEO pages

`src/lib/articles.ts` ระบุ `BLOG_PAGE_TYPES = post + location + article` และ comment ว่า blog surface มี buyback SEO pages ประมาณ **1,600+**

ดังนั้น `/blog/` ไม่ได้เป็น editorial hub อย่างเดียว แต่ดึง location/service-style pages เข้า archive ด้วย

### 4. Legacy families ยังคงอยู่

GSC ก่อนจุดตกยังเห็น performance จากกลุ่ม:

- `/กล้อง/`
- `/tag/`
- `/uncategorized/`

หลาย URL เป็น legacy/templated intent ที่ทับกับ province money pages

### 5. ปัญหานี้เคยถูกพบมาก่อนแล้ว

SEO cleanup report เดิมของ repo ระบุจาก 392 URLs ที่มี GSC data:

- 40 province `/รับซื้อกล้อง/` = 73.21% ของ clicks
- 317 `/กล้อง/` = 13.88% และระบุว่าส่วนใหญ่เป็น thin/duplicate content
- มีแผน KEEP / NOINDEX / REDIRECT / DELETE อยู่แล้ว แต่ index architecture ปัจจุบันยังไม่ได้บังคับ lifecycle กลาง

### 6. Generic FAQ schema ถูกเติมจำนวนมาก

`SEOHead.astro` ใช้ generic FAQ fallback สำหรับ `location`, `post`, `article`, `homepage` เมื่อ content ไม่มี Q&A เพียงพอ ทำให้ templated pages จำนวนมากมี schema pattern ซ้ำ

### 7. Related linking ยังหลวม

Related posts เริ่มจาก first URL segment แต่ถ้าไม่พอจะ fill ด้วย latest pages จาก blog pool ซึ่ง blog pool เองมีทั้ง post/location/article

### 8. Redirect cleanup ยัง partial

รายงาน redirect เดิมระบุ:

- redirect-map.csv มี 314 planned 301 actions
- vercel.json live set มี 115 rules ณ migration phase
- มี backlog/legacy rules จำนวนมากที่ยังไม่ได้ consolidate

ข้อสังเกต: redirect gap อาจทำให้ legacy signals กระจาย แต่ไม่ใช่คำอธิบายเดี่ยวสำหรับ abrupt Aug-31 loss เพราะ canonical province winners เองก็เสีย impressions พร้อมกัน

## Winner protection list

ห้าม bulk noindex / redirect กลุ่มต่อไปนี้ใน recovery:

1. Province money pages ที่มี GSC winner signal โดยเฉพาะ ขอนแก่น, นครสวรรค์, เชียงราย, ลำปาง, พิษณุโลก, สุราษฎร์, อุบล และ winner จังหวัดอื่น
2. `/article/shutter-count/`
3. `/article/วิธีแพ็คกล้อง/`
4. Editorial pages อื่นที่มี proven impressions/clicks
5. Brand/model pages ที่มี distinct intent และ GSC signal

## Candidate lifecycle for C1

### INDEX

- proven `/รับซื้อกล้อง/` province winners
- unique province/service pages ที่มี signal หรือ distinct value
- high-demand editorial articles
- useful brand/model hubs และ model pages ที่ distinct
- homepage / core hubs

### HOLD_NOINDEX

- thin legacy pages ที่ยังไม่มี owner ชัด
- low/no-signal templated pages ที่ต้อง review
- archive/tag-like routes ที่ไม่ควรเป็น search landing page แต่ยังต้องเก็บไว้ชั่วคราว

### REDIRECT

- legacy `/กล้อง/`, `/tag/`, `/uncategorized/` ที่มี intent owner ชัดเจน
- duplicate province variants → canonical province owner
- duplicate model/article intent → owner ที่ตรงที่สุด

ห้าม redirect unrelated pages ไป homepage เพื่อกำจัด URL แบบเหมา

### GONE

- obsolete zero-value routes ที่ไม่มี signal, backlink/useful content และไม่มี owner ที่เกี่ยวข้อง

## Recovery sequence

### C1 — Index Surface Lifecycle Recovery

สร้าง policy กลาง `INDEX / HOLD_NOINDEX / REDIRECT / GONE`, ให้ sitemap และ route generation ใช้ policy เดียวกัน และเปลี่ยน blog ให้เป็น editorial-only

### C2 — Legacy Ownership Consolidation

ใช้ GSC-driven redirect map รวม `/กล้อง/`, `/tag/`, `/uncategorized/` ไป owner ที่เหมาะสม โดย protect current winners

### C3 — Schema + Template Hygiene

แยก Service/Location กับ Article, จำกัด FAQ schema, ทำ H1/schema hygiene และลด duplicated template signals

### C4 — Topical Internal Authority

แยก Province / Editorial / Brand / Model clusters และทำ related links แบบ same-intent

### C5 — Winner Ranking Recovery

หลัง index surface stabilizes ค่อย optimize province winners และ high-demand articles จาก GSC ใหม่

## C0 decision

**ไม่ rollback source** และ **ไม่ bulk rewrite content 1,600+ หน้า**

งานถัดไปที่ต้องทำคือ:

**Camera C1 — Index Surface Lifecycle Recovery**
