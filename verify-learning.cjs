const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const L=require('./learning.js');
process.chdir(__dirname);
function unitTests(){
 assert.equal(L.today(new Date('2026-10-10T14:59:59Z')),'2026-10-10');
 assert.equal(L.today(new Date('2026-10-10T15:00:00Z')),'2026-10-11');
 assert.equal(L.addDays('2026-12-31',1),'2027-01-01');
 assert.equal(L.addDays('2028-02-28',1),'2028-02-29');
 assert.ok(L.isCorrect({word:'kiwi fruit'},' ＫＩＷＩ　 ＦＲＵＩＴ '));
 assert.ok(L.isCorrect({word:"school principal's office"},'school principal’s office'));
 assert.ok(L.isCorrect({word:'Autumn/Fall'},'fall'));
 assert.ok(L.isCorrect({word:'Autumn/Fall'},'AUTUMN'));
 assert.equal(L.isCorrect({word:'apple'},'appl'),false);
 assert.equal(L.isCorrect({word:'apple'},'apples'),false);
 const s=L.empty();L.recordResult(s,15,false,'2026-10-10');
 assert.equal(L.due(s.reviews[15],'2026-10-10').isDue,false);
 for(const [offset,day,next]of [[1,'2026-10-11','2026-10-13'],[3,'2026-10-13','2026-10-17'],[7,'2026-10-17','2026-11-07'],[28,'2026-11-07',null]]){
  assert.equal(L.due(s.reviews[15],day).offset,offset);
  assert.ok(L.due(s.reviews[15],day).isDue);
  L.recordResult(s,15,true,day);
  assert.equal(L.due(s.reviews[15],day)?.date??null,next);
 }
 L.recordResult(s,15,false,'2026-11-08');assert.deepEqual(s.reviews[15].completed,[]);
 assert.equal(L.due(s.reviews[15],'2026-11-08').date,'2026-11-09');
 L.recordResult(s,15,true,'2026-11-08');assert.equal(s.reviews[15].completed.length,0);
 L.recordResult(s,15,true,'2026-11-20');assert.deepEqual(s.reviews[15].completed,[1,3,7]);
 assert.equal(L.due(s.reviews[15]).date,'2026-12-06');
 assert.throws(()=>L.validate({version:1,history:[],reviews:{15:{anchorDate:'bad',completed:[]}}}));
 console.log('PASS: calendar boundaries, normalization, all four checkpoints, late reviews and reset on errors.');
}
async function browserTests(){
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1000,height:1300}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-10-10T03:00:00Z')});
  const url=pathToFileURL(path.resolve('index.html')).href;
  await page.goto(url);
  const data=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),L.KEY);
  assert.equal((await data()).history.length,1);
  await page.locator('#select').selectOption('15');
  await page.locator('#answer-input').fill('   ');await page.locator('#check-answer').click();
  assert.equal((await data()).history.at(-1).correct,null);
  await page.locator('#answer-input').fill('banana');await page.locator('#answer-input').press('Enter');
  let s=await data();assert.equal(s.history.at(-1).input,'banana');assert.equal(s.history.at(-1).correct,false);
  assert.equal(s.reviews[15].anchorDate,'2026-10-10');
  assert.ok((await page.locator('#feedback').innerText()).includes('2026-10-11'));
  assert.ok(await page.locator('#answer').isVisible());
  await page.locator('#answer-form').dispatchEvent('submit');
  assert.equal((await data()).history.filter(e=>e.correct!==null).length,1);
  await page.reload();assert.equal(await page.locator('#select').inputValue(),'1');
  for(const day of ['2026-10-11','2026-10-13','2026-10-17','2026-11-07']){
   await page.clock.setFixedTime(new Date(day+'T03:00:00Z'));await page.reload();
   assert.equal(await page.locator('#select').inputValue(),'15');
   assert.ok(await page.locator('#review-label').isVisible());
   await page.locator('#answer-input').fill(' ＡＰＰＬＥ ');await page.locator('#check-answer').click();
   assert.equal((await data()).history.at(-1).correct,true);
   assert.ok((await page.locator('#review-summary').innerText()).includes('ありません'));
   await page.reload();assert.equal(await page.locator('#select').inputValue(),'1');
  }
  assert.deepEqual((await data()).reviews[15].completed,[1,3,7,28]);
  await page.locator('#history-panel summary').click();
  await page.locator('#history-rows tr').first().waitFor();
  assert.ok((await page.locator('#history-summary').innerText()).includes('正解 4回 / 不正解 1回'));
  assert.ok((await page.locator('#history-rows').innerText()).includes('banana'));
  const downloadPromise=page.waitForEvent('download');await page.locator('#export-history').click();
  const download=await downloadPromise;assert.ok(download.suggestedFilename().endsWith('.json'));
  // Two due cards remain ahead of the ordinary cards, including after shuffling and filtering.
  await page.clock.setFixedTime(new Date('2026-10-13T03:00:00Z'));
  await page.evaluate(key=>{
   const s=window.Learning.empty();
   window.Learning.recordResult(s,15,false,'2026-10-10');window.Learning.recordResult(s,22,false,'2026-10-10');
   localStorage.setItem(key,JSON.stringify(s));
  },L.KEY);
  await page.reload();assert.equal(await page.locator('#select').inputValue(),'15');
  await page.locator('#shuffle').click();
  const first=await page.locator('#select').inputValue();await page.locator('#next').click();
  assert.deepEqual(new Set([first,await page.locator('#select').inputValue()]),new Set(['15','22']));
  await page.locator('#category').selectOption('果物・野菜');
  assert.equal(await page.locator('#select').inputValue(),'15');
  await page.locator('#answer-input').fill('pear');await page.locator('#check-answer').click();
  assert.equal((await data()).reviews[15].anchorDate,'2026-10-13');
  await page.locator('#start-review').click();assert.equal(await page.locator('#select').inputValue(),'22');
  await page.locator('#reveal').click();
  assert.ok(await page.locator('#answer-input').isDisabled());
  s=await data();assert.equal(s.history.at(-1).correct,null);assert.ok(s.history.at(-1).revealedAt);
  assert.equal(s.reviews[22].completed.length,0);
  await page.setViewportSize({width:390,height:844});
  await page.locator('#history-panel summary').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'review/learning-mobile.png',fullPage:true});
  // Existing data is not silently destroyed if the stored JSON is damaged.
  await page.evaluate(key=>localStorage.setItem(key,'broken-json'),L.KEY);await page.reload();
  assert.ok(await page.locator('#storage-warning').isVisible());
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),L.KEY),'broken-json');
  assert.deepEqual(errors,[]);
  console.log('PASS: saved history, wrong answer scheduling, startup priority at days 1/3/7/28, resets, shuffle/filter priority, reveal, export, mobile and storage failures.');
 }finally{await browser.close()}
}
unitTests();browserTests().catch(e=>{console.error(e);process.exit(1)});
