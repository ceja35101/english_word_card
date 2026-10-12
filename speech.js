window.createSpeechReader=function({status,onAvailability}){
 const supported='speechSynthesis' in window&&typeof window.SpeechSynthesisUtterance==='function';
 const engine=supported?window.speechSynthesis:null;
 let active=null,sequence=0,voices=[];
 function refresh(){
  if(!supported){status.textContent='このブラウザーは読み上げに対応していません。';onAvailability(false);return;}
  voices=engine.getVoices();
  const available=!voices.length||voices.some(v=>/^en(?:[-_]|$)/i.test(v.lang));
  onAvailability(available);
  if(!available)status.textContent='英語の音声が見つかりません。端末の英語音声を追加してください。';
  else if(!active)status.textContent='';
 }
 function stop(){sequence++;if(engine)engine.cancel();active=null;refresh();}
 function speak(text,rate=0.9){
  if(!supported)return;
  stop();
  if(voices.length&&!voices.some(v=>/^en(?:[-_]|$)/i.test(v.lang)))return;
  const token=sequence,utterance=new window.SpeechSynthesisUtterance(text);
  active=utterance;
  const english=voices.filter(v=>/^en(?:[-_]|$)/i.test(v.lang));
  const voice=english.find(v=>v.localService&&/^en[-_]US$/i.test(v.lang))||english.find(v=>v.localService)||english.find(v=>/^en[-_]US$/i.test(v.lang))||english[0];
  utterance.lang=voice?.lang||'en-US';if(voice)utterance.voice=voice;
  utterance.rate=rate;utterance.pitch=1;utterance.volume=1;
  utterance.onstart=()=>{if(token===sequence)status.textContent='読み上げ中…';};
  utterance.onend=()=>{if(token===sequence){active=null;status.textContent='';}};
  utterance.onerror=event=>{if(token!==sequence)return;active=null;status.textContent=['canceled','interrupted'].includes(event.error)?'':'読み上げできませんでした。端末の音声設定を確認してください。';};
  try{engine.speak(utterance);engine.resume();}catch{active=null;status.textContent='読み上げを開始できませんでした。';}
 }
 if(engine)engine.addEventListener('voiceschanged',refresh);
 refresh();return {speak,stop,supported};
};
