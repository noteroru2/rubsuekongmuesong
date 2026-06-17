# DNS Cutover Checklist

**Domain:** `xn--12cman8e0bjt1czaccb9b1fg31ad.com` (รับซื้อกล้องมือสอง.com)  
**Target:** Vercel (Astro static)  
**Preview:** `rubsuekongmuesong.vercel.app`  
**Base commit:** Phase 3 — Vercel redirect sync

> ห้ามแก้ DNS จนกว่าจะเช็คทุกข้อด้านล่างผ่านบน **Vercel preview หลัง deploy**

---

## 1. Pre-cutover (ทำบน Vercel preview)

- [ ] `npm run build` ผ่าน 2,256+ หน้า
- [ ] `npm run images:audit` — broken = 0
- [ ] `npm run redirects:sync` — sync `_redirects` → `vercel.json`
- [ ] `npm run qa:redirects` — top 20 URLs ผ่าน
- [ ] เปิด 6 หน้าหลัก: `/`, `/models/`, `/process/`, `/review/`, `/about/`, `/blog/`
- [ ] ทดสอบ top 20 URL จาก GSC (ดู `redirect-map.csv` SECTION 1 KEEP)
- [ ] ทดสอบ redirect สำคัญบน **preview URL จริง** (ไม่ใช่แค่ local simulation):
  - [ ] `/sitemap_index.xml` → `/sitemap-index.xml`
  - [ ] `/tag/ร้านรับซื้อกล้อง-นครสวร/` → หน้าจังหวัด
  - [ ] `/กล้อง/ร้านรับซื้อกล้อง-อุดรธา/` → หน้าจังหวัด
- [ ] ตรวจ trailing slash: URL ไม่มี `/` ท้ายต้อง redirect หรือ serve ได้
- [ ] ตรวจ canonical ใน `<link rel="canonical">` ตรงกับ URL จริง
- [ ] ตรวจ `robots.txt` และ `sitemap-index.xml` โหลดได้

## 2. Redirect sync (Phase 3 — done in code)

- [x] `npm run redirects:sync` — สร้าง `vercel.json` redirects จาก `_redirects`
- [x] Encoded Thai URL variants เพิ่มใน `vercel.json`
- [ ] อ่าน `vercel-redirect-sync-report.md` หลัง deploy
- [ ] ยืนยันบน Vercel preview ว่า redirect ทำงาน (curl -I)
- [ ] **262** redirect-map.csv 301 (medium/low) ยังไม่ sync — monitor GSC หลัง cutover

## 3. DNS changes (ทำเมื่อ preview พร้อม)

> **ทำที่ registrar/DNS provider เท่านั้น — ไม่แก้ในโค้ด**

### Option A: Vercel nameservers (แนะนำ)

1. ใน Vercel → Project → Domains → Add `xn--12cman8e0bjt1czaccb9b1fg31ad.com`
2. เปลี่ยน NS ที่ registrar เป็น nameservers ที่ Vercel ให้
3. รอ propagate (15 นาที – 48 ชม.)

### Option B: A/CNAME record

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` (Vercel) |
| CNAME | `www` | `cname.vercel-dns.com` |

1. ใน Vercel เพิ่ม domain ทั้ง apex และ www
2. เปิด redirect www → apex (หรือกลับกันตาม canonical)

### หลังเปลี่ยน DNS

- [ ] `dig` / `nslookup` ชี้ Vercel แล้ว
- [ ] SSL certificate ออกอัตโนมัติ (HTTPS เขียว)
- [ ] ทดสอบ homepage + 3 หน้าจังหวัด top traffic
- [ ] ส่ง sitemap ใหม่ใน Google Search Console
- [ ] ตรวจ `gsc-monitoring-checklist.md` สัปดาห์แรก

## 4. Rollback plan

- [ ] บันทึก DNS records เดิม (WordPress host) ก่อนเปลี่ยน
- [ ] ถ้ามีปัญหา: revert A/CNAME หรือ NS กลับภายใน 5 นาที
- [ ] WordPress ยัง online จนกว่า GSC stable 7 วัน

## 5. Post-cutover monitoring (7 วัน)

- [ ] GSC Coverage — ไม่มี spike 404
- [ ] GSC Performance — คลิก/impression ไม่ร่วงผิดปกติ
- [ ] ตรวจ redirect chain ไม่เกิน 1 hop
- [ ] Core Web Vitals บน mobile

## 6. Go / No-go

| Gate | Required |
|------|----------|
| vercel.json redirects synced | ✓ Phase 3 |
| qa:redirects local pass | ✓ |
| Vercel preview curl test | **ยังต้องทำก่อน DNS** |
| Real trust photos | ไม่บล็อก cutover |

---

**Owner:** _______________  
**Planned cutover date:** _______________  
**DNS reverted?** N/A until go-live
