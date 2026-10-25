const papers=[
  ['#fff0ac','#efd583','#dfbc65','#d4b660'],
  ['#e0efcb','#bdd8aa','#a3bf91','#a5bf8c'],
  ['#fce0dc','#edbdb8','#d8a09b','#d9aaa3'],
  ['#deedf6','#b8d5e7','#94b9d1','#9bbcd0'],
  ['#eee2f5','#d7c2e7','#bba2cf','#c2a8d3'],
];
export default function notePaper(id='') {
  let hash=0;for(const char of id)hash=(hash*31+char.charCodeAt(0))>>>0;
  const [light,base,shade,band]=papers[hash%papers.length];
  return {light,base,shade,band};
}
