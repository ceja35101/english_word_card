const fs=require('node:fs'),sharp=require('sharp');
process.chdir(__dirname);
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
async function main(){
 const cards=JSON.parse(fs.readFileSync('data/card-draft.json','utf8')).filter(c=>c.id>22&&fs.existsSync(c.picture||''));
 fs.mkdirSync('review',{recursive:true});
 for(let n=0;n<Math.ceil(cards.length/60);n++){
  const rows=cards.slice(n*60,(n+1)*60),tiles=[];
  for(let i=0;i<rows.length;i++){
   const c=rows[i],x=i%6*150,y=Math.floor(i/6)*160;
   tiles.push({input:await sharp(c.picture).resize(140,125,{fit:'contain',background:'white'}).flatten({background:'white'}).png().toBuffer(),left:x,top:y});
   tiles.push({input:Buffer.from(`<svg width="150" height="30"><text x="2" y="18" font-family="Arial" font-size="11">${c.id} ${escape(c.word)}</text></svg>`),left:x,top:y+125});
  }
  await sharp({create:{width:900,height:1600,channels:3,background:'white'}}).composite(tiles).png().toFile(`review/sheet-${n}.png`);
 }
}
main().catch(e=>{console.error(e);process.exit(1)});
