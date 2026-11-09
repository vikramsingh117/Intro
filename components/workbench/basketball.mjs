// Shared by the visible mount and paper physics; Y is the horizontal rim plane.
export const HOOP = Object.freeze({ x: -7.493, y: 1.8, z: .3, radius: 1.053, tube: .0715, scale: 2.6, assetRimY: .3, rotation: 0, size: 1,
  boardAxis: 'x', boardX: -9.04, boardY: 2.55, boardWidth: 3.25, boardHeight: 2.65, boardDepth: .12 });
// Mobile mount faces forward from the back wall, immediately right of the window.
export const MOBILE_HOOP = Object.freeze({ ...HOOP, x: -.9, y: 3, z: -1.473,
  rotation: -90, boardWidth: HOOP.boardWidth / 2, boardHeight: HOOP.boardHeight / 2, boardAxis: 'z', boardX: -.9, boardZ: -3.02, boardY: 3.75 });
export const DESKTOP_HOOP_POSITION = Object.freeze({x:-7.85,y:2.5,z:-2.02,rotation:-92,size:.69});
export const MOBILE_HOOP_POSITION = Object.freeze({x:-1.85,y:2.85,z:-1.473,rotation:-90,size:.75});
export function hoopForWidth(width, placements) {
  const mobile = width <= 760, base = mobile ? MOBILE_HOOP : HOOP;
  const position = placements?.[mobile ? 'mobile' : 'desktop'] || (mobile ? MOBILE_HOOP_POSITION : DESKTOP_HOOP_POSITION);
  if (!position) return base;
  const x=position.x??base.x, y=position.y??base.y, z=position.z??base.z;
  const rotation=position.rotation??base.rotation, size=position.size??1;
  const angle=rotation*Math.PI/180, offset=(HOOP.boardX-HOOP.x)*size;
  return {...base, x,y,z,rotation,size, radius:base.radius*size,tube:base.tube*size,
    boardWidth:base.boardWidth*size,boardHeight:base.boardHeight*size,boardDepth:base.boardDepth*size,
    boardX:x+offset*Math.cos(angle),boardY:y+(HOOP.boardY-HOOP.y)*size,boardZ:z-offset*Math.sin(angle)};
}
export const CELEBRATION_MS = 3000;

export function crossedHoop(previous, current, radius, hoop = HOOP) {
  if (previous.y <= hoop.y || current.y > hoop.y || current.y >= previous.y) return false;
  const t = (previous.y - hoop.y) / (previous.y - current.y);
  const x = previous.x + (current.x - previous.x) * t - hoop.x;
  const z = previous.z + (current.z - previous.z) * t - hoop.z;
  const clearance = hoop.radius - hoop.tube - radius;
  return clearance > 0 && x * x + z * z <= clearance * clearance;
}

export function collideHoop(body, previous, radius, hoop = HOOP) {
  const p = body.position, v = body.velocity;
  // Swept backboard contact, including fast shots that cross its thin geometry.
  const angle=hoop.rotation*Math.PI/180, nxBoard=Math.cos(angle), nzBoard=-Math.sin(angle);
  const boardZ=hoop.boardZ??hoop.z;
  const before=(previous.x-hoop.boardX)*nxBoard+(previous.z-boardZ)*nzBoard;
  const after=(p.x-hoop.boardX)*nxBoard+(p.z-boardZ)*nzBoard;
  const contactPlane=hoop.boardDepth/2+radius;
  const intoBoard=v.x*nxBoard+v.z*nzBoard;
  if(before>=contactPlane&&after<contactPlane&&intoBoard<0){
    const t=(before-contactPlane)/(before-after);
    const y=previous.y+(p.y-previous.y)*t;
    const x=previous.x+(p.x-previous.x)*t-hoop.boardX;
    const z=previous.z+(p.z-previous.z)*t-boardZ;
    const lateral=x*Math.sin(angle)+z*Math.cos(angle);
    if(Math.abs(y-hoop.boardY)<=hoop.boardHeight/2+radius&&Math.abs(lateral)<=hoop.boardWidth/2+radius){
      p.x+=nxBoard*(contactPlane-after);p.z+=nzBoard*(contactPlane-after);
      v.x-=1.5*intoBoard*nxBoard;v.z-=1.5*intoBoard*nzBoard;
    }
  }
  const dx = p.x - hoop.x, dz = p.z - hoop.z, radial = Math.hypot(dx, dz);
  if (radial < 1e-6) return;
  const nx = dx - dx / radial * hoop.radius, ny = p.y - hoop.y, nz = dz - dz / radial * hoop.radius;
  const distance = Math.hypot(nx, ny, nz), contact = radius + hoop.tube;
  if (distance >= contact || distance < 1e-6) return;
  const x = nx / distance, y = ny / distance, z = nz / distance;
  p.x += x * (contact - distance); p.y += y * (contact - distance); p.z += z * (contact - distance);
  const into = v.x * x + v.y * y + v.z * z;
  if (into < 0) { v.x -= 1.45 * into * x; v.y -= 1.45 * into * y; v.z -= 1.45 * into * z; }
}

// Two soft dips, then restore the user's light state. No rapid strobe.
export function celebrationLight(elapsed, reduced = false) {
  if (reduced || elapsed < 0 || elapsed >= 1.4) return null;
  return .35 + .65 * Math.pow(Math.cos(elapsed / 1.4 * Math.PI * 2), 2);
}
