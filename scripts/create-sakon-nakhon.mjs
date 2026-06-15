import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dataDir = join(root, 'src/data/content');
const SITE_URL = 'https://xn--12cman8e0bjt1czaccb9b1fg31ad.com';

const path = '/รับซื้อกล้อง/รับซื้อกล้องมือสอง-สกลนคร/';
const fullUrl = SITE_URL + path;
const id = 'location-' + createHash('md5').update(path).digest('hex').slice(0, 20);
const now = new Date().toISOString();

const title = 'รับซื้อกล้องมือสอง สกลนคร บริการถึงที่ ให้ราคาสูงสุด ไม่มีค่าธรรมเนียม';
const h1 = 'รับซื้อกล้องมือสอง สกลนคร บริการรับถึงบ้าน ให้ราคาสูงสุด';
const metaDesc = 'บริการรับซื้อกล้องมือสอง สกลนคร ถึงบ้าน ให้ราคาสูงสุด ประเมินฟรี จ่ายเงินสดทันที ทุกรุ่นทุกยี่ห้อ Canon Sony Fuji Nikon ไม่มีค่าธรรมเนียม ทักไลน์ @WEBUY';

const bodyHtml = `<p>บริการ<strong>รับซื้อกล้องมือสอง สกลนคร</strong> ถึงพี่น้องชาวสกลนครทุกท่านครับ สกลนครเมืองแห่งธรรมชาติอันงดงาม ริมหนองหาน และวัฒนธรรมอีสานที่เข้มแข็ง ผมอำพล จาก รับซื้อกล้องมือสอง.com ครับ</p>
<p>ผมเข้าใจดีว่าสกลนครเป็นเมืองที่นักถ่ายภาพหลายท่านรักมาก ทั้งทิวทัศน์หนองหาน ป่าภูพาน และงานประเพณีอันสวยงาม หากวันนี้คุณต้องการอัปเกรดกล้อง หรือมีกล้องที่ไม่ได้ใช้งานแล้ว ผมพร้อมให้ราคาสูงสุดและบริการรับซื้อกล้องมือสองถึงที่ในสกลนครครับ</p>
<p style="text-align: center;"><span style="color: #ff0000;"><strong>ต้องการขายกล้องมือสอง ให้เลือกเรา เช็คราคาก่อนได้ฟรี</strong></span></p>
<p style="text-align: center;"><span style="color: #ff0000;"><strong>Line : @WEBUY ( มีตัว @ ด้วยนะครับ )</strong></span></p>
<p style="text-align: center;"><span style="color: #ff0000;"><strong>โทร : 064-2579353 คุณโน๊ต</strong></span></p>
<h2><span style="color: #ff0000;"><b>ทำไมชาวสกลนครถึงเลือกขายกล้องกับเรา?</b></span></h2>
<p>ท่ามกลางตลาดซื้อขายมือสองมากมาย เราสร้างความแตกต่างด้วยบริการที่เข้าใจและเข้าถึงคุณได้ง่ายที่สุด</p>
<h3><b>ให้ราคาสูงสุด คุยกันได้แบบตรงไปตรงมา รับซื้อกล้องมือสอง สกลนคร</b></h3>
<p>ผมประเมินราคากล้องและเลนส์ของคุณจากสภาพจริงและความต้องการของตลาด ไม่มีการกดราคาอย่างไร้เหตุผล คุณจะได้รับข้อเสนอที่ยุติธรรมและสูงที่สุด เพราะผมเชื่อว่าอุปกรณ์ทุกชิ้นมีคุณค่าในตัวเอง</p>
<h3><b>บริการนัดรับถึงบ้าน รับซื้อกล้องมือสอง สกลนคร ปลอดภัย 100%</b></h3>
<p>ไม่ต้องเสียเวลาเดินทาง ไม่ต้องเสี่ยงส่งพัสดุ ผมและทีมงานสามารถนัดเจอเพื่อรับของและชำระเงินสดให้คุณได้ทันทีในจุดที่คุณสะดวก ไม่ว่าจะเป็นในตัวเมืองสกลนคร หรือบริเวณหนองหาน ห้างดังในเมือง</p>
<h3><b>คุยกับคนเล่นกล้องโดยตรง ไม่ผ่านนายหน้า</b></h3>
<p>คุณจะได้คุยกับผมโดยตรง คนที่เข้าใจว่า <b><a href="/article/กล้อง-dslr-คืออะไร/">กล้อง DSLR คืออะไร?</a></b> และ <b><a href="/article/กล้อง-mirrorless/">กล้อง Mirrorless</a></b> คืออะไร เราพูดภาษาเดียวกัน ทำให้การซื้อขายเป็นไปอย่างราบรื่นและสบายใจ</p>
<p>&nbsp;</p>
<h2><span style="color: #ff0000;"><b>เรารับซื้อกล้องทุกประเภทในสกลนคร</b></span></h2>
<p>ไม่ว่าจะเป็นกล้องรุ่นใดหรือสภาพอย่างไร เราพร้อมประเมินราคาให้ฟรีทันที รับซื้อกล้องมือสอง สกลนคร ทุกรุ่นทุกยี่ห้อ</p>
<ul>
<li><b>กล้อง DSLR มือสอง:</b> Canon EOS, Nikon D-Series ทุกรุ่น แม้มีร่องรอยการใช้งาน ก็ยังให้ราคาสูง</li>
<li><b>กล้อง Mirrorless มือสอง:</b> Sony Alpha, Fujifilm X-Series, Canon EOS M, EOS R และ Nikon Z เรารับซื้อทุกรุ่น</li>
<li><b>กล้องคอมแพคและกล้องฟิล์ม:</b> รับซื้อกล้องคอมแพคคุณภาพดีและกล้องฟิล์มคลาสสิก ราคาตลาดยังดีอยู่ครับ</li>
<li><b>เลนส์ทุกชนิด:</b> เลนส์ซูม เลนส์ไพรม์ เลนส์ manual ทุกยี่ห้อ รับซื้อในราคาที่ยุติธรรม</li>
<li><b>อุปกรณ์เสริม:</b> แฟลช ขาตั้ง ฟิลเตอร์ กระเป๋ากล้องคุณภาพดี ก็รับซื้อเช่นกันครับ</li>
</ul>
<p>&nbsp;</p>
<h2><span style="color: #ff0000;"><b>3 ขั้นตอนง่ายๆ สำหรับการขายกล้องในสกลนคร</b></span></h2>
<ol>
<li><b>ส่งรูปมาประเมิน:</b> แอดไลน์ <b>@WEBUY</b> แล้วส่งรูปกล้อง/เลนส์ในหลายๆ มุม พร้อมแจ้งรุ่นและสภาพเบื้องต้น</li>
<li><b>รับข้อเสนอราคา:</b> ผมจะประเมินราคาเบื้องต้นและแจ้งกลับไปให้เร็วที่สุด ภายในไม่กี่ชั่วโมง</li>
<li><b>นัดเจอ รับเงินสด:</b> เมื่อตกลงกันแล้ว เราจะนัดสถานที่ที่คุณสะดวกในสกลนครเพื่อเจอตัวจริง ตรวจเช็คของ และจ่ายเงินสดให้คุณทันที!</li>
</ol>
<p>&nbsp;</p>
<h2><span style="color: #ff0000;"><b>พื้นที่นัดรับในสกลนคร: สะดวก รวดเร็ว</b></span></h2>
<p>เพื่อความสะดวกของคุณ เรามีบริการนัดรับในโซนหลักๆ ทั่วสกลนครครับ</p>
<h4><b>โซนตัวเมืองสกลนคร</b></h4>
<p>บริเวณถนนสายหลักในเมือง ห้างสรรพสินค้า หรือคาเฟ่ที่คุณสะดวก เราสามารถเข้าพบได้ทั้งนั้นครับ</p>
<h4><b>โซนริมหนองหานและมหาวิทยาลัย</b></h4>
<ul>
<li>บริเวณมหาวิทยาลัยราชภัฏสกลนคร</li>
<li>ริมหนองหาน สถานที่ยอดนิยมนัดพบปะ</li>
<li>ร้านกาแฟหรือร้านอาหารในตัวเมืองที่คุณสะดวก</li>
</ul>
<h4><b>พื้นที่อื่นๆ และต่างอำเภอ</b></h4>
<p>หากคุณอยู่อำเภอรอบนอก เช่น วาริชภูมิ, สว่างแดนดิน, โพนนาแก้ว สามารถติดต่อเข้ามาสอบถามเพื่อนัดหมายเป็นพิเศษได้ครับ</p>
<p>&nbsp;</p>
<h2><span style="color: #ff0000;"><b>คำถามที่พบบ่อยจากพี่น้องชาวสกลนคร</b></span></h2>
<ul>
<li><b>Q: ขายกล้องที่ไม่มีกล่องหรืออุปกรณ์ครบได้ไหม?</b> A: ได้ครับ ไม่มีกล่องก็ขายได้ ผมประเมินจากสภาพกล้องและการทำงานเป็นหลัก กล่องช่วยเพิ่มราคาได้บ้างแต่ไม่ใช่ปัจจัยหลักครับ</li>
<li><b>Q: กล้องที่ซื้อมานานมากแล้ว ยังขายได้ราคาดีไหม?</b> A: ขึ้นอยู่กับสภาพและ Shutter Count ครับ ลองส่งรูปมาให้ผมดูก่อนได้เลย ประเมินฟรีไม่มีค่าใช้จ่ายครับ</li>
<li><b>Q: รับซื้อกล้อง GoPro หรือโดรน DJI ด้วยไหม?</b> A: รับซื้อครับ ทั้ง GoPro, DJI และอุปกรณ์วิดีโอมือสองอื่นๆ ทักมาสอบถามได้เลยครับ</li>
<li><b>Q: จะรู้ได้อย่างไรว่ากล้องของตัวเองมีราคาเท่าไหร่?</b> A: ลองอ่านบทความ <a href="/article/shutter-count/">วิธีเช็ค Shutter Count กล้อง</a> ของเราก่อนได้ครับ แล้วทักมาประเมินฟรีได้เลย</li>
</ul>
<p>&nbsp;</p>
<h2><span style="color: #ff0000;"><b>เปลี่ยนกล้องของคุณให้เป็นเงินสดได้แล้ววันนี้ ที่สกลนคร</b></span></h2>
<p>ชาวสกลนครไม่ต้องไปหาที่ขายไกล หรือเสี่ยงขายออนไลน์เองแล้วครับ ให้มืออาชีพที่เข้าใจคุณค่าของกล้องดูแลดีกว่า</p>
<p><span style="color: #ff6600;"><b>พร้อมแล้วทักมาได้เลย ผมรอประเมินราคากล้องของคุณอยู่ครับ!</b></span></p>
<p><span style="color: #ff6600;"><b>Line ID: @WEBUY</b> <b>โทร: 064-2579353</b></span></p>
<p>&nbsp;</p>
<blockquote><p>ต้องการขายสินค้าอย่างอื่น เช่น คอมพิวเตอร์ โน๊ตบุ๊ค ไอโฟน ไอแพด ติดต่อได้ที่&nbsp;<a href="https://amphontd.com/" target="_blank" rel="noopener">amphontd.com รับซื้อสินค้าไอทีทุกชนิด</a></p></blockquote>
`;

