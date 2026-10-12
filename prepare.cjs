const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const convert = require('heic-convert');
async function main() {
  fs.mkdirSync('assets/photos', { recursive: true });
  const files = fs.readdirSync('drive-download-20261009T152031Z-1-001').filter(f => /\.heic$/i.test(f)).sort();
  const tiles = [];
  for (let i = 0; i < files.length; i++) {
    const dest = `assets/photos/${i+1}.jpg`;
    if (!fs.existsSync(dest)) {
      const buffer = await convert({buffer: fs.readFileSync(path.join('drive-download-20261009T152031Z-1-001', files[i])), format: 'JPEG', quality: .92});
      await sharp(buffer).rotate(270).resize({width: 1800}).jpeg({quality: 90}).toFile(dest);
    }
    const thumb = await sharp(dest).resize(360,270,{fit:'contain'}).toBuffer();
    tiles.push({input:thumb,left:(i%4)*360,top:Math.floor(i/4)*300});
    tiles.push({input:Buffer.from(`<svg width="360" height="30"><rect width="360" height="30" fill="white"/><text x="10" y="22" font-size="20">${i+1}: ${files[i]}</text></svg>`),left:(i%4)*360,top:Math.floor(i/4)*300+270});
  }
  await sharp({create:{width:1440,height:Math.ceil(files.length/4)*300,channels:3,background:'white'}}).composite(tiles).jpeg().toFile('contact.jpg');
}
main().catch(e=>{console.error(e);process.exit(1)});
