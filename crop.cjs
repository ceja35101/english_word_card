const sharp = require('sharp');
const fs = require('fs');
const imageOverrides = require('./image-overrides.json');
const vm = require('node:vm');
// Bounds measured on 352 x 264 previews; originals remain untouched.
const entries = [
 [1,'fruit',[84,64,215,106],[.60,.36,.37,.58],.40],
 [2,'strawberry',[28,64,291,141],[.67,.34,.29,.60],.60],
 [3,'orange',[45,69,277,133],[.60,.04,.14,.25],.40],
 [5,'grapefruit',[59,80,260,124],[.63,.07,.13,.22],.62],
 [6,'nut',[40,77,260,131],[.53,.31,.40,.65],.25],
 [7,'cherry',[40,74,266,134],[.52,.22,.28,.67],.40],
 [8,'watermelon',[50,79,255,128],[.69,.43,.26,.40],.65],
 [11,'banana',[46,62,250,123],[.68,.37,.14,.40],.51],
 [13,'melon',[51,67,259,127],[.53,.27,.30,.67],.40],
 [4,'kiwi fruit',[54,57,265,130],[.63,.03,.15,.25],.57],
 [9,'pear',[39,61,252,126],[.63,.03,.12,.24],.35],
 [10,'pineapple',[53,77,236,113],[.65,.02,.13,.26],.60],
 [12,'grapes',[40,67,262,129],[.62,.02,.15,.25],.43],
 [14,'peach',[32,49,267,130],[.62,.02,.15,.26],.43],
 [15,'apple',[38,60,266,129],[.64,.35,.29,.58],.43],
 [16,'lemon',[37,57,255,129],[.61,.34,.32,.57],.44],
 [17,'vegetable',[32,69,263,128],[.73,.39,.13,.24],.58],
 [18,'turnip',[45,61,250,123],[.66,.03,.16,.24],.42],
 [19,'pumpkin',[34,68,255,125],[.53,.18,.32,.65],.55],
 [20,'mushroom',[38,71,258,122],[.64,.32,.28,.63],.60],
 [21,'cabbage',[34,69,261,125],[.66,.02,.14,.25],.52],
 [22,'cucumber',[51,77,255,122],[.60,.36,.28,.60],.61],
];
async function main(){
 const previous={window:{}};
 if(fs.existsSync('cards.js'))vm.runInNewContext(fs.readFileSync('cards.js','utf8'),previous);
 fs.mkdirSync('assets/cards',{recursive:true});
 const cards=[];
 for(let i=0;i<entries.length;i++){
  const [id,word,bounds,picture,wordWidth]=entries[i];
  const upright=await sharp(`assets/photos/${i+1}.jpg`).rotate(i>=9?180:0).toBuffer();
  const {data,info}=await sharp(upright).resize(360,270).blur(10).greyscale().raw().toBuffer({resolveWithObject:true});
  const run=(values,center)=>{let a=center,b=center;while(a>0&&values[a-1]>95)a--;while(b<values.length-1&&values[b+1]>95)b++;return[a,b]};
  let [left,right]=run(Array.from({length:360},(_,x)=>data[135*360+x]),180);
  const mid=Math.round((left+right)/2);
  let [top,bottom]=run(Array.from({length:270},(_,y)=>data[y*360+mid]),135);
  // Inset the blurred edge to exclude the table.
  left+=2;right-=2;top+=2;bottom-=2;
  console.log(id,{left,right,top,bottom});
  const source=await sharp(upright).extract({left:left*5,top:top*5,width:(right-left)*5,height:(bottom-top)*5}).resize(1200,600,{fit:'fill'}).toBuffer();
  const crop=async(rect,file)=>sharp(source).extract({left:Math.round(rect[0]*1200),top:Math.round(rect[1]*600),width:Math.round(rect[2]*1200),height:Math.round(rect[3]*600)}).jpeg({quality:94}).toFile(file);
  const corrections={1:[.62,.32,.37,.66],2:[.67,.29,.31,.70],3:[.60,.01,.14,.25],4:[.63,.01,.17,.29],5:[.63,.01,.16,.29],6:[.53,.24,.43,.75],7:[.52,.17,.29,.75],8:[.69,.40,.29,.57],9:[.63,.01,.16,.29],10:[.65,.01,.15,.29],11:[.67,.25,.20,.48],12:[.62,.01,.18,.29],13:[.53,.18,.31,.80],14:[.62,.01,.18,.29],15:[.64,.27,.34,.72],16:[.61,.27,.37,.72],17:[.70,.38,.23,.34],18:[.66,.01,.14,.27],19:[.57,.13,.32,.85],20:[.64,.25,.29,.74],21:[.65,.01,.20,.29],22:[.60,.25,.31,.74]};
  const finalBounds={4:[.63,.01,.15,.29],6:[.53,.32,.43,.67],11:[.67,.34,.20,.47],13:[.53,.29,.31,.69],15:[.64,.33,.34,.66],16:[.61,.34,.37,.65],19:[.54,.12,.29,.75],20:[.64,.33,.28,.66],21:[.65,.01,.14,.29],22:[.60,.33,.31,.66]};
  await crop(finalBounds[id]||corrections[id]||picture,`assets/cards/${id}-picture.jpg`);
  await crop([.04,.31,wordWidth,.29],`assets/cards/${id}-word.jpg`);
  const assignedPicture=previous.window.WORD_CARDS?.find(c=>c.id===id)?.picture;
  cards.push({id,word,picture:imageOverrides[id] || assignedPicture || `assets/cards/${id}-picture.jpg`,answer:`assets/cards/${id}-word.jpg`});
 }
 cards.sort((a,b)=>a.id-b.id);
 const oldCards=previous.window.WORD_CARDS||[];
 const merged=[...cards.map(card=>({...oldCards.find(c=>c.id===card.id),...card})),...oldCards.filter(c=>c.id>22)].sort((a,b)=>a.id-b.id);
 fs.writeFileSync('cards.js','window.WORD_CARDS = '+JSON.stringify(merged,null,2)+';\n');
 const tiles=await Promise.all(cards.map(async(c,i)=>({input:await sharp(c.picture).resize(180,150,{fit:'contain',background:'#ffffff'}).toBuffer(),left:i%6*180,top:Math.floor(i/6)*180})));
 await sharp({create:{width:1080,height:720,channels:3,background:'white'}}).composite(tiles).jpeg().toFile('crop-preview.jpg');
}
main().catch(e=>{console.error(e);process.exit(1)});

