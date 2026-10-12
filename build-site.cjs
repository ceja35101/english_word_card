const fs=require('node:fs');
const path=require('node:path');
process.chdir(__dirname);
const output='dist';
fs.mkdirSync(output,{recursive:true});
const files=['index.html','credits.html','cards.js','app.js','learning.js','speech.js','style.css','library.css','learning.css','speech.css','IMAGE-CREDITS.md'];
const cards=require('./data/card-draft.json');
for(const card of cards){files.push(card.picture);if(card.answer)files.push(card.answer);}
for(const file of new Set(files)){
 const destination=path.join(output,file);
 fs.mkdirSync(path.dirname(destination),{recursive:true});
 fs.copyFileSync(file,destination);
}
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log(`Built website in ${output}/ (${new Set(files).size} files).`);
