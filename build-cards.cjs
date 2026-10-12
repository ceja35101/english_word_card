const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
process.chdir(__dirname);
const corrections = {33:'green pepper',62:'fried chicken',103:'mountain',148:'chicken',161:'insect',274:'glasses',288:'calendar',317:'schoolbag',356:'arts and crafts room',367:'pencil sharpener',435:'soccer player',465:'the United States of America',583:'Autumn/Fall',588:'Christmas',597:'school trip'};
const aliases = {25:'courgette',30:'aubergine',66:'noodles',79:'pancakes',88:'soft drink',146:'raven',185:'superheroes',205:'toes',215:'question',218:'camp',221:'go hiking',222:'stew',229:'vertical flute',240:'prison dodgeball',241:'run',250:'athletics',260:'short trousers',312:'primary education',313:'secondary school',317:'backpack',318:'book',323:'school desk',331:'sewing workshop',333:'mathematics',334:'social sciences',338:'ethics and values class',341:'dining hall',342:'classroom',343:'clean',347:'music band',355:'staffroom',356:'handicraft classroom',361:"nurse's office",362:'science lab',363:'coloured pencils',369:'crayons',380:'felt-tip pen',393:'shop',401:'shopping centre',409:'theme park',413:'ride a unicycle',442:'animal keeper',447:'play the piano',448:'drawing',465:'United States of America',466:'United Kingdom',472:'South Korea',557:'good evening',583:'autumn',594:'athletics',595:'school trip',596:'concert',598:'swimming competition',599:'graduation',600:'welcome',646:'practice sports',651:'work',658:'difficult',661:'yawn',668:'run',670:'treat well',672:'pleasant',684:'up',692:'traditional craftwork',693:'different',694:'famous',700:'excited',703:'acid',708:'often'};
const selected = {28:36287,52:4967,64:7201,68:24854,69:35209,72:8724,74:2502,83:4575,95:38270,97:30014,117:4652,124:2488,141:2546,158:3379,204:37227,208:29945,213:2408,215:7217,222:2342,228:25115,243:8501,251:7233,263:2549,276:5988,282:6929,296:2285,308:3231,324:38462,328:34796,341:9824,345:29919,352:5983,365:17016,370:2409,371:9146,373:27681,382:32598,383:20126,389:28311,393:3389,402:8231,420:6924,421:2273,450:6985,549:4734,598:6568,610:39555,618:6611,623:15485,627:8289,642:7271,643:26144,667:11599,679:4637,682:4615,687:5397,690:21381};
selected[274]=3329;
Object.assign(selected,{42:39387,210:3182,231:8595,249:2544,269:17284,334:35401,365:6881,392:2859,601:8977,605:5358,644:28643,647:6549});
selected[664]=38801;
Object.assign(selected,{1:28339,2:2400,6:2880,7:8303,8:2557,11:2530,13:36153,15:2462,16:3022,19:2679,20:10220,22:2847});
const normalize = s => s.toLowerCase().replace(/^to /,'').replace(/[^a-z0-9]+/g,' ').trim();
const catalog = JSON.parse(fs.readFileSync('data/arasaac-en.json','utf8'));
const source = fs.readFileSync('data/words-original.txt','utf8').replace(/^\uFEFF/,'');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('cards.js','utf8'),ctx);
const originals=new Map(ctx.window.WORD_CARDS.filter(c=>c.id<=22).map(c=>[c.id,c]));
const lookup=new Map();
for(const p of catalog){if(p.sex||p.violence)continue;for(const k of p.keywords)for(const word of [k.keyword,k.plural]){if(!word)continue;const key=normalize(word);if(!lookup.has(key))lookup.set(key,[]);if(!lookup.get(key).includes(p))lookup.get(key).push(p)}}
const candidates = query => [...lookup.get(normalize(query))||[]].sort((a,b)=>Number(a.schematic)-Number(b.schematic)||a._id-b._id);
const sections = [[1,'果物・野菜'],[37,'食べ物・飲み物'],[91,'自然・天気'],[118,'動物・虫'],[171,'家族・人'],[186,'からだ'],[206,'遊び・音楽'],[230,'スポーツ'],[251,'服・持ち物'],[275,'家・家具'],[311,'学校'],[363,'文房具'],[381,'まち・建物'],[413,'乗り物'],[423,'仕事'],[451,'位置・方向'],[463,'国・世界'],[485,'数・順番'],[530,'色・形'],[551,'時間・曜日・月'],[580,'季節・行事'],[601,'動作'],[651,'気持ち・様子'],[701,'味・頻度']];
const cards=source.split(/\r?\n/).flatMap(line=>{
 const match=line.match(/^(\d+)\s+(.+?)\s*$/);if(!match)return[];
 const id=Number(match[1]),originalWord=match[2].trim(),word=corrections[id]||originalWord;
 const category=sections.filter(([start])=>id>=start).at(-1)[1];
 const old=originals.get(id);
 const query=aliases[id]||word;
 const matches=candidates(query),p=selected[id]?catalog.find(p=>p._id===selected[id]):matches[0];
 return[{id,word,category,...(old?.answer?{answer:old.answer}:{}),...(word!==originalWord?{originalWord}:{}),picture:p?`assets/pictograms/${p._id}.png`:null,...(p?{source:{provider:'ARASAAC',id:p._id,url:`https://arasaac.org/pictograms/en/${p._id}`,keyword:query}}:{}),candidates:matches.slice(0,8).map(p=>p._id)}];
});
fs.writeFileSync('data/card-draft.json',JSON.stringify(cards,null,2));
const missing=cards.filter(c=>!c.picture);
if(!process.argv.includes('--finalize')){
 console.log(`Total ${cards.length}, matched ${cards.length-missing.length}, missing ${missing.length}`);
 console.log(missing.map(c=>`${c.id}\t${c.word}`).join('\n'));
}
if(process.argv.includes('--finalize')){
 const overrides=require('./image-overrides.json');
 const diagrams=require('./make-diagrams.cjs')();
 const examples=require('./make-examples.cjs')(cards);
 const japanesePrompts=require('./japanese-prompts.cjs');
 fs.writeFileSync('data/examples.json',JSON.stringify(examples,null,2)+'\n');
 for(const c of cards){
  c.example=examples[c.id];
  if(japanesePrompts[c.id])c.japanesePrompt=japanesePrompts[c.id];
  if(overrides[c.id]){c.picture=overrides[c.id];c.source={provider:'Generated illustration'};}
  if(diagrams[c.id])Object.assign(c,diagrams[c.id]);
  delete c.candidates;
 }
 const invalid=cards.filter(c=>!c.picture||!fs.existsSync(c.picture));
 if(invalid.length)throw Error('Missing images: '+invalid.map(c=>c.id+' '+c.word).join(', '));
 fs.writeFileSync('cards.js','window.WORD_CARDS = '+JSON.stringify(cards,null,2)+';\n');
 fs.writeFileSync('data/card-draft.json',JSON.stringify(cards,null,2));
 fs.writeFileSync('data/spelling-corrections.json',JSON.stringify(cards.filter(c=>c.originalWord).map(({id,originalWord,word})=>({id,originalWord,word})),null,2));
 console.log(`Built ${cards.length} cards with local images.`);
}
