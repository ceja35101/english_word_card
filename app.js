(() => {
 'use strict';
 const cards=window.WORD_CARDS,L=window.Learning,$=id=>document.getElementById(id);
 const speech=window.createSpeechReader({status:$('speech-status'),onAvailability:available=>{
  for(const id of ['speak-word','speak-example','speech-rate','stop-speech'])$(id).disabled=!available;
 }});
 let storageHealthy=true,state=L.empty(),index=0,shown=false,currentEventId,historyLimit=50,orderDay=L.today();
 function storageError(message){storageHealthy=false;$('storage-warning').hidden=false;$('storage-warning').textContent=message;}
 function read(){
  if(!storageHealthy)return;
  try{const raw=localStorage.getItem(L.KEY);state=raw?L.validate(JSON.parse(raw)):L.empty();}
  catch{storageError('学習記録を読み込めません。保存済みの記録は上書きせず、今回は画面内だけで記録します。「全履歴をJSONで保存」で保存できます。');}
 }
 function mutate(action){
  read();action(state);
  if(storageHealthy)try{localStorage.setItem(L.KEY,JSON.stringify(state));}catch{storageError('学習記録をブラウザーに保存できませんでした。現在の記録は「全履歴をJSONで保存」から保存してください。');}
  updateStatus();
 }
 read();
 let order=L.sortCards(cards,state);
 const categories=[...new Set(cards.map(c=>c.category))];
 function addOption(select,value,label){const option=document.createElement('option');option.value=value;option.textContent=label;select.append(option)}
 addOption($('category'),'all',`すべて（${cards.length}語）`);
 categories.forEach(category=>addOption($('category'),category,`${category}（${cards.filter(c=>c.category===category).length}語）`));
 $('total').textContent=`全${cards.length}語。絵と日本語の意味から覚える、あなただけの単語帳。`;
 function updateSelect(){
  $('select').replaceChildren();
  [...order].sort((a,b)=>a.id-b.id).forEach(card=>addOption($('select'),card.id,`No. ${String(card.id).padStart(2,'0')}`));
 }
 function rebuild(){
  read();orderDay=L.today();
  order=L.sortCards(cards.filter(c=>$('category').value==='all'||c.category===$('category').value),state,orderDay);
  index=0;updateSelect();
 }
 function currentEvent(){return state.history.find(event=>event.id===currentEventId)}
 function render(){
  speech.stop();
  const card=order[index];shown=false;
  $('picture').hidden=Boolean(card.japanesePrompt);
  if(card.japanesePrompt)$('picture').removeAttribute('src');else $('picture').src=card.picture;
  $('japanese-prompt').hidden=!card.japanesePrompt;
  $('japanese-prompt').textContent=card.japanesePrompt||'';
  $('word').textContent=card.word;
  $('example-sentence').textContent=card.example;
  $('photo-answer').hidden=!card.answer;
  if(card.answer)$('word-photo').src=card.answer;else $('word-photo').removeAttribute('src');
  $('spelling-note').hidden=!card.originalWord;
  $('spelling-note').textContent=card.originalWord?`添付一覧の「${card.originalWord}」から綴りを補正しています。`:'';
  $('number').textContent=`No. ${String(card.id).padStart(2,'0')}`;
  $('progress').textContent=`${index+1} / ${order.length}`;$('counter').textContent=`${index+1} / ${order.length}`;
  $('select').value=card.id;$('photo-answer').open=false;
  $('answer-input').value='';$('answer-input').disabled=false;$('check-answer').disabled=false;
  $('feedback').hidden=true;$('feedback').textContent='';$('feedback').className='';
  const review=L.due(state.reviews[card.id]);
  $('review-label').hidden=!review?.isDue;
  $('review-label').textContent=review?.isDue?`復習：間違えた日から${review.offset}日後（予定日 ${review.date}）`:'';
  currentEventId=crypto.randomUUID();
  mutate(s=>s.history.push({id:currentEventId,cardId:card.id,word:card.word,presentedAt:new Date().toISOString(),input:null,correct:null,answeredAt:null,revealedAt:null,reviewOffset:review?.isDue?review.offset:null}));
  updateAnswer();
 }
 function updateAnswer(){
  if(!shown)speech.stop();
  $('answer').hidden=!shown;$('hint').hidden=shown;
  $('hint').textContent=order[index].japanesePrompt?'この意味を表す英単語を入力しよう':'英単語を思い浮かべてみよう';
  $('reveal').textContent=shown?'英単語を隠す':'英単語を表示する';
  $('reveal').setAttribute('aria-expanded',String(shown));
 }
 function reveal(){
  shown=!shown;
  if(shown&&currentEvent()?.correct===null&&!currentEvent()?.revealedAt){
   mutate(s=>{const event=s.history.find(e=>e.id===currentEventId);event.revealedAt=new Date().toISOString();});
   $('answer-input').disabled=true;$('check-answer').disabled=true;
   $('feedback').hidden=false;$('feedback').textContent='答えを確認しました。正誤は記録せず、復習の予定もそのまま残します。';
  }
  updateAnswer();
 }
 $('answer-form').onsubmit=event=>{
  event.preventDefault();
  const input=$('answer-input').value;
  if(!L.normalize(input)){$('feedback').hidden=false;$('feedback').textContent='英単語を入力してください。';return;}
  if(currentEvent()?.correct!==null||currentEvent()?.revealedAt)return;
  const card=order[index],correct=L.isCorrect(card,input);
  mutate(s=>{
   const attempt=s.history.find(e=>e.id===currentEventId);
   Object.assign(attempt,{input,correct,answeredAt:new Date().toISOString()});
   L.recordResult(s,card.id,correct);
  });
  $('answer-input').disabled=true;$('check-answer').disabled=true;
  shown=true;updateAnswer();
  const next=L.due(state.reviews[card.id]);
  $('feedback').hidden=false;$('feedback').className=correct?'correct':'incorrect';
  $('feedback').textContent=(correct?'正解です！':'不正解です。下の正しい英単語を確認しましょう。')+(next?`\n次の復習：${next.date}（間違えた日から${next.offset}日後）`:state.reviews[card.id]?'\nこの単語の復習予定をすべて完了しました。':'');
 };
 function updateStatus(){
  const count=cards.filter(c=>L.due(state.reviews[c.id])?.isDue).length;
  $('review-summary').textContent=count?`今日の復習 ${count}語（期限を過ぎたものを含みます）`:'今日の復習はありません';
  $('start-review').disabled=count===0;
  $('history-count').textContent=`（${state.history.length}回の出題）`;
  if($('history-panel').open)renderHistory();
 }
 const timeFormat=new Intl.DateTimeFormat('ja-JP',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
 function renderHistory(){
  $('history-rows').replaceChildren();
  const correct=state.history.filter(e=>e.correct===true).length,wrong=state.history.filter(e=>e.correct===false).length;
  $('history-summary').textContent=`正解 ${correct}回 / 不正解 ${wrong}回 / 未採点 ${state.history.length-correct-wrong}回`;
  $('history-empty').hidden=state.history.length>0;
  for(const event of state.history.slice(-historyLimit).reverse()){
   const row=document.createElement('tr');
   const stamp=new Date(event.presentedAt);
   const values=[Number.isNaN(stamp.getTime())?'日時不明':timeFormat.format(stamp),`No. ${event.cardId} ${event.word||cards.find(c=>c.id===event.cardId)?.word||''}`,event.input??'—',event.correct===true?'正解':event.correct===false?'不正解':event.revealedAt?'答えを確認':'未回答'];
   for(const value of values){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}
   row.lastChild.className=event.correct===true?'result-correct':event.correct===false?'result-incorrect':'';
   $('history-rows').append(row);
  }
  $('more-history').hidden=state.history.length<=historyLimit;
 }
 function move(step){if(orderDay!==L.today()){rebuild();}else index=(index+step+order.length)%order.length;render()}
 $('reveal').onclick=reveal;
 $('speak-word').onclick=()=>{if(shown)speech.speak(order[index].word.replaceAll('/',' or '),Number($('speech-rate').value));};
 $('speak-example').onclick=()=>{if(shown)speech.speak(order[index].example,Number($('speech-rate').value));};
 $('stop-speech').onclick=()=>speech.stop();
 window.addEventListener('pagehide',()=>speech.stop());
 $('previous').onclick=()=>move(-1);$('next').onclick=()=>move(1);
 $('select').onchange=()=>{index=order.findIndex(c=>c.id===Number($('select').value));render()};
 $('category').onchange=()=>{rebuild();render()};
 $('start-review').onclick=()=>{$('category').value='all';rebuild();render()};
 function shuffle(items){for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]]}return items;}
 $('shuffle').onclick=()=>{
  rebuild();const due=order.filter(c=>L.due(state.reviews[c.id])?.isDue),other=order.filter(c=>!L.due(state.reviews[c.id])?.isDue);
  order=[...shuffle(due),...shuffle(other)];render();
 };
 $('history-panel').ontoggle=()=>{if($('history-panel').open)renderHistory()};
 $('more-history').onclick=()=>{historyLimit+=50;renderHistory()};
 $('export-history').onclick=()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify({...state,exportedAt:new Date().toISOString(),timeZone:'Asia/Tokyo',reviewOffsets:L.OFFSETS},null,2)],{type:'application/json'}));
  const link=document.createElement('a');link.href=url;link.download=`english-word-history-${L.today()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 };
 window.addEventListener('storage',event=>{if(event.key===L.KEY){read();updateStatus();}});
 document.addEventListener('keydown',event=>{
  if(/SELECT|INPUT|TEXTAREA|BUTTON|SUMMARY/.test(event.target.tagName)||event.altKey||event.ctrlKey||event.metaKey)return;
  if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}
  if(event.key==='ArrowRight'){event.preventDefault();move(1)}
  if(event.code==='Space'){event.preventDefault();reveal()}
 });
 updateSelect();render();
})();