const schemaGraph = [
  {
    "@type": "WebPage",
    "@id": fullUrl + "#webpage",
    "url": fullUrl,
    "name": title,
    "isPartOf": { "@id": SITE_URL + "/#website" },
    "about": { "@id": SITE_URL + "/#organization" },
    "primaryImageOfPage": { "@id": fullUrl + "#primaryimage" },
    "datePublished": now,
    "dateModified": now,
    "description": metaDesc,
    "breadcrumb": { "@id": fullUrl + "#breadcrumb" },
    "inLanguage": "th"
  },
  {
    "@type": "BreadcrumbList",
    "@id": fullUrl + "#breadcrumb",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/" },
      { "@type": "ListItem", "position": 2, "name": "รับซื้อกล้อง", "item": SITE_URL + "/รับซื้อกล้อง/" },
      { "@type": "ListItem", "position": 3, "name": "รับซื้อกล้องมือสอง สกลนคร" }
    ]
  },
  {
    "@type": "WebSite",
    "@id": SITE_URL + "/#website",
    "url": SITE_URL + "/",
    "name": "รับซื้อกล้องมือสอง",
    "description": "ให้บริการรับซื้อกล้องมือสองทุกรุ่น ทุกยี่ห้อ",
    "publisher": { "@id": SITE_URL + "/#organization" },
    "inLanguage": "th"
  },
  {
    "@type": "Organization",
    "@id": SITE_URL + "/#organization",
    "name": "รับซื้อกล้องมือสอง",
    "url": SITE_URL + "/",
    "logo": {
      "@type": "ImageObject",
      "inLanguage": "th",
      "@id": SITE_URL + "/#/schema/logo/image/",
      "url": "/images/uploads/2025/06/cropped-ChatGPT-Image-19-มิ.ย.-2568-22_55_11-1-3.webp",
      "contentUrl": "/images/uploads/2025/06/cropped-ChatGPT-Image-19-มิ.ย.-2568-22_55_11-1-3.webp",
      "width": 512,
      "height": 512,
      "caption": "รับซื้อกล้องมือสอง"
    },
    "image": { "@id": SITE_URL + "/#/schema/logo/image/" }
  }
];

const pageData = {
  id,
  oldUrl: fullUrl,
  path,
  pageType: "location",
  seo: {
    title,
    metaDescription: metaDesc,
    canonical: fullUrl,
    h1,
    ogTitle: title,
    ogDescription: metaDesc,
    ogUrl: fullUrl,
    ogType: "article",
    wordCount: 450,
    robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
  },
  bodyHtml,
  schemaGraph,
  datePublished: now,
  dateModified: now
};

// Write the new location JSON file
const outFile = join(dataDir, id + '.json');
writeFileSync(outFile, JSON.stringify(pageData));
console.log('Created:', outFile);

// Update blog-index.json
const indexPath = join(root, 'src/data/blog-index.json');
const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const newEntry = {
  path,
  title,
  excerpt: metaDesc,
  image: '/images/uploads/2025/06/รับซื้อกล้องมือสอง.webp',
  imageAlt: h1,
  datePublished: now,
  pageType: 'location'
};
index.posts.unshift(newEntry);
index.total = index.posts.length;
index.generatedAt = now;
writeFileSync(indexPath, JSON.stringify(index, null, 2));
console.log('Updated blog-index.json, total posts:', index.posts.length);
console.log('New page:', path);
console.log('File ID:', id);
