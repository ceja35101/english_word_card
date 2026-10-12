const a=require('./data/arasaac-en.json');
for(const q of process.argv.slice(2)) {
 const matches=a.filter(p=>p.keywords.some(k=>k.keyword.toLowerCase().includes(q.toLowerCase())));
 console.log(q,JSON.stringify(matches.slice(0,20).map(p=>[p._id,p.keywords.map(k=>k.keyword).join('/')])));
}
