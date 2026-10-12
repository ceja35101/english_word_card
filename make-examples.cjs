const fs=require('node:fs');
const mass=new Set([1,26,28,34,38,39,40,41,42,43,46,47,48,49,50,53,54,56,58,59,61,62,65,67,69,70,71,72,74,75,77,80,81,84,85,86,87,88,89,90,91,105,106,108,188,364,365,368,373,375]);
const plurals=new Set([12,63,82,195,204,209,210,251,256,260,266,267,268,270,274,309,349,371,376]);
const overrides={};
const lines=`
37|Can I see the menu?
38|I eat breakfast at seven.
39|It is time for lunch.
40|We eat dinner together.
83|This is my drink.
91|I love nature.
92|The sea is blue.
93|The river is long.
95|The sky is blue.
96|The sun is bright.
97|The earth is round.
98|I can see the moon.
104|The weather is nice.
105|I like the sound of rain.
106|The wind is strong.
108|The snow is white.
186|Move your body.
188|My hair is black.
195|Brush your teeth.
204|Wash your feet.
208|Let's play tag.
209|Roll the dice.
210|Let's play cards.
215|Let's try a quiz.
230|Soccer is my favorite sport.
232|Let's play a game.
250|I like track and field.
251|These are my clothes.
275|This is my house.
276|This is my room.
311|I go to school.
312|I go to elementary school.
313|I go to junior high school.
314|I go to high school.
315|Let's learn the alphabet.
321|I do my homework.
325|My name is Ken.
328|English is my favorite subject.
329|I can speak English.
330|I like music.
332|I can speak Japanese.
334|We learn about our town in social studies.
341|I eat school lunch.
342|Our class starts at nine.
343|It is cleaning time.
344|We play at recess.
345|I am in the art club.
346|This is our team.
347|I play in the brass band.
348|The entrance is here.
349|Walk up the stairs.
363|I have a colored pencil.
364|I need some ink.
365|I use red paint.
368|I need some paper.
371|Use the compasses to draw a circle.
373|I need some tape.
375|I need some glue.
376|Use the scissors carefully.
382|This is a nice place.
386|Turn at the corner.
389|Walk around the block.
423|I want a job.
424|I have a dream.
451|The book is on the table.
452|The cat is under the chair.
453|Sit by the window.
454|The ball is in the box.
455|Come here, please.
456|Turn left here.
457|Turn right here.
458|Go straight ahead.
459|The sun rises in the east.
460|The sun sets in the west.
461|We live south of the river.
462|We live north of the lake.
463|Japan is a country.
464|The world is big.
485|What is your favorite number?
486|There are zero apples in the box.
487|I have one book.
530|What color is your bag?
543|What shape is it?
551|What time is it?
552|This year is fun.
553|I play on the weekend.
554|Have a nice day.
555|I run in the morning.
556|I play in the afternoon.
557|I read in the evening.
558|I sleep at night.
559|A week has seven days.
567|Next month is May.
580|Spring is my favorite season.
583|Autumn is also called fall.
585|This is a fun event.
586|We eat together on New Year's Day.
587|I wear a costume on Halloween.
588|We sing songs at Christmas.
589|We stay up on New Year's Eve.
590|I go to the beach on vacation.
591|Today is my birthday.
592|We watch fireworks at night.
593|Let's go to the festival.
594|We run on sports day.
595|We go on a field trip.
596|We sing at the music festival.
597|We go on a school trip.
598|I swim in the swimming meet.
599|We sing at the graduation ceremony.
600|We smile at the entrance ceremony.
601|I wash my hands.
602|I walk to school.
603|Let's go to the park.
604|I sing a song.
605|I finish my homework.
606|I teach my friend English.
607|I dance with my friends.
608|I can swim.
609|I write my name.
610|Please check your answer.
611|Come here, please.
612|I know the answer.
613|I can jump high.
614|I can ski.
615|I like apples.
616|I do my homework.
617|Let's play together.
618|Please sit here.
619|I clean my room.
620|Please stand here.
621|I enjoy music.
622|I eat an apple.
623|I use a pencil.
624|I make a cake.
625|I help my mother.
626|I get a new book.
627|Please stop here.
628|I drink water.
629|I ride a bike.
630|Let's start the game.
631|I run in the park.
632|I work with my friends.
633|I speak English.
634|I need a pencil.
635|Please open the door.
636|I study English.
637|I visit my grandmother.
638|I want a new book.
639|Turn left here.
640|I can see a bird.
641|I watch TV.
642|I have a dog.
643|Let's try again.
644|I read a book.
645|I cook dinner.
646|I practice the piano.
647|I get up at seven.
648|I go to school at eight.
649|I take a bath at night.
650|I go to bed at nine.
651|I am busy today.
652|I am happy today.
653|He is angry.
654|She is sad.
655|I am hungry.
656|I am fine, thank you.
657|You did a great job.
658|This game is tough.
659|I am tired.
660|He is strong.
661|I am sleepy.
662|I am thirsty.
663|She is sick today.
664|I am full after lunch.
665|My friend is cheerful.
666|This story is funny.
667|Your new bike is cool.
668|My dog is active.
669|You are kind.
670|Be gentle with the cat.
671|The girl is brave.
672|My teacher is friendly.
673|This is a good book.
674|That is a bad idea.
675|This is my new bag.
676|That is an old house.
677|The dog is big.
678|The cat is small.
679|This stone is hard.
680|This pillow is soft.
681|This pencil is long.
682|This pencil is short.
683|My brother is tall.
684|The bird is high in the sky.
685|This is my favorite book.
686|The flower is beautiful.
687|She can swim well.
688|We had a great day.
689|I have many books.
690|Your answer is right.
691|This game is fun.
692|This is a traditional dance.
693|Today is a special day.
694|This game is popular.
695|The rabbit is fast.
696|You are my best friend.
697|She is a famous singer.
698|Have a nice day.
699|My sister is young.
700|This game is exciting.
701|This apple is sweet.
702|This soup is salty.
703|This lemon is sour.
704|This curry is spicy.
705|This cake is delicious.
706|This coffee is bitter.
707|I always eat breakfast.
708|I usually walk to school.
709|I sometimes play tennis.
710|I never run in the library.
`;
for(const line of lines.trim().split('\n')){const [id,sentence]=line.split('|');overrides[id]=sentence;}
function article(word){return /^[aeiou]/i.test(word)&&!/^uni/i.test(word)?'an':'a';}
function makeExamples(cards){
 const result={};
 for(const c of cards){
  const {id}=c,word=c.word;
  let sentence=overrides[id];
  if(!sentence){
   if(id>=109&&id<=117)sentence=`It is ${word} today.`;
   else if(id>=171&&id<=177)sentence=`This is my ${word}.`;
   else if(id>=186&&id<=205)sentence=`${plurals.has(id)?'These are':'This is'} my ${word}.`;
   else if(id>=216&&id<=222||[235,236,237,241].includes(id))sentence=`I like ${word}.`;
   else if(id>=223&&id<=229)sentence=`I can play the ${word}.`;
   else if([233,234,238,239,240,242,244,245,247,248].includes(id))sentence=`I play ${word}.`;
   else if(id>=331&&id<=340)sentence=`We study ${word}.`;
   else if(id>=350&&id<=362)sentence=`This is the ${word}.`;
   else if(id>=425&&id<=450)sentence=`I want to be ${article(word)} ${word}.`;
   else if(id>=465&&id<=484)sentence=`I want to visit ${word}.`;
   else if(id>=488&&id<=514)sentence=`I have ${word} books.`;
   else if(id>=515&&id<=529)sentence=`This is my ${word} visit.`;
   else if(id>=531&&id<=542)sentence=`The bag is ${word}.`;
   else if(id>=544&&id<=550)sentence=`Draw ${article(word)} ${word}.`;
   else if(id>=560&&id<=566)sentence=`Today is ${word}.`;
   else if(id>=568&&id<=579)sentence=`My birthday is in ${word}.`;
   else if(id>=581&&id<=584)sentence=`I like ${word.toLowerCase()}.`;
   else if(plurals.has(id))sentence=`These are ${word}.`;
   else if(mass.has(id))sentence=`I like ${word}.`;
   else sentence=`This is ${article(word)} ${word}.`;
  }
  result[id]=sentence;
 }
 return result;
}
module.exports=makeExamples;
if(require.main===module){const cards=require('./data/card-draft.json');fs.writeFileSync('data/examples.json',JSON.stringify(makeExamples(cards),null,2)+'\n');}
