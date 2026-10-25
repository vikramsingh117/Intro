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
  if(entry.doodle==='recursion'){
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
    write('frodo / bits to check',83,84,28,ink,-.035);
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
  for(let i=0;i<8;i++)line([[1110+i*5,713],[1126+i*5,698]],'#7b77664d',1);
  const crease=c.createLinearGradient(585,0,615,0);crease.addColorStop(0,'#66533800');crease.addColorStop(.5,'#66533840');crease.addColorStop(1,'#66533800');c.fillStyle=crease;c.fillRect(585,0,30,840);
  write(String(page*2+1).padStart(2,'0'),78,806,18,pencil);write(String(page*2+2).padStart(2,'0'),1114,806,18,pencil);
  if(page>0)arrow(151,801,121,801);if(page<2)arrow(1056,801,1086,801);
  c.fillStyle='#d6c6a6';c.beginPath();c.moveTo(1167,840);c.lineTo(1200,807);c.lineTo(1200,840);c.fill();
}
