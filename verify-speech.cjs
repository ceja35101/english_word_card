const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const cards=require('./data/card-draft.json');
assert.equal(cards.length,710);
for(const card of cards)assert.ok(typeof card.example==='string'&&card.example.length>8&&/[.!?]$/.test(card.example),`Missing example: ${card.id}`);
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.spoken=[];window.cancels=0;
   window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
   Object.defineProperty(window,'speechSynthesis',{value:{
    getVoices:()=>[{lang:'ja-JP',localService:true},{lang:'en-US',localService:false},{lang:'en-US',localService:true,name:'local'}],
    cancel:()=>window.cancels++,resume:()=>{},addEventListener:()=>{},
    speak:u=>{window.spoken.push({text:u.text,rate:u.rate,voice:u.voice.name,lang:u.lang});u.onstart();}
   }});
  });
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  assert.equal(await page.locator('#example-sentence').isVisible(),false);
  assert.equal(await page.evaluate(()=>spoken.length),0);
  await page.click('#reveal');
  assert.equal(await page.locator('#speak-word').textContent(),'単語を聞く');
  assert.equal(await page.locator('#speak-example').textContent(),'例文を聞く');
  assert.equal(await page.locator('#stop-speech').textContent(),'停止');
  assert.deepEqual(await page.locator('#speech-rate option').allTextContents(),['ゆっくり','ふつう','はやく']);
  assert.equal(await page.locator('.example-label').textContent(),'例文');
  assert.ok(!(await page.locator('#answer').textContent()).includes('??'));
  assert.equal(await page.locator('#example-sentence').textContent(),cards[0].example);
  await page.click('#speak-word');
  assert.deepEqual(await page.evaluate(()=>spoken[0]),{text:cards[0].word,rate:0.9,voice:'local',lang:'en-US'});
  await page.selectOption('#speech-rate','0.7');await page.click('#speak-example');
  assert.equal(await page.evaluate(()=>spoken[1].text),cards[0].example);
  assert.equal(await page.evaluate(()=>spoken[1].rate),0.7);
  await page.click('#stop-speech');assert.equal(await page.locator('#speech-status').textContent(),'');
  const before=await page.evaluate(()=>cancels);
  await page.click('#next');assert.ok(await page.evaluate(()=>cancels)>before);
  assert.equal(await page.locator('#example-sentence').isVisible(),false);
  assert.deepEqual(errors,[]);
  const unsupported=await browser.newPage();
  await unsupported.addInitScript(()=>Object.defineProperty(window,'SpeechSynthesisUtterance',{value:undefined}));
  await unsupported.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  await unsupported.click('#reveal');
  assert.ok(await unsupported.locator('#speak-word').isDisabled());
  assert.ok(await unsupported.locator('#example-sentence').isVisible());
  console.log('PASS: 710 examples; speech text, local English voice, speed, stop, navigation and unsupported browser.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
