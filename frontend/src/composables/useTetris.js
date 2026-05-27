import { ref } from 'vue'
import { useGameStore } from '../stores/gameStore'
import { useLeaderboardStore } from '../stores/leaderboardStore'
import { useAuthStore } from '../stores/authStore'

const COLS = 10, ROWS = 20, CELL = 30, MAX_LEVEL = 10

const SHAPES = [
  { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00f0f0' },
  { shape: [[1,1],[1,1]], color: '#f0f000' },
  { shape: [[0,1,0],[1,1,1],[0,0,0]], color: '#a000f0' },
  { shape: [[0,0,1],[1,1,1],[0,0,0]], color: '#f0a000' },
  { shape: [[1,0,0],[1,1,1],[0,0,0]], color: '#0000f0' },
  { shape: [[0,1,1],[1,1,0],[0,0,0]], color: '#00f000' },
  { shape: [[1,1,0],[0,1,1],[0,0,0]], color: '#f00000' }
]
const SCORE_TABLE = [0, 100, 300, 600, 1000]

function rotateMatrix(m) {
  const n = m.length, r = Array.from({length:n},()=>Array(n).fill(0))
  for(let i=0;i<n;i++) for(let j=0;j<n;j++) r[j][n-1-i]=m[i][j]
  return r
}
function shuffle(a) { for(let i=a.length-1;i>0;i--){let j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]} return a }
function lighten(c,p){const n=parseInt(c.replace('#',''),16);return `rgb(${Math.min(255,(n>>16)+p)},${Math.min(255,((n>>8)&0xFF)+p)},${Math.min(255,(n&0xFF)+p)})`}

