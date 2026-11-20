// Deterministic pen marks: the pages do not change whenever React renders.
export function drawNotebook(canvas, entry, page, pageCount) {
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
  // Small physical details keep the procedural pages from feeling like a flat, clean canvas.
  c.save();c.globalAlpha=.26;c.fillStyle='#b59c68';c.fillRect(78,38,128,13);c.fillStyle='#b46b5c';c.fillRect(1014,38,108,13);c.restore();
  [160,394,628].forEach(y=>{
    c.save();c.fillStyle='#7a674737';c.beginPath();c.arc(18,y,8,0,Math.PI*2);c.fill();c.beginPath();c.arc(1182,y,8,0,Math.PI*2);c.fill();c.restore();
  });
  if(entry.doodle==='tear'){
    write('a little room to play',84,160,29,ink,-.025);
    write('My doodles on the next pages.',84,235,25,pencil);
    write('Collect a few, then head',84,325,25);
    write('back to the desk to flick.',84,365,25);
    write('Tear this page',690,250,38,ink,-.025);
    write('by dragging it.',710,310,36,ink,.015);
    arrow(820,370,1040,540);
    write('Keep going. Make a pile.',700,650,25,pencil);
  }else if(entry.doodle==='blank' || entry.doodle==='photo'){
    // Leave the ruled paper empty for tearing.
  }else if(entry.doodle==='education'){
    write('Mumbai → Chennai / 2021',82,82,27,ink,-.025);
    write('10th  /  SNPS School',94,153,26);write('Mumbai',125,191,22,pencil);
    arrow(270,185,326,228);write('12th  /  MNR College',94,276,25);write('Mumbai',126,314,22,pencil);
    write('JEE  →  VITEEE',92,403,29,ink,.012);ellipse(225,395,148,35,pencil);
    write('AIR < 10,000!',130,474,33,rust,-.035);star(425,449,11);star(466,492,7);
    write('new chapter:',92,590,24,pencil);write('Computer Science',124,637,28);write('VIT Chennai',157,681,29,ink,-.02);

    write('before the first semester',690,82,28,ink,-.025);
    // A rough trophy, certificate and achievement star matching the 2D field notes.
    box(714,145,140,115);line([[714,172],[680,172],[680,205],[714,224]],ink,2);line([[854,172],[888,172],[888,205],[854,224]],ink,2);
    line([[759,260],[759,314],[728,314],[728,337],[842,337],[842,314],[811,314],[811,260]],ink,2);
    write('#1',762,220,32,rust,-.04);
    box(906,151,212,176);write('VITEEE',938,197,25);write('AIR',946,243,22,pencil);write('< 10,000',933,291,29,rust,-.025);
    star(1025,407,37);star(913,456,15);star(1110,496,10);
    write('pack notes',719,520,24,pencil);line([[715,535],[1068,531]],pencil,1);
    write('ask too many questions',728,585,25);write('find the lab',746,628,24);write('start building things',718,682,27,ink,.015);
  }else if(entry.doodle==='pokemon'){
    write('pokemon modding / 2021',82,82,28,ink,-.03);
    write('not just play → explore',94,145,25,pencil);write('change one thing',116,196,27);write('then test it',160,236,25,ink,-.02);
    // Abstract creature head from the journey notebook, deliberately not a literal character copy.
    line([[118,486],[104,334],[157,402],[200,286],[232,408],[307,347],[275,493],[237,548],[159,548],[118,486]],ink,2.5);
    ellipse(169,459,4,5);ellipse(233,457,4,5);line([[177,497],[198,507],[221,494]],rust,2);
    line([[113,492],[54,460],[87,423],[53,388]],pencil,2);star(354,340,14);star(399,524,8);
    write('what if I could change',92,672,24,pencil);write('the game myself?',137,716,29,rust,-.025);

    write('ideas / sketches / side quests',679,82,25,ink,-.02);
    ellipse(789,260,93,93);line([[696,260],[759,260]],ink,2);line([[819,260],[882,260]],ink,2);ellipse(789,260,30,30);ellipse(789,260,10,10,rust);
    box(938,137,180,236);box(967,172,122,91);write('map',1005,228,22,pencil);
    line([[981,303],[1039,303]],ink,4);line([[1010,274],[1010,332]],ink,4);ellipse(1071,292,7,7);ellipse(1091,319,7,7);
    line([[986,238],[1018,210],[1042,237],[1070,194]],rust,2);
    write('[ map ]  →  [ new idea ]',689,475,25,ink,.01);box(705,510,132,92);box(967,510,148,92);arrow(846,553,952,553);
    write('patch',742,564,23,pencil);write('try again',987,563,22,pencil);
    write('keep the side quests',724,701,27,rust,-.035);
  }else if(entry.doodle==='first-builds'){
    write('map → new idea',82,82,31,ink,-.025);write('FIRST EXPERIMENTS',102,126,19,pencil);
    // A loose tile map with two possible routes.
    for(let row=0;row<5;row++)for(let col=0;col<6;col++)box(88+col*63,182+row*63,52,52);
    line([[110,208],[173,208],[173,271],[299,271],[299,397],[362,397],[362,460]],rust,5);
    line([[110,208],[110,334],[236,334],[236,460],[425,460]],ink,3);
    ellipse(110,208,9,9,rust);star(425,460,12);write('new route?',318,522,23,pencil,-.04);
    write('explore → change → test',93,620,27);write('repeat',195,676,30,rust,.025);

    write('tiny patch notes',699,82,29,ink,-.02);box(697,137,420,184);
    write('+ move the object',723,185,24);write('+ change one map tile',723,227,24);write('- broken edge',723,269,24,pencil);line([[718,256],[900,272]],rust,1.5);
    box(721,375,160,108);write('play',767,438,27);box(955,375,160,108);write('make',995,438,27);arrow(891,429,943,429);
    write('games = systems to inspect',705,561,25,pencil);write('and places to make stranger',720,606,24);
    star(756,684,10);star(1084,665,16);star(970,719,7);
  }else if(entry.doodle==='graduation'){
    write('VIT Chennai / 2025',82,82,29,ink,-.025);write('B.Tech · Computer Science',90,153,27);write('2021 → 2025',152,197,25,pencil);
    write('CGPA',91,302,25);write('8.4 / 10',204,315,39,rust,-.035);ellipse(300,302,118,43,pencil);
    write('Google Hash Code',91,431,27);write('1st on campus',122,477,31,ink,-.02);write('among 50+ teams',145,520,24,pencil);
    write('four years later',111,672,31,ink,.015);star(421,636,13);

    write('achievement marks',699,82,28,ink,-.02);
    // Graduation cap and tassel.
    line([[705,190],[824,132],[944,190],[824,250],[705,190]],ink,3);line([[754,213],[756,298],[894,298],[896,213]],pencil,2);line([[944,190],[944,286],[968,318]],rust,2);ellipse(970,328,8,15,rust);
    // Trophy and certificate.
    box(711,395,140,105);line([[711,417],[680,417],[681,450],[711,471]],ink,2);line([[851,417],[881,417],[880,450],[851,471]],ink,2);
    line([[757,500],[757,548],[727,548],[727,571],[836,571],[836,548],[806,548],[806,500]],ink,2);write('#1',758,468,30,rust);
    box(927,395,193,163);write('B.Tech',964,443,25);write('CSE',987,486,29,rust);line([[950,520],[1091,520]],pencil,1.5);
    write('keep building →',722,675,27,pencil);write('20+ projects',959,688,28,ink,-.03);
  }else if(entry.doodle==='systems'){
    write('practice → build → repeat',82,82,27,ink,-.025);write('LeetCode',91,151,28);write('two pointers / graphs',114,190,23,pencil);
    write('Linux',91,263,28);write('ps · grep · shell',114,302,24,pencil);
    write('GitHub',91,376,28);write('branch → commit → merge',114,415,24,pencil);
    write('Spring Boot · Redis · SQL',89,537,24);write('Go · MongoDB · Git',121,580,24);
    write('check the edge cases',116,692,27,rust,-.035);line([[108,677],[375,701]],pencil,1.2);

    write('client → service → storage',681,82,27,ink,-.02);
    box(683,145,153,126);box(879,145,153,126);arrow(841,207,871,207);
    write('client',721,184,24);write('service',917,184,24);write('> _',721,235,27,rust);line([[909,215],[999,215]],pencil,2);line([[909,239],[978,239]],pencil,2);
    // Layered database cylinder.
    ellipse(1092,170,64,22);line([[1028,170],[1028,337],[1156,337],[1156,170]],ink,2);ellipse(1092,254,64,22);ellipse(1092,337,64,22);
    write('storage',1045,392,23,pencil);arrow(1038,207,1058,207);
    box(729,445,321,184);write('if request:',755,489,23);write('validate()',787,529,22);write('cache?',755,570,23,rust);write('persist(result)',787,611,22);
    arrow(1059,548,1120,505);write('retry?',1067,476,21,pencil,-.05);star(1115,690,9);
  }else if(entry.doodle==='projects'){
    write('20+ projects / 2025',82,82,31,ink,-.025);write('portfolio',99,161,27);arrow(257,157,337,157);write('iterate',348,165,24,pencil);
    write('Go crawler',99,256,27);arrow(263,252,343,252);write('MongoDB',352,260,24,pencil);
    write('Cribble',99,351,27);arrow(220,347,295,347);write('Office Solutions',305,355,23,pencil);
    line([[88,414],[481,414]],pencil,1);write('deploy / learn / repeat',104,478,27,rust,-.02);
    write('Vercel',106,562,24);write('Git',266,562,24);write('systems',364,562,24);
    star(126,673,9);star(446,647,15);write('shipped > perfect',164,699,26,ink,.01);

    write('build log',701,82,29,ink,-.02);
    const cards=[[701,143,'portfolio'],[917,143,'crawler'],[701,331,'Cribble'],[917,331,'office']];
    cards.forEach(([x,y,label],index)=>{box(x,y,180,132);write(label,x+22,y+47,22,index===2?rust:ink,(index%2?1:-1)*.01);line([[x+22,y+75],[x+150,y+75]],pencil,1.5);line([[x+22,y+96],[x+118,y+96]],pencil,1.5);});
    arrow(886,397,907,397);write('→',888,418,28,rust);
    line([[734,558],[793,558],[793,618],[877,618]],ink,2);line([[793,586],[940,586],[940,650],[1050,650]],ink,2);
    ellipse(734,558,8,8);ellipse(877,618,8,8);ellipse(1050,650,8,8);
    write('branch → commit → merge',710,728,24,pencil,-.02);
  }else if(entry.doodle==='recursion'){
    write('fib / rough',84,82,29,ink,-.035);
    write('n = 4',104,142,25);write('3 ?',235,146,24,pencil,.06);
    line([[234,137],[277,149]],rust,1.5);
    write('f(n) = f(n-1) + f(n-2)',87,208,26,ink,.015);
    write('f(0) = 0     f(1) = 1',103,252,24,pencil,-.015);
    write('n     0  1  2  3  4  5  6  7',83,331,22);
    line([[81,345],[492,349]],pencil,1);
    write('      0  1  1  2  3  5  8 13',85,383,22,ink,.01);
    write('f(4) = 2 + 1 = 3',104,448,27,ink,-.03);
    write('O(n)',100,516,25,pencil);line([[96,505],[162,515]],rust,1.5);
    write('O(2^n)  /  stack O(n)',190,517,24,ink,.018);
    arrow(315,537,253,571);write('cache → O(n)',152,602,25,pencil,-.03);
    write('lc ~600',83,721,23,pencil,-.1);
    line([[80,733],[188,723]],pencil,1);
    // A tiny cat in the margin, unrelated to the calculations.
    line([[392,680],[391,638],[412,653],[439,651],[460,634],[461,681]],pencil,1.7);
    ellipse(427,684,35,28,pencil);
    ellipse(414,679,2,3);ellipse(441,679,2,3);
    line([[424,689],[428,692],[432,688]],pencil,1.4);
    line([[402,689],[377,684]],pencil,1);line([[402,697],[375,700]],pencil,1);
    line([[450,688],[478,682]],pencil,1);line([[451,697],[479,701]],pencil,1);
    line([[410,712],[401,754],[455,752],[446,712]],pencil,1.6);
    line([[454,744],[483,734],[492,716],[482,708]],pencil,1.7);
    write('?',482,650,22,pencil,.12);

    const nodes=[[890,112,'f(4)'],[777,195,'f(3)'],[1040,207,'f(2)'],[721,281,'f(2)'],[872,287,'f(1)'],[991,294,'f(1)'],[1108,291,'f(0)'],[685,369,'f(1)'],[785,366,'f(0)']];
    [[0,1],[0,2],[1,3],[1,4],[2,5],[2,6],[3,7],[3,8]].forEach(([from,to])=>{
      const a=nodes[from],b=nodes[to];line([[a[0],a[1]+12],[(a[0]+b[0])/2+7,(a[1]+b[1])/2],[b[0],b[1]-22]],ink,1.6);
    });
    nodes.forEach(([x,y,label],i)=>write(label,x-24,y,24,i===6?pencil:ink,(i%3-1)*.035));
    ellipse(721,274,37,25,pencil);ellipse(1040,200,38,26,pencil);
    write('1',682,406,19,pencil);write('0',786,399,20,pencil);
    write('memo = {}',675,472,24,pencil,-.025);
    const code=[['fib(n):',680],['if n <= 1: return n',708],['if n in memo:',706],['return memo[n]',739],['memo[n] = fib(n-1)',708],['          + fib(n-2)',708],['return memo[n]',709]];
    code.forEach(([text,x],i)=>write(text,x,520+i*35,23,ink,(i%2?1:-1)*.006));
    line([[1097,661],[1124,670],[1118,703]],pencil,1.2);
  }else if(entry.doodle==='loop'){
    write('upliance / bits to check',83,84,28,ink,-.035);
    write('diet changed',102,151,26);arrow(266,150,328,172);
    write('allergens?',333,183,24,rust,.025);
    write('keep everything',109,230,24,pencil,-.02);
    line([[103,219],[306,230]],rust,1.5);
    write('prune incompatible',132,277,25,ink,.012);
    write('unset ≠ saved',94,345,28);ellipse(189,338,110,26,pencil);
    write('back from recipe',102,425,25,ink,-.025);
    arrow(280,441,295,474);write('same scroll offset',144,514,24);
    write('render first!',324,554,22,rust,-.08);
    line([[103,581],[487,584]],pencil,1);
    write('device → filter My Creations',88,629,23,ink,.012);
    write('air fryer / upliance',128,667,23,pencil,-.02);
    write('loading…  then restore',103,746,22,pencil,.02);

    box(716,103,328,230);write('chat',738,138,25);
    line([[740,169],[948,171]],pencil,1.5);line([[740,191],[896,193]],pencil,1.5);
    box(748,244,253,49);write('generate recipe',766,277,24);
    arrow(1020,272,1100,222);write('backend',1015,188,20,rust,.03);
    write('always?',724,379,25,pencil,-.03);line([[719,367],[822,383]],rust,1.5);
    write('only when action exists',735,422,24,ink,.015);
    write('archived → read only',690,492,26,ink,-.015);
    const lines=[['if session.archived:',696],['hide input',731],['else:',696],['show allowed actions',731]];
    lines.forEach(([text,x],i)=>write(text,x,552+i*36,23,ink,(i%2?1:-1)*.008));
    write('test empty state',716,744,22,pencil,-.04);
    // A crooked little paper plane in the margin.
    line([[1001,700],[1112,666],[1064,745],[1048,712],[1001,700],[1067,701],[1112,666]],pencil,1.6);
    line([[1048,712],[1067,701],[1064,745]],pencil,1.3);
  }else if(entry.doodle==='reflection'){
    const isOrigin=entry.variant==='origin',isSystems=entry.variant==='systems';
    const label=isOrigin?'curiosity becomes practice':isSystems?'practice becomes evidence':'make the loop human';
    write(label,82,82,29,ink,-.025);
    write(isOrigin?'small experiments / 2021':isSystems?'shipping notes / 2025':'product notes / 2026',94,125,20,pencil);
    const steps=isOrigin
      ? [['notice',104],['change one thing',248],['test honestly',392],['write the next question',536]]
      : isSystems
        ? [['brief',104],['map the flow',248],['review the change',392],['release and learn',536]]
        : [['observe',104],['prototype',248],['show the state',392],['learn and return',536]];
    steps.forEach(([label,y],index)=>{
      box(88,y,315,82);write(String(index+1).padStart(2,'0'),106,y+49,24,rust);write(label,157,y+48,24,ink,(index%2?1:-1)*.012);
      if(index<steps.length-1)arrow(246,y+86,246,y+132);
    });
    write(isOrigin?'keep a tiny build log':isSystems?'leave a clear trail':'keep a person in the loop',96,718,24,pencil,-.02);
    star(454,688,9);star(397,742,6);

    write('field log',692,82,29,ink,-.02);
    const notes=isOrigin
      ? ['idea: what changes?', 'build: smallest version', 'result: what surprised me?', 'next: one better question']
      : isSystems
        ? ['user + failure case', 'data flow on paper', 'reviewable pull request', 'measure after release']
        : ['make state visible', 'provide recovery paths', 'ask for feedback early', 'iterate with evidence'];
    notes.forEach((note,index)=>{
      const y=151+index*87;box(700,y,30,30);line([[706,y+16],[713,y+23],[725,y+8]],index===3?rust:ink,2);
      write(note,750,y+23,22,index===3?rust:ink,(index%2?1:-1)*.01);line([[748,y+38],[1115,y+38]],'#849caa55',1);
    });
    write('next version',711,540,23,pencil,-.025);box(705,563,402,112);
    if(isOrigin){
      ellipse(771,619,30,30,ink);arrow(810,619,887,619);box(895,584,132,70);write('tiny',926,615,20);write('test',928,641,20);
      arrow(1035,619,1083,619);star(1092,619,17);
    }else if(isSystems){
      box(735,588,92,54);write('brief',750,622,20);arrow(835,615,882,615);box(890,588,92,54);write('PR',920,622,21,rust);arrow(990,615,1035,615);write('ship',1042,622,20);
    }else{
      ellipse(770,616,31,23,ink);write('human',737,622,18);arrow(807,616,875,616);box(884,585,126,61);write('tool',923,622,21,rust);arrow(1018,616,1070,616);write('choice',1032,665,19,pencil);
    }
    write('keep the notes honest.',728,731,25,ink,.012);
  }else{
    write('harness? / reading notes',82,82,27,ink,-.025);
    write('model + tools',100,151,28);write('= agent?',309,185,24,pencil,.03);
    line([[310,174],[420,189]],rust,1.4);
    write('loop / state / limits',111,237,26,ink,-.02);
    write('context:',89,313,25);
    write('instructions',128,356,25,ink,.015);
    write('task + tool results',124,397,25,ink,-.01);
    write('entire history',129,438,24,pencil);line([[126,427],[303,439]],rust,1.5);
    write('what fits?',326,468,23,rust,-.07);
    arrow(343,482,297,517);write('summarize? keep state?',106,555,24,pencil,.02);
    write('tool failed → retry forever',86,633,23,pencil,-.015);line([[239,620],[470,635]],rust,1.5);
    write('cap retries + record error',114,681,24,ink,.01);
    write('todo: try a tiny eval',98,751,23,pencil,-.025);

    write('task',692,121,25);arrow(751,117,812,133);
    ellipse(881,141,64,32);write('model',841,151,26);
    arrow(948,156,1040,205);write('tool',1030,245,25);
    arrow(1062,259,1000,319);write('result',922,352,25);
    line([[911,344],[797,328],[776,197]],pencil,1.6);arrow(776,197,824,166);
    write('state',686,277,23,pencil,-.04);
    write('stop?',1017,123,23,rust,.04);
    arrow(945,125,1004,117);
    const code=[['while budget_left:',681],['reply = model(context)',711],['if reply.done: break',712],['check_permission(reply.tool)',706],['result = run_tool(reply)',710],['context.append(result)',713],['save_trace()',711]];
    code.forEach(([text,x],i)=>write(text,x,446+i*37,22,ink,(i%3-1)*.008));
    write('timeout / bad args / denied',687,744,21,pencil,-.015);
    // A tiny planet, drawn while thinking.
    ellipse(1072,706,21,20,pencil);
    c.save();c.translate(1072,706);c.rotate(-.35);ellipse(0,0,43,9,pencil);c.restore();
    star(1136,676,6);star(1020,682,4);
  }
  // Pencil hatching and a soft spine crease.
  if(entry.doodle!=='blank' && entry.doodle!=='photo')for(let i=0;i<8;i++)line([[1110+i*5,713],[1126+i*5,698]],'#7b77664d',1);
  const crease=c.createLinearGradient(585,0,615,0);crease.addColorStop(0,'#66533800');crease.addColorStop(.5,'#66533840');crease.addColorStop(1,'#66533800');c.fillStyle=crease;c.fillRect(585,0,30,840);
  write(String(page*2+1).padStart(2,'0'),78,806,18,pencil);write(String(page*2+2).padStart(2,'0'),1114,806,18,pencil);
  if(page>0)arrow(151,801,121,801);if(page<pageCount-1)arrow(1056,801,1086,801);
  c.fillStyle='#d6c6a6';c.beginPath();c.moveTo(1167,840);c.lineTo(1200,807);c.lineTo(1200,840);c.fill();
}

// Use the photographed paper as the entire leaf, including its own ruling and
// colour. Filling the leaf removes the synthetic notebook border and footer.
export function drawNotebookDoodle(canvas, image, crop, side) {
  const c = canvas.getContext('2d');
  const [sx, sy, sw, sh] = crop;
  c.drawImage(image, sx, sy, sw, sh, side * 600, 0, 600, 840);
}
