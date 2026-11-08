// Explicit page identities prevent async loads or page changes mixing artwork.
export const UPLIANCE_ARTWORK = [
  {id:'overview',urls:[1,3,4].map(frame=>`/images/upliance-sequence/0${frame}.svg`)},
  {id:'app',urls:[1,2,3].map(frame=>`/images/upliance-app-sequence/0${frame}.svg`)},
  {id:'chatbot',urls:['/images/upliance-chatbot/home.svg','/images/upliance-chatbot/chat.svg']},
  {id:'tools',urls:[]},
];
export function selectArtwork(images,page,frame){
  const urls=UPLIANCE_ARTWORK[page]?.urls||[];
  return images[urls[frame]] || urls.map(url=>images[url]).find(Boolean) || null;
}
export function wrapArtworkLines(ctx,lines,maxWidth){
  return lines.flatMap(line=>{
    if(!line)return [''];
    const rows=[];let row='';
    for(const word of line.split(/\s+/)){
      const next=row?`${row} ${word}`:word;
      if(row&&ctx.measureText(next).width>maxWidth){rows.push(row);row=word;}else row=next;
    }
    if(row)rows.push(row);
    return rows;
  });
}
export function drawUplianceWork(ctx,page,pageIndex,image,mobile){
  // Reserve fixed columns even before the image loads, so text never jumps.
  const hasArtwork=UPLIANCE_ARTWORK[pageIndex].urls.length>0;
  const textWidth=hasArtwork?525:1040;
  ctx.fillStyle='#eaf0e8';ctx.fillRect(0,0,1200,740);
  ctx.fillStyle='#214c69';ctx.font='24px monospace';ctx.fillText(page.subtitle,60,60);
  let titleSize=mobile?50:46;
  do{ctx.font=`bold ${titleSize}px sans-serif`;if(ctx.measureText(page.title).width<=textWidth)break;titleSize--;}while(titleSize>28);
  ctx.fillStyle='#102e43';ctx.fillText(page.title,60,132);
  let font=mobile?34:29,rows,lineHeight;
  do{
    ctx.font=`${font}px sans-serif`;lineHeight=font*1.36;
    rows=wrapArtworkLines(ctx,page.lines,textWidth);
    if(rows.length*lineHeight<=460)break;
    font--;
  }while(font>20);
  rows.forEach((line,index)=>ctx.fillText(line,60,204+index*lineHeight));
  if(image){
    const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
    if(width&&height){
      const scale=Math.min(555/width,620/height);
      ctx.drawImage(image,610+(555-width*scale)/2,40+(620-height*scale)/2,width*scale,height*scale);
    }
  }
  ctx.fillStyle='#397eff';ctx.fillRect(60,686,1080*(pageIndex+1)/UPLIANCE_ARTWORK.length,5);
}
