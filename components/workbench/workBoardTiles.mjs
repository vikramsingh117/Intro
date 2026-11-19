// Shared Work / Build tile metadata and pixel marks keep the 2D room and 3D projection visually identical.
export const WORK_BOARD_TILES = [
  { id:'github', title:'GITHUB', detail:'OPEN SOURCE', summary:'REPOSITORIES  /  SELECTED CONTRIBUTIONS', color:'#d9d7c6', ink:'#20302a', worldOffset:[-1.246,.5], iconGrid:24, icon:[
    // Octocat silhouette: pointed ears, broad head, tapered body, feet, and curling tail.
    [5,2,4,1],[18,2,3,1],[4,3,6,1],[16,3,6,1],[4,4,8,1],[14,4,8,1],
    [3,5,19,2],[4,7,18,4],[5,11,16,2],[6,13,14,2],[8,15,10,2],
    [9,17,4,4],[15,16,3,5],[8,21,6,2],[14,21,6,2],
    [3,14,4,1],[2,13,3,1],[1,14,3,2],[2,16,3,1],[3,17,3,1],[4,18,5,2],[6,20,4,1],
  ]},
  { id:'leetcode', title:'LEETCODE', detail:'534 SOLVED', summary:'ALGORITHMS  /  SAVED PROFILE SNAPSHOT', color:'#e4dfd4', ink:'#242923', worldOffset:[1.138,.5], iconGrid:24, icon:[
    // LeetCode's open angular loop with its distinct horizontal gray terminal.
    [9,2,5,2,'#f5a623'],[7,3,4,2,'#f5a623'],[5,5,4,2,'#f5a623'],[3,7,4,3,'#f5a623'],
    [2,10,4,4,'#f5a623'],[3,14,4,3,'#f5a623'],[5,17,4,2,'#f5a623'],[7,19,5,2,'#f5a623'],
    [11,20,4,2,'#f5a623'],[14,18,3,2,'#f5a623'],[16,16,3,2,'#f5a623'],[18,14,3,2,'#f5a623'],
    [7,6,2,2,'#242923'],[5,8,2,5,'#242923'],[6,13,2,3,'#242923'],[8,15,3,2,'#242923'],
    [10,10,12,3,'#a8aaad'],[11,9,10,1,'#c4c5c7'],
  ]},
  { id:'cribble', title:'CRIBBLE', detail:'PRODUCT BUILD', summary:'TELEGRAM MINIAPP  /  REACT + FIREBASE', color:'#a6b494', ink:'#213127', worldOffset:[-1.246,-.464], icon:[
    [3,3,10,2],[2,5,3,7],[4,12,9,2],[10,9,3,3],[7,6,6,2],[6,5,2,5],
  ]},
  { id:'office', title:'OFFICE', detail:'INTERNSHIP', summary:'POWER BI BENCHMARKING  /  SPRING BOOT', color:'#bb957d', ink:'#30251f', worldOffset:[1.138,-.464], icon:[
    [3,2,10,12],[1,13,14,2],[5,4,2,2],[9,4,2,2],[5,8,2,2],[9,8,2,2],[7,11,2,3],
  ]},
];

export const workBoardTileIndex=id=>WORK_BOARD_TILES.findIndex(tile=>tile.id===id);

export function drawWorkBoardIcon(context, tile, x, y, size) {
  const unit=size/(tile.iconGrid||16);
  tile.icon.forEach(([left,top,width,height,color])=>{
    context.fillStyle=color||tile.ink;
    context.fillRect(
    Math.round(x+left*unit),Math.round(y+top*unit),Math.ceil(width*unit),Math.ceil(height*unit)
    );
  });
}
