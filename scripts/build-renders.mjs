// Скачивает сгенерированные 3D-рендеры и оптимизирует их в WebP в public/renders/.
// Запуск: node scripts/build-renders.mjs
import sharp from "sharp";
import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "renders");

// name -> { url, width } (ширина по большей стороне для ресайза)
const RENDERS = {
  "hero-module-dark": "https://pikaso.cdnpk.net/private/production/4728040497/render.png?token=exp=1783036800~hmac=afc80f99aac9f949d64bbc2f40ce916f915188b3d68dd7839413df0c1706f1d9",
  "module-white-container": "https://pikaso.cdnpk.net/private/production/4728041404/render.png?token=exp=1783036800~hmac=48e77a3995494ccc9e28ce7168ec03c6baf46da2e7ff39ec915319bf62506853",
  "catalog-bytovka": "https://pikaso.cdnpk.net/private/production/4728041460/render.png?token=exp=1783036800~hmac=2b3a4f97c5c69aba0237d7123c6a907a2b46c91a9d2013afc3fc3b4d0a24af81",
  "catalog-bytovka-insulated": "https://pikaso.cdnpk.net/private/production/4728042012/render.png?token=exp=1783036800~hmac=ffdfecb69a58b639abe142815cc956c6a0287592f4d29ffeb286b4186829fedd",
  "catalog-blok-konteyner": "https://pikaso.cdnpk.net/private/production/4728042226/render.png?token=exp=1783036800~hmac=51b0dee6ad1886e61f693687f916dceec747f16274c60451bf2b3bdf53debdc7",
  "catalog-office-container": "https://pikaso.cdnpk.net/private/production/4728042832/render.png?token=exp=1783036800~hmac=6827e09db92cf6bce08c44d4dea89670b6b0f421ab313f2a01de391c2ff39ad5",
  "catalog-double-module": "https://pikaso.cdnpk.net/private/production/4728043213/render.png?token=exp=1783036800~hmac=796b578633756c717f481e6d73c6d646f956f274669d9a41180129e8a6454cc2",
  "catalog-hozblok": "https://pikaso.cdnpk.net/private/production/4728043919/render.png?token=exp=1783036800~hmac=e85d34c8d8b238285ad47579fe68ab0fc4d24e63b61ea52524dbc69cca9267db",
  "catalog-sanitary": "https://pikaso.cdnpk.net/private/production/4728045966/render.png?token=exp=1783036800~hmac=a1ba6a6c99a1c1fdc4cb185cce26f2ee1b831f9db26f8557681333b8e53bc35f",
  "catalog-guard-post": "https://pikaso.cdnpk.net/private/production/4728046583/render.png?token=exp=1783036800~hmac=403067f86c06b391f4407365f5c52cee74d2198b3adc2983f2fe7efd4dd9c9a7",
  "catalog-angar": "https://pikaso.cdnpk.net/private/production/4728046723/render.png?token=exp=1783036800~hmac=60f831e45e427396ddbaa9f64c836cc8a84bb9e8a6299222ca7fdd6cbb155285",
  "catalog-canopy": "https://pikaso.cdnpk.net/private/production/4728046706/render.png?token=exp=1783036800~hmac=5da1f1a0a8d9c87d72af2f8186db05492aedb5a79a40003afb22353c5461d25a",
};

await mkdir(OUT, { recursive: true });

for (const [name, url] of Object.entries(RENDERS)) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${name}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const meta = await sharp(buf).metadata();
  // Ограничиваем большую сторону до 1600px — достаточно для retina-карточек и hero.
  const out = await sharp(buf)
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, effort: 5 })
    .toBuffer();
  await writeFile(join(OUT, `${name}.webp`), out);
  console.log(`${name}.webp  ${meta.width}x${meta.height} -> ${(out.length / 1024).toFixed(0)} KB`);
}
console.log("done");
