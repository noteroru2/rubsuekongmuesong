# DNS Cutover Checklist

**Domain:** `xn--12cman8e0bjt1czaccb9b1fg31ad.com` (รับซื้อกล้องมือสอง.com)  
**Target:** Vercel (Astro static)  
**Preview:** `rubsuekongmuesong.vercel.app`  
**Base commit:** `721a586` + Phase 2 prep

> ห้ามแก้ DNS จนกว่าจะเช็คทุกข้อด้านล่างผ่านบน preview

---

## 1. Pre-cutover (ทำบน Vercel preview)

- [ ] `npm run build` ผ่าน 2,256+ หน้า
- [ ] `npm run images:audit` — broken = 0
- [ ] เปิด 6 หน้าหลัก: `/`, `/models/`, `/process/`, `/review/`, `/about/`, `/blog/`
- [ ] ทดสอบ top 20 URL จาก GSC (ดู `redirect-map.csv` SECTION 1 KEEP)
- [ ] ทดสอบ redirect สำคัญ:
  - [ ] `/sitemap_index.xml` → `/sitemap-index.xml`
  - [ ] `/tag/ร้านรับซื้อกล้อง-นครสวร/` → หน้าจังหวัด
  - [ ] `/กล้อง/ร้านรับซื้อกล้อง-อุดรธา/` → หน้าจังหวัด
- [ ] ตรวจ trailing slash: URL ไม่มี `/` ท้ายต้อง redirect หรือ serve ได้
- [ ] ตรวจ canonical ใน `<link rel="canonical">` ตรงกับ URL จริง
- [ ] ตรวจ `robots.txt` และ sitemap โหลดได้
- [ ] Sync `vercel.json` redirects จาก `_redirects` (ดู `redirect-sync-report.md`)

## 2. Redirect sync (ก่อน DNS)

- [ ] อ่าน `redirect-sync-report.md`
- [ ] ยืนยัน `_redirects` มี 58 rules (TAG + /กล้อง/ + สกลนคร)
- [ ] ยืนยัน `vercel.json` รองรับ redirect สำคัญ (ปัจจุบันมีแค่ sitemap — **ต้อง sync**)
- [ ] ถ้าใช้ Vercel: generate redirects เข้า `vercel.json` หรือใช้ Edge Middleware
- [ ] บันทึก encoded Thai URL ที่ GSC ยัง index อยู่ — เตรียม redirect ถ้า 404

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

3. ใน Vercel เพิ่ม domain ทั้ง apex และ www
4. เปิด redirect www → apex (หรือกลับกันตาม canonical)

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

---

**Owner:** _______________  
**Planned cutover date:** _______________  
**DNS reverted?** N/A until go-live
