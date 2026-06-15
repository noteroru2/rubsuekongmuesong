# GSC Monitoring Checklist — รอบ 2–4 สัปดาห์

หลัง deploy money pages upgrade ให้ตรวจใน Google Search Console ทุก **2 สัปดาห์** เป็นเวลา **4–8 สัปดาห์**

## บทความ (CTR + Conversion)

| URL | Baseline (ก่อน deploy) | ตรวจ | เป้าหมาย |
|---|---|---|---|
| `/article/shutter-count/` | 13 คลิก, 945 imp, CTR 1.38% | Clicks, CTR, Avg position | CTR > 2.5%, คลิก > 20/เดือน |
| `/article/กล้อง-360-องศา/` | 11 คลิก, 521 imp, CTR 2.11% | Clicks, CTR | CTR > 3%, เพิ่ม CTA click ผ่าน LINE |
| `/article/วิธีแพ็คกล้อง/` | 11 คลิก, 281 imp, CTR 3.91% | Clicks, CTR | รักษา CTR > 3.5%, conversion ส่ง EMS |

### วิธีเช็คใน GSC
1. Performance → Pages → กรอง URL ข้างต้น
2. เปรียบเทียบ 28 วันล่าสุด vs 28 วันก่อนหน้า
3. ดู Query ที่ impression สูงแต่ CTR ต่ำ → ปรับ title/meta รอบถัดไป

---

## หน้าจังหวัด (Avg Position + คลิก)

### Top 10 (money pages รอบ 1)
ขอนแก่น, มหาสารคาม, ร้อยเอ็ด, อุบล, สุราษฎร์, เชียงราย, ลำปาง, ตรัง, บุรีรัมย์, ลพบุรี

### รอบ 2 (KEEP #11–18 + ขยาย)
ปราจีนบุรี, พะเยา, อุดรธานี, ศรีสะเกษ, กาญจนบุรี, พิษณุโลก, นครสวรรค์, ชุมพร, **กาฬสินธุ์**, **สุรินทร์**

| Metric | เป้าหมาย 4 สัปดาห์ |
|---|---|
| Avg position จังหวัด top 10 | ลดลง ≥ 0.3 ตำแหน่ง |
| คลิกรวม `/รับซื้อกล้อง/` | เพิ่ม ≥ 10% |
| CTR หน้าจังหวัดที่ position < 8 | > 10% |

---

## Hub & Homepage

| URL | ตรวจ |
|---|---|
| `/category/รับซื้อกล้อง/` | Impressions, คลิกจาก query "รับซื้อกล้อง [จังหวัด]" |
| `/` (homepage) | คลิก, ดูว่า internal link ไปจังหวัด/models ช่วย distribution หรือไม่ |
| `/models/` | คลิก brand queries (canon, sony รับซื้อ) |

---

## Red flags — ต้องแก้ทันที

- คลิกลด > 20% บนหน้า KEEP ใดๆ
- Coverage: Soft 404 หรือ Crawled not indexed เพิ่มขึ้น
- Redirect error ใน `_redirects`
- H1 ซ้ำ / canonical ผิด (ตรวจด้วย `node scripts/check-money-build.mjs`)

---

## บันทึกผล (เติมหลังเช็คแต่ละรอบ)

| วันที่ | สรุป | Action ถัดไป |
|---|---|---|
| | | |
| | | |
