const fs=require('node:fs');
const folder='assets/diagrams';
const green='#4c7258',gray='#dce5df',ink='#293c36',gold='#eebd57';
const text=(x,y,t,size=28,fill=ink)=>`<text x="${x}" y="${y}" font-family="Arial, Meiryo, sans-serif" font-size="${size}" text-anchor="middle" fill="${fill}">${t}</text>`;
const rect=(x,y,w,h,fill=gray)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}"/>`;
const circle=(x,y,r,fill=green)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const line=(x,y,x2,y2,color=ink,width=5)=>`<path d="M${x},${y} L${x2},${y2}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
const arrow=(x,y,x2,y2,color=green)=>line(x,y,x2,y2,color,12)+`<path d="M${x2-18},${y2-18} L${x2},${y2} L${x2+18},${y2-18}" stroke="${color}" stroke-width="10" fill="none" transform="rotate(${Math.atan2(y2-y,x2-x)*180/Math.PI-90} ${x2} ${y2})"/>`;
const embedded=(id,x,y,w,h)=>`<image data-pictogram="${id}" href="data:image/png;base64,${fs.readFileSync(`assets/pictograms/${id}.png`).toString('base64')}" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
function makeDiagrams(){
 fs.mkdirSync(folder,{recursive:true});const result={};
 function save(id,body,adapted=false){const file=`${folder}/${id}.svg`;fs.writeFileSync(file,`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><rect width="600" height="420" fill="white"/>${body}</svg>`);result[id]={picture:file,source:{provider:adapted?'ARASAAC diagram':'Original diagram',...(adapted?{ids:[...new Set([...body.matchAll(/data-pictogram="(\d+)"/g)].map(m=>Number(m[1])))],license:'CC BY-NC-SA 4.0'}:{})}};}
 // Cardinal numbers: digits plus a ten-frame grouping. No English answer labels.
 save(485,[1,2,3].map((n,i)=>rect(80+i*160,130,120,150,i===1?green:gray)+text(140+i*160,235,n,80,i===1?'white':ink)).join(''));
 const values=[...Array.from({length:21},(_,i)=>i),30,40,50,60,70,80,90,100];
 for(let i=0;i<values.length;i++){const n=values[i],id=486+i;let dots='';for(let j=0;j<n;j++){dots+=circle(80+(j%10)*48,220+Math.floor(j/10)*16,5,j%10===0?gold:green)}save(id,text(300,145,n,115)+dots);}
 // Ordinals are positions in a sequence rather than an isolated digit.
 const ordinals=[1,2,3,4,5,6,7,8,9,10,11,12,13,20,30];
 ordinals.forEach((n,i)=>{const total=Math.max(6,n),cols=Math.min(10,total),cell=Math.min(72,500/cols),rows=Math.ceil(total/cols);let body='';for(let j=1;j<=total;j++){let x=50+((j-1)%cols)*cell,y=80+Math.floor((j-1)/cols)*95;body+=rect(x,y,cell-8,68,j===n?green:gray)+text(x+(cell-8)/2,y+45,j,28,j===n?'white':ink);if(j===n)body+=arrow(x+(cell-8)/2,y-44,x+(cell-8)/2,y-9,gold)}save(515+i,body)});
 const colors=['#2878d4','#e54343','#f29223','#f4d647','#202625','#ffffff','#8d5835','#92999d','#ee8eaf','#9edcf4','#4d9a56','#8454b2'];
 save(530,colors.map((c,i)=>circle(120+(i%6)*72,150+Math.floor(i/6)*110,29,c)+`<circle cx="${120+(i%6)*72}" cy="${150+Math.floor(i/6)*110}" r="29" fill="none" stroke="#ccd3ce"/>`).join(''));
 colors.forEach((c,i)=>save(531+i,`<rect x="145" y="70" width="310" height="280" rx="28" fill="${c}" stroke="#ccd3ce" stroke-width="3"/>`));
 const shapes=[`<circle cx="300" cy="210" r="130"/>`,`<path d="M300 60 L455 340 L145 340 Z"/>`,`<rect x="165" y="75" width="270" height="270"/>`,`<rect x="100" y="110" width="400" height="200"/>`,`<path d="M300 345 C100 225 100 85 205 85 Q265 85 300 140 Q335 85 395 85 C500 85 500 225 300 345 Z"/>`,`<path d="M300 50 L460 210 L300 370 L140 210 Z"/>`,`<path d="M300 55 L345 155 L455 165 L375 240 L400 350 L300 295 L200 350 L225 240 L145 165 L255 155 Z"/>`];
 save(543,`<g fill="${green}" transform="translate(100 80) scale(.35)">${shapes[0]}</g><g fill="${gold}" transform="translate(280 80) scale(.35)">${shapes[1]}</g><g fill="#6f9ebc" transform="translate(190 210) scale(.35)">${shapes[2]}</g>`);
 shapes.forEach((s,i)=>save(544+i,`<g fill="${i===4?'#e47a86':green}">${s}</g>`));
 // Calendar diagrams use Japanese headings, never the target English word.
 function week(highlights){let b=rect(45,90,510,240,'#f3f6f2');for(let i=0;i<7;i++){const x=66+i*68;let hi=highlights.includes(i);b+=rect(x,165,58,110,hi?green:gray)+text(x+29,140,['月','火','水','木','金','土','日'][i],24)+text(x+29,230,i+1,32,hi?'white':ink)}return b;}
 save(559,week([0,1,2,3,4,5,6]));save(553,week([5,6]));for(let i=0;i<7;i++)save(560+i,week([i]));
 function months(selected){let b='';for(let i=1;i<=12;i++){const x=70+(i-1)%4*120,y=55+Math.floor((i-1)/4)*110;b+=rect(x,y,102,90,i===selected?green:gray)+text(x+51,y+58,`${i}月`,28,i===selected?'white':ink)}return b;}
 save(552,months(0));save(567,rect(110,50,380,320,'#eef3ed')+rect(110,50,380,65,green)+text(300,96,'1 … 12',32,'white')+Array.from({length:28},(_,j)=>circle(155+j%7*48,165+Math.floor(j/7)*50,12,j===14?gold:green)).join(''));
 for(let i=0;i<12;i++)save(568+i,months(i+1));
 // Frequency diagrams show seven opportunities with filled / unfilled circles.
 [7,5,2,0].forEach((n,i)=>save(707+i,Array.from({length:7},(_,j)=>circle(84+j*72,185,25,j<n?green:gray)+text(84+j*72,250,j+1,20)).join('')+text(300,325,`${n} / 7`,36)));
 // Relative temperature is shown on the same scale for all four cards.
 [[114,24],[115,36],[116,0],[117,16]].forEach(([id,temp])=>{let b=rect(245,45,110,280,'#f0f3ef')+rect(285,75,30,245,'#dfe8ed')+rect(285,320-temp*6,30,temp*6,'#e57e59')+circle(300,330,38,'#e57e59');for(let t=0;t<=40;t+=10)b+=line(350,320-t*6,370,320-t*6,'#87978b',2)+text(405,328-t*6,`${t}°`,22);save(id,b+text(300,398,`${temp}°C`,30))});
 // Spatial diagrams distinguish location, direction and a highlighted city block.
 const box=rect(240,150,160,150,'#a9bcce');
 save(451,box+circle(320,118,30,gold));save(452,rect(240,70,160,150,'#a9bcce')+circle(320,270,30,gold));save(453,box+circle(170,265,30,gold));save(454,`<rect x="180" y="85" width="240" height="250" rx="12" fill="none" stroke="#90a7ba" stroke-width="8"/>`+circle(300,210,35,gold));
 for(const [id,x,y,x2,y2]of[[456,440,210,150,210],[457,150,210,440,210],[458,300,340,300,80]])save(id,arrow(x,y,x2,y2));
 for(const [id,x,y]of[[459,470,210],[460,130,210],[461,300,350],[462,300,70]])save(id,line(130,210,470,210,gray,8)+line(300,70,300,350,gray,8)+text(300,44,'北',24)+text(300,395,'南',24)+text(95,219,'西',24)+text(510,219,'東',24)+arrow(300,210,x,y)+circle(300,210,14,ink));
 let city='';for(let j=0;j<9;j++){let x=125+(j%3)*125,y=60+Math.floor(j/3)*105;city+=rect(x,y,100,80,j===4?gold:gray)}save(389,city);
 // Language study is represented by a book of Japanese kana and kanji.
 save(332,`<path d="M70 85 Q185 45 300 85 Q415 45 530 85 V330 Q415 290 300 330 Q185 290 70 330 Z" fill="#f6f2e7" stroke="${green}" stroke-width="7"/>`+line(300,85,300,330,green,4)+text(185,160,'あ い う',32)+text(185,225,'え お',32)+text(410,175,'日 本',38)+text(410,245,'山 川',38));
 // Concept diagrams combine unchanged ARASAAC symbols with relational markers.
 save(352,embedded(5983,30,50,350,310)+embedded(4631,360,125,200,240),true);
 save(598,embedded(6568,50,60,330,300)+circle(450,165,52,gold)+text(450,183,'1',48,'white')+line(425,95,410,45,gold,15)+line(475,95,490,45,gold,15)+text(450,300,'1  2  3',32),true);
 save(347,embedded(2607,45,85,160,220)+embedded(2578,215,85,160,220)+embedded(2607,390,85,160,220),true);
 save(341,embedded(9824,40,20,300,330)+embedded(39387,310,200,120,110)+embedded(2445,440,200,110,110),true);
 save(651,embedded(2599,180,70,240,270)+embedded(2380,30,30,150,140)+embedded(2791,430,30,140,140)+embedded(2487,440,250,130,130)+embedded(5561,30,250,130,130),true);
 for(const [id,selected]of[[312,0],[313,1],[314,2]]){
  let b='';for(let i=0;i<3;i++){
   const x=25+i*190;
   b+=rect(x,55,170,305,i===selected?'#e5eee3':'#f7f8f6')+embedded(3082,x+10,85,150,180)+text(x+85,310,['1–6','7–9','10–12'][i],28,i===selected?green:'#b4bdb6');
   if(i===selected)b+=arrow(x+85,20,x+85,60,gold);
  }save(id,b,true);
 }
 save(627,`<path d="M220 65 H380 L475 160 V270 L380 365 H220 L125 270 V160 Z" fill="#df4242" stroke="#a62f2f" stroke-width="6"/>`+rect(200,188,200,45,'white'));
 save(585,rect(90,55,420,310,'#eef3ed')+rect(90,55,420,65,green)+Array.from({length:21},(_,j)=>rect(125+j%7*52,150+Math.floor(j/7)*62,40,44,j===10?gold:gray)).join('')+circle(310,232,30,gold));
 save(684,rect(150,230,90,120,gray)+rect(350,70,90,280,green)+line(330,70,460,70,gold,4)+arrow(470,340,470,80,gold));
 save(689,Array.from({length:48},(_,j)=>circle(90+j%8*60,60+Math.floor(j/8)*56,13,green)).join(''));
 // Avoid the printed English answer on the catalog's zoo sign.
 let zoo='';for(const [i,id]of [2449,2437,2477].entries()){
  const x=20+i*195;
  zoo+=embedded(id,x+10,65,165,230)+rect(x,305,185,20,'#c9d5c4');
  for(let j=0;j<5;j++)zoo+=line(x+15+j*38,230,x+15+j*38,315,'#7d8f7b',5);
  zoo+=line(x,240,x+185,240,'#7d8f7b',5);
 }save(403,zoo,true);
 return result;
}
module.exports=makeDiagrams;
