# DNS Cutover Checklist

**Domain:** `xn--12cman8e0bjt1czaccb9b1fg31ad.com` (รับซื้อกล้องมือสอง.com)  
**Target:** Vercel (Astro static)  
**Production commit:** `e19264e`  
**Cutover status:** **VERIFIED** — production domain บน Vercel แล้ว (2026-06-17)

---

## 1. Pre-cutover — COMPLETE

- [x] `npm run build` ผ่าน 2,256+ หน้า
- [x] `npm run images:audit` — broken = 0
- [x] `npm run redirects:sync` — sync `_redirects` → `vercel.json`
- [x] `npm run qa:redirects` — top 20 URLs ผ่าน
- [x] curl production 28/28 (redirect + static)
- [x] `robots.txt` + `sitemap-index.xml` → 200

## 2. Redirect sync — COMPLETE

- [x] `vercel.json` — **115 redirect rules**
- [x] High-priority `_redirects` sync ครบ (gap = 0)
- [x] Encoded Thai URL variants
- [ ] **262** medium/low rules ใน `redirect-backlog.md` — เพิ่มเป็น batch เมื่อ GSC พบ 404

## 3. DNS / Production — VERIFIED

- [x] Domain ชี้ Vercel (`Server: Vercel`, SSL เขียว)
- [x] Production curl QA ผ่าน (2026-06-17)
- [x] Deploy SHA `e19264e` บน production
- [ ] ส่ง/ยืนยัน sitemap ใน GSC (`sitemap-index.xml`)
- [ ] ปิด WordPress host เมื่อ GSC stable 7 วัน

### Deployment URLs

| URL | สถานะ |
|-----|--------|
| `https://xn--12cman8e0bjt1czaccb9b1fg31ad.com` | **Production — ใช้งานได้** |
| `rubsuekongmuesong-*.vercel.app` | SSO protected (preview) |
| `rubsuekongmuesong.vercel.app` | ไม่มี alias |

## 4. Rollback plan (เก็บไว้)

- [x] บันทึก DNS records เดิมก่อน cutover
- [ ] ถ้ามีปัญหารุนแรง: revert DNS กลับ WordPress host
- [ ] WordPress ยัง online จนกว่า GSC stable 7 วัน

## 5. Post-cutover monitoring — IN PROGRESS

→ ดู **`post-cutover-monitoring.md`** (ตาราง 7 วัน)  
→ ดู **`gsc-monitoring-checklist.md`** (สัปดาห์ 2–4)  
→ ดู **`redirect-backlog.md`** (262 rules รอ GSC)

- [ ] วัน 1–7: กรอกตาราง monitoring ทุกวัน
- [ ] GSC Coverage — ไม่มี spike 404
- [ ] GSC Performance — คลิก/impression ไม่ร่วงผิดปกติ
- [ ] Core Web Vitals บน mobile

## 6. Go / No-go — PASSED

| Gate | Status |
|------|--------|
| vercel.json redirects synced | ✓ 115 rules |
| Production curl test | ✓ 28/28 |
| DNS on Vercel | ✓ verified |
| Post-cutover monitoring | → เริ่มแล้ว |

---

**Cutover date:** 2026-06-17  
**Owner:** _______________  
**DNS reverted?** No
