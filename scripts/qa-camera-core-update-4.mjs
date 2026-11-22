import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const names = [
  ["location-ae97a11505998e622d7a.json", "ขอนแก่น"],
  ["location-46fd004eab5959adebbe.json", "มหาสารคาม"],
  ["location-0112788194982c9ad3ae.json", "เชียงราย"],
  ["location-77d7d0fe2919384f8289.json", "นครสวรรค์"],
];

const routes = JSON.parse(readFileSync("src/data/routes-manifest.json", "utf8")).routes;
assert(routes.length >= 2090, "Unexpected route census reduction");
for (const [file, area] of names) {
  const page = JSON.parse(readFileSync("src/data/content/" + file, "utf8"));
  assert(routes.some(r => r.path === page.path && r.contentFile === file), "Route mapping altered: " + file);
  assert(page.seo.canonical.endsWith(page.path), "Canonical changed: " + area);
  assert(page.seo.robots.includes("index"), "Indexability changed: " + area);
  assert(page.seo.title.includes(area) && page.seo.h1.includes(area), "Area-specific metadata missing: " + area);
  assert(page.seo.metaDescription.includes("LINE @webuy") && page.seo.metaDescription.length < 175, "Invalid concise meta: " + area);
  assert(page.bodyHtml.includes("อุบลราชธานี"), "Storefront attribution missing: " + area);
  assert(page.bodyHtml.includes("LINE @webuy"), "Contact missing: " + area);
  const article = page.schemaGraph.find(x => x["@type"] === "Article");
  const webPage = page.schemaGraph.find(x => x["@type"] === "WebPage");
  assert(article?.headline === page.seo.h1, "Article headline stale: " + area);
  assert(webPage?.name === page.seo.title, "WebPage name stale: " + area);
  for (const stale of ["เราไปรับถึงบ้าน", "พร้อมจ่ายสดถึงที่", "ศรีสะเกษเป็นจังหวัด", "ให้ราคาสูงสุด"]) {
    assert(!page.bodyHtml.includes(stale) && !page.seo.title.includes(stale), "Unverified claim: " + area + ": " + stale);
  }
}
console.log("PASS: 4 GSC-priority camera pages, canonical/index protection, content and schema alignment");
