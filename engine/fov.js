import { FovEngine } from './fov.js';
import { DATA } from '../data/game_data.js';

﻿const FovEngine = (() => {
  let map = [], W = 0, H = 0;
  let revealed = new Set(), visible = new Set();

  function generateMaze(w, h) {
    W = w; H = h;
    map = Array.from({length:H}, () => Array(W).fill(1));
    revealed = new Set(); visible = new Set();
    function carve(x, y) {
      const dirs = [[0,-2],[2,0],[0,2],[-2,0]].sort(()=>Math.random()-0.5);
      dirs.forEach(([dx,dy]) => {
        const nx=x+dx, ny=y+dy;
        if(nx>0&&nx<W-1&&ny>0&&ny<H-1&&map[ny][nx]===1){
          map[y+dy/2][x+dx/2]=0; map[ny][nx]=0; carve(nx,ny);
        }
      });
    }
    map[1][1]=0; carve(1,1); map[H-2][W-2]=0;
    return map;
  }

  const OCT = [[1,0,0,-1],[1,0,0,1],[-1,0,0,1],[-1,0,0,-1],[0,-1,-1,0],[0,-1,1,0],[0,1,1,0],[0,1,-1,0]];

  function castLight(cx,cy,radius,row,startSlope,endSlope,oct) {
    if(startSlope<endSlope) return;
    const [xx,xy,yx,yy]=OCT[oct];
    let blocked=false, nSlope;
    for(let dist=row;dist<=radius&&!blocked;dist++){
      for(let col=-dist;col<=0;col++){
        const lSlope=(col-0.5)/(dist+0.5), rSlope=(col+0.5)/(dist-0.5);
        if(startSlope<rSlope) continue;
        if(endSlope>lSlope) break;
        const mx=cx+col*xx+dist*xy, my=cy+col*yx+dist*yy;
        if(mx<0||mx>=W||my<0||my>=H) continue;
        if(col*col+dist*dist<=radius*radius){ visible.add(`${mx},${my}`); revealed.add(`${mx},${my}`); }
        if(blocked){ if(map[my][mx]===1) nSlope=rSlope; else{blocked=false;startSlope=nSlope;} }
        else if(map[my][mx]===1&&dist<radius){ blocked=true; castLight(cx,cy,radius,dist+1,startSlope,lSlope,oct); nSlope=rSlope; }
      }
      if(blocked) break;
    }
  }

  function computeFov(px,py,radius=6){
    visible=new Set(); visible.add(`${px},${py}`); revealed.add(`${px},${py}`);
    for(let i=0;i<8;i++) castLight(px,py,radius,1,1.0,0.0,i);
  }

  function drawMaze(ctx,cW,cH,px,py){
    if(!W||!H) return;
    const tW=cW/W, tH=cH/H;
    computeFov(px,py,6);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const vis=visible.has(`${x},${y}`), rev=revealed.has(`${x},${y}`);
      if(!rev) continue;
      ctx.save(); ctx.globalAlpha=vis?1:0.25;
      if(map[y][x]===1){
        ctx.fillStyle='#1a0a3a'; ctx.fillRect(x*tW,y*tH,tW+1,tH+1);
        if(vis){ctx.strokeStyle='rgba(123,47,255,0.3)';ctx.lineWidth=0.5;ctx.strokeRect(x*tW,y*tH,tW,tH);}
      } else {
        ctx.fillStyle='#0a0520'; ctx.fillRect(x*tW,y*tH,tW+1,tH+1);
        if(vis){ctx.strokeStyle='rgba(80,40,120,0.15)';ctx.lineWidth=0.5;ctx.strokeRect(x*tW+2,y*tH+2,tW-4,tH-4);}
      }
      ctx.restore();
    }
    const glow=ctx.createRadialGradient((px+0.5)*tW,(py+0.5)*tH,0,(px+0.5)*tW,(py+0.5)*tH,tW*3);
    glow.addColorStop(0,'rgba(123,47,255,0.25)'); glow.addColorStop(1,'transparent');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc((px+0.5)*tW,(py+0.5)*tH,tW*3,0,Math.PI*2); ctx.fill();
  }

  return { generateMaze, computeFov, drawMaze, getMap:()=>map, getSize:()=>({W,H}), getRevealed:()=>revealed, getVisible:()=>visible };


// ────────────────────────────────────────
// DATA — 완전 통합 DB
// ────────────────────────────────────────
