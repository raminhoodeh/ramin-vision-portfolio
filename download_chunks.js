const fs = require('fs');
const https = require('https');
const path = require('path');

const mapDeps = [
  "CVcIbKnx.js", "zjd33H0z.js", "42HCRWR_.js", "DBxuMcrQ.js", "Ca9tGX5O.js", 
  "_slug_._vewQCfs.css", "CN_BUtDk.js", "DW0e2Ozt.js", "BackButton.BVk2fUTe.css", 
  "Co24bWy0.js", "Footer.Dcm3U13T.css", "_slug_.h8buwbYf.css", "Dtj1kEk-.js", 
  "KrDjIxW1.js", "SectionTitle.W5ss-3ZZ.css", "DxtrQHzD.js", "CEgBe5CN.js", 
  "NavPrevNext.DPKk9_X_.css", "CB6WjOj9.js", "Scrollbar.DkHz7D6H.css", 
  "index.BuyJMvG5.css", "C0tWGcOS.js", "Canvas.Cagzz345.css", "BOgGTsZb.js", 
  "CCkmUEIP.js", "HeaderLogo.CToJ8UR5.css", "4nQdxilx.js", "SoundToggle.BRVNbs_c.css", 
  "CMc6MR9Z.js", "pcqpp-6-.js", "SvgSprite.CU6-viYF.css", "BVpKqaYW.js", 
  "BYUsMxcb.js", "DXTrE1-q.js", "BkcwKBpp.js", "C_UVq32S.js", "DkhU0Oph.js", 
  "D18l86zL.js", "CTi_QKTQ.js", "error-404.p1_hhVNN.css", "DrlaQnm7.js", 
  "error-500.Dy6OcZJn.css", "Bnf8h6sj.js", "offscreen-CXGDDSCx.js", "BRTwojP8.js"
];

const outDir = path.join(__dirname, '_nuxt');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function download(file) {
  const url = `https://hashgraphvc.com/_nuxt/${file}`;
  const dest = path.join(outDir, file);
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        resolve(`Failed to download ${file} (Status: ${res.statusCode})`);
        return;
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve(`Downloaded ${file}`);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      resolve(`Error downloading ${file}: ${err.message}`);
    });
  });
}

async function run() {
  console.log("Downloading nuxt chunks...");
  for (const file of mapDeps) {
    const res = await download(file);
    console.log(res);
  }
  console.log("Done");
}

run();
