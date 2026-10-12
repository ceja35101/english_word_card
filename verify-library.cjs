const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
process.chdir(__dirname);
async function main(){
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:1100}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve('index.html')).href);
  const cards=await page.evaluate(()=>window.WORD_CARDS);
  const original=fs.readFileSync('data/words-original.txt','utf8').split(/\r?\n/).filter(s=>/^\d+\s+\S/.test(s));
  assert.equal(cards.length,original.length);
  assert.equal(cards.length,710);
  assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
  assert.deepEqual(cards.map(c=>c.id),Array.from({length:710},(_,i)=>i+1));
  for(const c of cards){assert.ok(c.word);assert.ok(c.category);assert.ok(fs.existsSync(c.picture),c.picture);assert.ok(!/^(https?:|data:)/.test(c.picture));assert.ok(!c.picture.startsWith('assets/cards/'),'Original photo still assigned: '+c.id);}
  assert.equal(await page.locator('#answer').isVisible(),false);
  await page.locator('#reveal').click();
  assert.equal(await page.locator('#word').innerText(),'fruit');
  assert.equal(await page.locator('#answer').isVisible(),true);
  await page.locator('#next').click();
  assert.equal(await page.locator('#answer').isVisible(),false);
  assert.equal(await page.locator('#select').inputValue(),'2');
  const imageErrors=await page.evaluate(async()=>{
   const queue=window.WORD_CARDS.flatMap(c=>[c.picture,...(c.answer?[c.answer]:[])]);let index=0;const errors=[];
   await Promise.all(Array.from({length:10},async()=>{while(index<queue.length){const src=queue[index++];const img=new Image();img.src=src;try{await img.decode();if(!img.naturalWidth)throw Error('empty image')}catch(e){errors.push(src)}}}));return errors;
  });
  assert.deepEqual(imageErrors,[]);
  for(const id of [1,22,23,33,142,257,274,332,335,352,397,451,485,514,529,540,567,579,600,651,664,710]){
   await page.locator('#select').selectOption(String(id));
   const card=cards.find(c=>c.id===id);
   if(card.japanesePrompt){
    assert.equal(await page.locator('#picture').isVisible(),false);
    assert.equal(await page.locator('#picture').getAttribute('src'),null);
    assert.equal(await page.locator('#japanese-prompt').innerText(),card.japanesePrompt);
   }else{
    await page.locator('#picture').evaluate(img=>img.decode());
    assert.equal(await page.locator('#picture').isVisible(),true);
    assert.equal(await page.locator('#japanese-prompt').isVisible(),false);
   }
   assert.equal(await page.locator('#answer').isVisible(),false);
   await page.locator('#reveal').click();
   assert.equal(await page.locator('#word').innerText(),card.word);
   assert.equal(await page.locator('#photo-answer').isVisible(),Boolean(card.answer));
   assert.equal(await page.locator('#spelling-note').isVisible(),Boolean(card.originalWord));
  }
  for(const category of [...new Set(cards.map(c=>c.category))]){
   await page.locator('#category').selectOption(category);
   assert.equal(await page.locator('#select option').count(),cards.filter(c=>c.category===category).length);
   assert.equal(await page.locator('#answer').isVisible(),false);
  }
  await page.locator('#category').selectOption(cards[0].category);
  await page.locator('#shuffle').click();
  const count=cards.filter(c=>c.category===cards[0].category).length,seen=new Set();
  for(let i=0;i<count;i++){seen.add(await page.locator('#select').inputValue());await page.locator('#next').click()}
  assert.equal(seen.size,count);
  await page.locator('#category').selectOption('all');
  assert.equal(await page.locator('#select option').count(),710);
  await page.locator('#select').selectOption('710');await page.locator('#next').click();
  assert.equal(await page.locator('#select').inputValue(),'1');
  await page.locator('#previous').click();assert.equal(await page.locator('#select').inputValue(),'710');
  await page.locator('#select').selectOption('397');
  await page.locator('#picture').evaluate(img=>img.decode());
  await page.screenshot({path:'app-preview.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.locator('#select').selectOption('710');
  assert.equal(await page.locator('#japanese-prompt').innerText(),'一度も～ない・決して～ない');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#select').selectOption('352');await page.locator('#reveal').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  fs.mkdirSync('review',{recursive:true});
  await page.screenshot({path:'review/mobile-preview.png',fullPage:true});
  await page.goto(pathToFileURL(path.resolve('credits.html')).href);
  assert.ok(await page.locator('#sources li').count()>400);
  assert.deepEqual(errors,[]);
  console.log('PASS: 710 cards, all local images decoded, 24 categories, answers, spelling notes, shuffle, wrap navigation, mobile layout and credits.');
 }finally{await browser.close()}
}
main().catch(e=>{console.error(e);process.exit(1)});
