const sharp = require('sharp');
const fs = require('fs');
const dir = 'src/assets/projects';
const files = ['nsso-mock', 'qadam-mock', 'dreamsea-mock', '24seven-mock', 'ai-costs-mock', 'rag-mock'];
(async () => {
  for (const f of files) {
    const src = `${dir}/${f}.png`;
    if (!fs.existsSync(src)) { console.log(f, 'MISSING'); continue; }
    await sharp(src).resize({ width: 1500, withoutEnlargement: true }).webp({ quality: 82 }).toFile(`${dir}/${f}.webp`);
    console.log(`${f}.webp`, Math.round(fs.statSync(`${dir}/${f}.webp`).size / 1024) + 'KB');
  }
})();