export function useTetris() {
  const game = useGameStore()
  const lb = useLeaderboardStore()
  const auth = useAuthStore()

  let board = [], current = null, next = null, bag = [], loopId = null
  let gCtx = null, nCtx = null, highScore = 0

  const isPlaying = ref(false)

  function bagNext() {
    if (!bag.length) bag = shuffle([0,1,2,3,4,5,6])
    const p = SHAPES[bag.pop()]
    return { shape: p.shape.map(r=>[...r]), color: p.color }
  }

  function collides(s, ox, oy) {
    for(let r=0;r<s.length;r++) for(let c=0;c<s[r].length;c++)
      if(s[r][c]){const bx=ox+c,by=oy+r;if(bx<0||bx>=COLS||by>=ROWS||(by>=0&&board[by][bx])) return true}
    return false
  }

  function spawn() {
    if(!next) next = bagNext()
    const p = { shape: next.shape.map(r=>[...r]), color: next.color, x: (COLS-next.shape[0].length)/2|0, y: 0 }
    next = bagNext(); drawNext()
    if(collides(p.shape,p.x,p.y)){current=p;game.gameOver=true;game.showOverlay=true;endGame();stopLoop();draw();return null}
    return p
  }

  function lock() {
    if(!current) return
    const {shape,color,x,y}=current
    for(let r=0;r<shape.length;r++) for(let c=0;c<shape[r].length;c++)
      if(shape[r][c]){const bx=x+c,by=y+r;if(by>=0&&by<ROWS&&bx>=0&&bx<COLS) board[by][bx]=color}
    clearRows(); current=spawn(); restartLoop(); draw()
  }

  function clearRows() {
    let n=0; for(let r=ROWS-1;r>=0;r--){if(board[r].every(c=>c)){board.splice(r,1);board.unshift(Array(COLS).fill(0));n++;r++}}
    if(n){game.score+=SCORE_TABLE[n]||0;game.linesCleared+=n;updateLevel()}
  }

  function updateLevel(){const nl=Math.min((game.linesCleared/10)|0,MAX_LEVEL);if(nl!==game.level){game.level=nl;if(!game.gameOver)restartLoop()}}

  function speed(){return Math.max(50,(500/(game.level+1))|0)}

  function moveLeft(){if(game.gameOver||game.paused||!current)return;if(!collides(current.shape,current.x-1,current.y)){current.x--;draw()}}
  function moveRight(){if(game.gameOver||game.paused||!current)return;if(!collides(current.shape,current.x+1,current.y)){current.x++;draw()}}
  function moveDown(){if(game.gameOver||game.paused||!current)return;if(!collides(current.shape,current.x,current.y+1)){current.y++;draw()}else lock()}
  function rotate(){if(game.gameOver||game.paused||!current)return;const r=rotateMatrix(current.shape);if(!collides(r,current.x,current.y)){current.shape=r;draw()}}
  function hardDrop(){if(game.gameOver||game.paused||!current)return;while(!collides(current.shape,current.x,current.y+1))current.y++;lock();draw()}

  function endGame() {
    stopLoop()
    if(game.score>highScore){highScore=game.score;game.isNewRecord=true;try{localStorage.setItem('tetris-hs',String(game.score))}catch{}}
    if(auth.isLoggedIn) {
      lb.submitScore(auth.token, {
        score: game.score,
        level: game.level,
        lines: game.linesCleared,
        duration_seconds: game.getDuration()
      })
    }
  }

  function draw() {
    if(!gCtx) return
    gCtx.clearRect(0,0,300,600)
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(board[r][c]) drawCell(gCtx,c,r,board[r][c])
    if(current&&!game.gameOver){
      let gy=current.y;while(!collides(current.shape,current.x,gy+1))gy++
      for(let r=0;r<current.shape.length;r++) for(let c=0;c<current.shape[r].length;c++)
        if(current.shape[r][c]){const bx=current.x+c,by=gy+r;if(by>=0&&by<ROWS&&bx>=0&&bx<COLS){gCtx.fillStyle='rgba(255,255,255,0.06)';gCtx.fillRect(bx*CELL+1,by*CELL+1,CELL-2,CELL-2);gCtx.strokeStyle='rgba(255,255,255,0.12)';gCtx.strokeRect(bx*CELL+1,by*CELL+1,CELL-2,CELL-2)}}
    }
    if(current){const {shape,color,x,y}=current;for(let r=0;r<shape.length;r++) for(let c=0;c<shape[r].length;c++) if(shape[r][c]) drawCell(gCtx,x+c,y+r,color)}
    gCtx.strokeStyle='rgba(255,255,255,0.04)';gCtx.lineWidth=.5
    for(let r=0;r<=ROWS;r++){gCtx.beginPath();gCtx.moveTo(0,r*CELL);gCtx.lineTo(300,r*CELL);gCtx.stroke()}
    for(let c=0;c<=COLS;c++){gCtx.beginPath();gCtx.moveTo(c*CELL,0);gCtx.lineTo(c*CELL,600);gCtx.stroke()}
  }

  function drawCell(ctx,cx,cy,color){const x=cx*CELL,y=cy*CELL,g=ctx.createRadialGradient(x+4,y+4,2,x+15,y+15,18);g.addColorStop(0,lighten(color,40));g.addColorStop(1,color);ctx.fillStyle=g;ctx.fillRect(x+1,y+1,CELL-2,CELL-2);ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(x+1,y+1,CELL-2,3);ctx.fillRect(x+1,y+1,3,CELL-2);ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x+CELL-4,y+1,3,CELL-2);ctx.fillRect(x+1,y+CELL-4,CELL-2,3)}

  function drawNext() {
    if(!nCtx||!next)return;nCtx.clearRect(0,0,120,120)
    const s=next.shape,pc=24,ox=(120-s[0].length*pc)/2,oy=(120-s.length*pc)/2
    for(let r=0;r<s.length;r++) for(let c=0;c<s[r].length;c++)
      if(s[r][c]){const px=ox+c*pc,py=oy+r*pc,g=nCtx.createRadialGradient(px+4,py+4,2,px+12,py+12,14);g.addColorStop(0,lighten(next.color,40));g.addColorStop(1,next.color);nCtx.fillStyle=g;nCtx.fillRect(px+1,py+1,pc-2,pc-2);nCtx.fillStyle='rgba(255,255,255,0.12)';nCtx.fillRect(px+1,py+1,pc-2,2);nCtx.fillRect(px+1,py+1,2,pc-2)}
  }

  function tick(){if(!game.gameOver&&!game.paused&&current)moveDown()}
  function startLoop(){stopLoop();loopId=setInterval(tick,speed())}
  function stopLoop(){if(loopId){clearInterval(loopId);loopId=null}}
  function restartLoop(){if(!game.gameOver)startLoop()}

  function togglePause(){if(game.gameOver||!current)return;game.paused=!game.paused;game.showOverlay=game.paused;game.paused?stopLoop():startLoop()}

  function startGame() {
    try{highScore=parseInt(localStorage.getItem('tetris-hs'))||0}catch{highScore=0}
    board=Array.from({length:ROWS},()=>Array(COLS).fill(0));bag=[]
    game.reset();next=bagNext();current=spawn();startLoop();draw();isPlaying.value=true
  }

  function restart() { stopLoop(); startGame() }

  function handleKey(e) {
    const k=e.key
    if(k==='r'||k==='R'){restart();e.preventDefault();return}
    if(k==='p'||k==='P'){togglePause();e.preventDefault();return}
    if(game.gameOver||game.paused) return
    switch(k){case'ArrowLeft':moveLeft();e.preventDefault();break;case'ArrowRight':moveRight();e.preventDefault();break;case'ArrowDown':moveDown();e.preventDefault();break;case'ArrowUp':rotate();e.preventDefault();break;case' ':hardDrop();e.preventDefault();break}
  }

  function mount(canvasId, nextId) {
    const c=document.getElementById(canvasId);gCtx=c.getContext('2d')
    const n=document.getElementById(nextId);nCtx=n.getContext('2d')
    window.addEventListener('keydown', handleKey)
  }

  function unmount() { stopLoop(); window.removeEventListener('keydown', handleKey) }

  return { isPlaying, restart, startGame, mount, unmount, drawNext }
}