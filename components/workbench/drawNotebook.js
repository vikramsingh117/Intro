// Deterministic pen marks: the pages do not change whenever React renders.
export function drawNotebook(canvas, entry, page) {
  const c=canvas.getContext('2d');
  let seed=734+page*91;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const ink='#344f5a', pencil='#787666', rust='#a35e45';
  const font='"Chalkboard SE", "Comic Sans MS", cursive';
  const line=(points,color=ink,width=2)=>{
    c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();
    points.forEach(([x,y],i)=>{const xx=x+(random()-.5)*2, yy=y+(random()-.5)*2;if(i)c.lineTo(xx,yy);else c.moveTo(xx,yy);});c.stroke();
  };
  const write=(text,x,y,size=25,color=ink,tilt=0)=>{
    c.save();c.translate(x,y);c.rotate(tilt);c.font=`${size}px ${font}`;c.fillStyle=color;
    let offset=0;
    for(const letter of text){c.save();c.translate(offset,(random()-.5)*1.5);c.rotate((random()-.5)*.025);c.fillText(letter,0,0);c.restore();offset+=c.measureText(letter).width;}
    c.restore();
  };
  const wrap=(text,x,y,width,size=25,spacing=35,color=ink)=>{
    c.font=`${size}px ${font}`;let row='';
    for(const word of text.split(' ')){
      if(c.measureText(row+word).width>width&&row){write(row.trim(),x,y,size,color,(random()-.5)*.012);y+=spacing;row='';}
      row+=word+' ';
    }
    write(row.trim(),x,y,size,color);return y+spacing;
  };
  const box=(x,y,w,h)=>{line([[x,y+3],[x+w-2,y],[x+w,y+h],[x+2,y+h-2],[x,y+3]]);};
  const ellipse=(x,y,rx,ry,color=ink)=>{
    const points=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2;points.push([x+Math.cos(a)*rx,y+Math.sin(a)*ry]);}line(points,color,1.8);
  };
  const arrow=(x,y,xx,yy)=>{
    line([[x,y],[(x+xx)/2+4,(y+yy)/2-3],[xx,yy]],rust,2);
    const angle=Math.atan2(yy-y,xx-x);line([[xx-11*Math.cos(angle-.5),yy-11*Math.sin(angle-.5)],[xx,yy],[xx-11*Math.cos(angle+.5),yy-11*Math.sin(angle+.5)]],rust,2);
  };
  const star=(x,y,size=12)=>{line([[x-size,y],[x+size,y]],rust);line([[x,y-size],[x,y+size]],rust);line([[x-size*.6,y-size*.6],[x+size*.6,y+size*.6]],rust);};
  const paper=c.createLinearGradient(0,0,1200,0);paper.addColorStop(0,'#e7d9b7');paper.addColorStop(.25,'#f2e8cf');paper.addColorStop(.49,'#e7d9b8');paper.addColorStop(.51,'#e4d4b1');paper.addColorStop(.75,'#f1e5cb');paper.addColorStop(1,'#e7d8b8');
  c.fillStyle=paper;c.fillRect(0,0,1200,840);
  for(let i=0;i<6500;i++){c.fillStyle=`rgba(98,79,45,${random()*.055})`;c.fillRect(random()*1200,random()*840,random()*2+.3,.6);}
  for(let y=110;y<795;y+=36){line([[35,y],[565,y+1]],'#849caa25',.7);line([[630,y],[1165,y-1]],'#849caa25',.7);}
  line([[58,65],[61,785]],'#b46b5c38',1);line([[642,65],[645,785]],'#b46b5c38',1);
  write('vikram / work in progress',76,55,19,pencil,-.025);
  write(['figuring things out…','tiny details matter','notes from the engine room'][page],685,61,22,pencil,.018);
  const titleEnd=wrap(entry.title,78,115,460,38,47);
  line([[80,titleEnd-28],[270,titleEnd-25],[410,titleEnd-29]],'#b6754c66',6);
  wrap(entry.text,78,titleEnd+23,455,24,34);
  // A sticky question, attached with a small translucent strip of tape.
  c.save();c.translate(80,502);c.rotate(-.025);c.fillStyle='#98866022';c.fillRect(5,5,450,115);c.fillStyle='#eadb9d';c.fillRect(0,0,450,115);c.fillStyle='#d5bc8766';c.fillRect(170,-10,95,22);wrap(entry.question,15,34,418,26,33,'#745337');c.restore();
  if(entry.doodle==='loop'){
    box(690,128,170,75);write('listen',731,174,28);
    box(938,140,175,75);write('decide',969,183,28);
    box(925,290,185,75);write('build',972,336,28);
    box(680,285,180,75);write('observe',703,330,27);
    arrow(866,164,926,174);arrow(1024,223,1020,277);arrow(917,331,872,327);arrow(756,277,759,213);
    ellipse(890,251,29,27);ellipse(881,245,1,2);ellipse(900,245,1,2);line([[879,259],[889,264],[902,258]]);
    write('keep people in the loop',712,421,24,rust,-.03);star(1128,393,10);
    write('ship it?',99,695,30,pencil,-.04);line([[98,682],[210,686]],rust,2);write('make it useful first.',114,738,25,ink,.02);
    arrow(406,689,487,651);write('why?',423,724,25,rust,-.13);
  }else if(entry.doodle==='recipe'){
    box(700,140,180,230);box(716,152,180,230);
    write('recipe ideas',734,185,23);line([[738,208],[865,211]],pencil);line([[738,224],[842,225]],pencil);
    ellipse(805,287,52,20);line([[754,287],[762,326],[844,326],[856,287]]);line([[780,259],[776,247],[784,236]],pencil);line([[809,258],[805,245],[813,234]],pencil);
    write('diet',965,191,25);write('allergens',965,239,25);write('device',965,287,25);
    [183,231,279].forEach(y=>{box(929,y-15,23,23);line([[933,y-2],[939,y+4],[951,y-11]],rust,2.5);});
    arrow(934,330,867,353);write('remember my place!',721,429,24,rust,-.035);
    line([[85,670],[172,671],[168,723],[91,724],[85,670]]);ellipse(182,693,16,17);line([[109,652],[105,639],[113,626]],pencil);line([[139,653],[134,638],[142,626]],pencil);
    write('small fix,',225,681,27,ink,.025);write('less friction.',218,721,27,ink,-.015);star(464,690);
  }else{
    box(693,126,405,98);write('chat → recipe result',716,165,25);line([[755,224],[739,244],[787,225]]);
    line([[700,280],[700,378],[1100,378]],pencil);line([[710,351],[758,337],[810,355],[861,304],[920,327],[970,299],[1030,312],[1090,286]],ink,2.5);
    write('timing sketch (not data)',727,414,22,pencil,-.02);ellipse(866,307,28,27,rust);arrow(962,253,888,292);
    write('what happened here?',99,678,28,ink,-.025);line([[102,690],[394,694]],rust,2);write('logs + context + patience',103,734,25,pencil,.015);
    star(477,710);star(491,684,7);
  }
  // Short handwritten reminders, instead of another formal paragraph block.
  const notes=[
    ['When does “generate” actually help?', 'UI ↔ backend: check the edge cases.', 'Archived chat = read-only.'],
    ['New diet? Recheck saved allergens.', 'Unset ≠ saved. Keep that distinction.', 'Match recipes to the appliance.'],
    ['Session + user context, together.', 'Messages don’t always look alike.', 'Sync state should agree everywhere.'],
  ][page];
  let y=505;notes.forEach((note,index)=>{line([[670,y-9],[675,y-2],[685,y-17]],ink,2);y=wrap(note,700,y,425,25,34)+22;if(index===1)line([[702,y-36],[860,y-33]],'#a35e4544',3);});
  write(['less magic. more clarity.','don’t lose the user’s context','make the invisible visible'][page],690,744,22,rust,-.025);
  // Pencil hatching and a soft spine crease.
  for(let i=0;i<8;i++)line([[1110+i*5,713],[1126+i*5,698]],'#7b77664d',1);
  const crease=c.createLinearGradient(585,0,615,0);crease.addColorStop(0,'#66533800');crease.addColorStop(.5,'#66533840');crease.addColorStop(1,'#66533800');c.fillStyle=crease;c.fillRect(585,0,30,840);
  write(String(page*2+1).padStart(2,'0'),78,806,18,pencil);write(String(page*2+2).padStart(2,'0'),1114,806,18,pencil);
  if(page>0)arrow(151,801,121,801);if(page<2)arrow(1056,801,1086,801);
  c.fillStyle='#d6c6a6';c.beginPath();c.moveTo(1167,840);c.lineTo(1200,807);c.lineTo(1200,840);c.fill();
}
