# Post-Cutover Monitoring

**Production commit:** `e19264e`  
**Domain:** https://xn--12cman8e0bjt1czaccb9b1fg31ad.com (รับซื้อกล้องมือสอง.com)  
**Cutover verified:** 2026-06-17 — curl QA 28/28 บน production domain  
**Redirect rules live:** 115 ใน `vercel.json`  
**Backlog:** 262 medium/low rules → ดู `redirect-backlog.md`

---

## เป้าหมาย 7 วันแรก

1. ไม่มี spike 404 / soft 404 ใน GSC
2. คลิก/impression หน้า KEEP ไม่ร่วง >20%
3. Sitemap ถูก crawl และ index ต่อเนื่อง
4. เพิ่ม redirect **เฉพาะ** URL ที่ GSC รายงาน 404 จริง (batch ≤10/deploy)
5. บันทึกผลทุกวันในตารางด้านล่าง

---

## Checklist รายวัน (ทำทุกวัน × 7 วัน)

### เช้า (~10 นาที)

- [ ] เปิด GSC → **Overview** — ดู clicks/impressions เทียบวันก่อน
- [ ] **Pages** → กรอง 28 วัน — top pages ยังมี traffic ปกติ
- [ ] **Indexing → Pages** — จำนวน indexed / not indexed
- [ ] **Indexing → Sitemaps** — `sitemap-index.xml` status = Success
- [ ] **Experience → Page indexing** — ดู 404, soft 404, redirect error ใหม่
- [ ] curl สุ่ม 3 URL:
  - [ ] `/robots.txt` → 200
  - [ ] `/sitemap-index.xml` → 200
  - [ ] 1 redirect จาก `/tag/` หรือ `/กล้อง/` → 308 ไปปลายทางถูก

### บ่าย (ถ้ามี 404 ใหม่)

- [ ] Export URL ที่ error จาก GSC
- [ ] จัด priority (HIGH / MEDIUM / LOW) ตามด้านล่าง
- [ ] จับคู่กับ `redirect-backlog.md`
- [ ] **ห้าม** bulk-add 262 rules — เพิ่มเฉพาะที่จำเป็น
- [ ] บันทึก action ในตารางรายวัน

### เย็น (สรุป)

- [ ] กรอกแถวในตารางติดตาม
- [ ] ถ้ามี HIGH 404 → วางแผน batch redirect วันถัดไป

---

## GSC 404 priority rules

| Priority | เงื่อนไข | Action |
|----------|---------|--------|
| **HIGH** | มี impression/click ใน GSC หรือเป็น money page (`/รับซื้อกล้อง/`, `/article/` top) | เพิ่ม redirect ภายใน 24 ชม., batch deploy |
| **MEDIUM** | Google crawl แล้ว แต่ไม่มี impression | รอ batch สัปดาห์ 2 หรือรวมกับ HIGH |
| **LOW** | ไม่มีข้อมูล performance | เก็บใน backlog, ไม่รีบ |

---

## ตารางติดตาม 7 วัน

| วันที่ตรวจ | GSC sitemap status | Indexed pages | Not indexed | 404 URLs ใหม่ | Soft 404 | Redirect errors | Top query (impression) | Top page (clicks / imp) | Action ที่ทำ |
|------------|-------------------|---------------|-------------|---------------|----------|-----------------|------------------------|-------------------------|--------------|
| 2026-06-17 | Success (baseline) | _กรอกจาก GSC_ | _กรอก_ | 0 (baseline) | 0 | 0 | _กรอก_ | ขอนแก่น / homepage | Cutover verified, curl 28/28 |
| 2026-06-18 | | | | | | | | | |
| 2026-06-19 | | | | | | | | | |
| 2026-06-20 | | | | | | | | | |
| 2026-06-21 | | | | | | | | | |
| 2026-06-22 | | | | | | | | | |
| 2026-06-23 | | | | | | | | | |

### วิธีกรอกข้อมูลจาก GSC

| คอลัมน์ | ที่มาใน GSC |
|---------|-------------|
| GSC sitemap status | Indexing → Sitemaps → `sitemap-index.xml` |
| Indexed pages | Indexing → Pages → "Indexed" count |
| Not indexed | Indexing → Pages → "Not indexed" reasons |
| 404 URLs ใหม่ | Indexing → Pages → filter "Not found (404)" → นับ URL ใหม่เทียบวันก่อน |
| Soft 404 | Indexing → Pages → "Soft 404" |
| Redirect errors | Indexing → Pages → "Page with redirect" / Settings → Crawl stats |
| Top query | Performance → Search results → Queries (28 days) |
| Top page | Performance → Pages → เรียงตาม Clicks |

---

## Top pages ที่ต้องจับตา (baseline GSC)

| URL | Baseline clicks | หมายเหตุ |
|-----|-----------------|----------|
| `/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ขอนแ/` | 134 | money #1 |
| `/รับซื้อกล้อง/รับซื้อกล้องมือสอง-มหาส/` | 36 | money |
| `/รับซื้อกล้อง/รับซื้อกล้องมือสอง-ร้อย/` | 35 | money |
| `/รับซื้อกล้อง/ร้านรับซื้อกล้องอุบลรา/` | 28 | money |
| `/` | 8 | homepage |
| `/article/shutter-count/` | 13 | article demand สูง |

รายละเอียดเพิ่ม: `gsc-monitoring-checklist.md`

---

## Red flags — แก้ทันที

- คลิกลด >20% บนหน้า KEEP ใดๆ ใน 48 ชม.
- 404 เพิ่ม >5 URL/วัน
- Redirect chain >1 hop (ทดสอบด้วย `curl -I --max-redirs 2`)
- `sitemap-index.xml` ไม่ Success
- `npm run images:audit` broken > 0 หลัง deploy

---

## Redirect batch log

| Batch | Date | URLs added | Commit | curl verified |
|-------|------|------------|--------|---------------|
| 0 (initial) | 2026-06-17 | 115 (Phase 3) | e19264e | ✓ 28/28 |
| 1 | | | | |

---

## คำสั่ง QA รายสัปดาห์

```bash
npm run build
npm run images:audit
npm run redirects:report
npm run qa:redirects
node scripts/curl-vercel-qa.mjs https://xn--12cman8e0bjt1czaccb9b1fg31ad.com
```

---

## หลัง 7 วัน

- [ ] สรุป indexed vs baseline
- [ ] ตัดสินใจ batch redirect รอบ 2 จาก GSC 404 ที่ยังเหลือ
- [ ] เปิด monitoring รอบ 2–4 สัปดาห์ ตาม `gsc-monitoring-checklist.md`
- [ ] Phase 2 real trust images ตาม `real-image-shot-list.md`
