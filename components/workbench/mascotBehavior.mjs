export function mascotTransition(previous, next, animate=true) {
  if(previous===next||!animate)return null;
  return next?'tucking':'waking';
}

// Word-wrap to a measured pixel-font width, then paginate to the reserved band.
export function paginateHint(text, measure, width, maxLines) {
  const lines=[];let line='';
  for(const word of text.trim().split(/\s+/)) {
    const candidate=line?`${line} ${word}`:word;
    if(line&&measure(candidate)>width){lines.push(line);line=word;}
    else line=candidate;
  }
  if(line)lines.push(line);
  const pages=[],count=Math.max(1,Math.floor(maxLines));
  for(let i=0;i<lines.length;i+=count)pages.push(lines.slice(i,i+count).join(' '));
  return pages.length?pages:[''];
}
