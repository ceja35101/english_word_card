/* Calendar-based review dates use Japan time, independent of the computer's timezone. */
(function(root){
 'use strict';
 const OFFSETS=[1,3,7,28];
 const KEY='english-word-card.learning.v1';
 const formatter=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'});
 function today(date=new Date()){
  const parts=Object.fromEntries(formatter.formatToParts(date).map(p=>[p.type,p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
 }
 function addDays(day,amount){return new Date(Date.parse(day+'T00:00:00Z')+amount*86400000).toISOString().slice(0,10)}
 function normalize(word){return word.normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/[‐‑–—]/g,'-').trim().replace(/\s+/g,' ')}
 function accepted(card){return [card.word,...(card.acceptedAnswers||[]),...(card.word.includes('/')?card.word.split('/'):[])].map(normalize)}
 function isCorrect(card,input){return accepted(card).includes(normalize(input))}
 function due(review,day=today()){
  if(!review)return null;
  const offset=OFFSETS.find(n=>!review.completed.includes(n));
  if(offset===undefined)return null;
  const date=addDays(review.anchorDate,offset);
  return {offset,date,isDue:date<=day};
 }
 function recordResult(state,cardId,correct,day=today()){
  const key=String(cardId);
  if(!correct){state.reviews[key]={anchorDate:day,completed:[]};return;}
  const review=state.reviews[key];
  if(!review)return;
  // A late review covers all checkpoints already due; future dates keep their original anchor.
  for(const n of OFFSETS)if(addDays(review.anchorDate,n)<=day&&!review.completed.includes(n))review.completed.push(n);
 }
 function sortCards(cards,state,day=today()){
  return [...cards].sort((a,b)=>{
   const x=due(state.reviews[a.id],day),y=due(state.reviews[b.id],day);
   if(Boolean(x?.isDue)!==Boolean(y?.isDue))return x?.isDue?-1:1;
   if(x?.isDue&&y?.isDue)return x.date.localeCompare(y.date)||a.id-b.id;
   return a.id-b.id;
  });
 }
 function empty(){return {version:1,history:[],reviews:{}}}
 function validate(state){
  if(!state||state.version!==1||!Array.isArray(state.history)||!state.reviews||typeof state.reviews!=='object'||Array.isArray(state.reviews))throw Error('Invalid learning data');
  for(const event of state.history)if(!event||!Number.isInteger(event.cardId)||typeof event.presentedAt!=='string'||![null,true,false].includes(event.correct))throw Error('Invalid history');
  for(const [id,r]of Object.entries(state.reviews)){
   if(!/^\d+$/.test(id)||!r||!/^\d{4}-\d{2}-\d{2}$/.test(r.anchorDate)||Number.isNaN(Date.parse(r.anchorDate+'T00:00:00Z'))||!Array.isArray(r.completed)||r.completed.some(n=>!OFFSETS.includes(n)))throw Error('Invalid review');
  }
  return state;
 }
 const api={OFFSETS,KEY,today,addDays,normalize,isCorrect,due,recordResult,sortCards,empty,validate};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.Learning=api;
})(typeof window==='undefined'?globalThis:window);
