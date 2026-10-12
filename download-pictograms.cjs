const fs=require('node:fs');
process.chdir(__dirname);
async function main(){
 const cards=require('./data/card-draft.json');
 const ids=[...new Set([...cards.filter(c=>c.source?.provider==='ARASAAC').map(c=>c.source.id),4631,17284,17288,33046,6881,35401,8595,2544,3182,3181,39387,28643,6549,5358,26176,31190,4688,27555,27557,8977,38801])];
 let index=0,done=0;const errors=[];
 async function worker(){while(index<ids.length){const id=ids[index++],file=`assets/pictograms/${id}.png`;if(fs.existsSync(file)){done++;continue;}
  let saved=false;
  for(let attempt=0;attempt<3;attempt++){try{
   const response=await fetch(`https://static.arasaac.org/pictograms/${id}/${id}_500.png`,{signal:AbortSignal.timeout(45000)});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   const data=Buffer.from(await response.arrayBuffer());
   if(data.readUInt32BE(0)!==0x89504e47)throw Error('Not a PNG');
   fs.writeFileSync(file,data);saved=true;break;
  }catch(e){if(attempt===2)errors.push({id,error:e.message});else await new Promise(r=>setTimeout(r,1000*(attempt+1)));}}
  done++;if(done%50===0)console.log(`${done}/${ids.length}`);
 }}
 await Promise.all(Array.from({length:5},worker));
 console.log(JSON.stringify({total:ids.length,errors}));
 if(errors.length)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exit(1)});
