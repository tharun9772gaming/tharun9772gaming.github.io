let currentGame = null;
let gameInterval = null;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameUI = document.getElementById('gameUI');
const menu = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');

function startGame(game) {
    currentGame = game;
    menu.style.display = 'none';
    gameContainer.style.display = 'flex';
    gameUI.innerHTML = '';
    canvas.style.display = 'block';
    if(gameInterval) clearInterval(gameInterval);

    switch(game) {
        case 'clicker': startClicker(); break;
        case 'maze': startMaze(); break;
        case 'tictactoe': startTicTacToe(); break;
        case 'snake': startSnake(); break;
        case 'pong': startPong(); break;
        case 'brick': startBrickBreaker(); break;
        case 'alien': startAlienShooter(); break;
        case 'memory': startMemoryMatch(); break;
        case 'coin': startCoinFlip(); break;
        case 'runner': startSkyRunner(); break;
        case 'roller': startRandomRoller(); break;
    }
}

function backToMenu() {
    if(gameInterval) clearInterval(gameInterval);
    canvas.style.display = 'none';
    gameUI.innerHTML = '';
    menu.style.display = 'grid';
}

function restartGame() {
    if(currentGame) startGame(currentGame);
}

function startClicker() {
    let score = 0;
    gameUI.innerHTML = '<p>Score: <span id="score">0</span></p><button id="clickBtn">Click Me!</button>';
    const scoreSpan = document.getElementById('score');
    const clickBtn = document.getElementById('clickBtn');
    clickBtn.onclick = () => { score++; scoreSpan.textContent = score; };
}

function startMaze() {
    const cols = 10, rows = 10, size = 40;
    let player = {x:0,y:0};
    let exit = {x:cols-1,y:rows-1};
    canvas.width = cols*size; canvas.height = rows*size;

    function drawMaze() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for(let x=0;x<cols;x++){
            for(let y=0;y<rows;y++){
                ctx.fillStyle = (x===exit.x && y===exit.y) ? 'gold':'#555';
                ctx.fillRect(x*size,y*size,size-2,size-2);
            }
        }
        ctx.fillStyle = 'blue'; ctx.fillRect(player.x*size,player.y*size,size-2,size-2);
    }
    drawMaze();
    document.onkeydown = e=>{
        if(e.key==='ArrowUp' && player.y>0) player.y--;
        if(e.key==='ArrowDown' && player.y<rows-1) player.y++;
        if(e.key==='ArrowLeft' && player.x>0) player.x--;
        if(e.key==='ArrowRight' && player.x<cols-1) player.x++;
        drawMaze();
        if(player.x===exit.x && player.y===exit.y){ alert('You Win!'); backToMenu(); }
    }
}

function startTicTacToe() {
    canvas.style.display = 'none';
    let board = ['','','','','','','','',''];
    let turn = 'X';
    function renderBoard(){
        gameUI.innerHTML = '';
        board.forEach((cell,i)=>{
            let btn = document.createElement('button');
            btn.textContent = cell || '';
            btn.style.width='60px'; btn.style.height='60px'; btn.style.fontSize='32px'; btn.style.margin='4px';
            btn.onclick = ()=>{
                if(board[i]===''){
                    board[i]=turn;
                    turn = turn==='X'?'O':'X';
                    renderBoard();
                    checkWin();
                }
            };
            gameUI.appendChild(btn);
        });
    }
    function checkWin(){
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for(let combo of wins){
            if(board[combo[0]] && board[combo[0]]===board[combo[1]] && board[combo[1]]===board[combo[2]]){
                setTimeout(()=>{ alert(`${board[combo[0]]} Wins!`); backToMenu(); },100);
            }
        }
        if(board.every(c=>c)) setTimeout(()=>{ alert('Draw!'); backToMenu(); },100);
    }
    renderBoard();
}

function startSnake() {
    const box = 20;
    let snake = [{x:10,y:10}];
    let food = {x:Math.floor(Math.random()*30),y:Math.floor(Math.random()*20)};
    let dir = 'RIGHT';
    document.onkeydown = e=>{ if(e.key==='ArrowUp') dir='UP'; if(e.key==='ArrowDown') dir='DOWN'; if(e.key==='ArrowLeft') dir='LEFT'; if(e.key==='ArrowRight') dir='RIGHT'; };
    function loop(){
        ctx.fillStyle='black'; ctx.fillRect(0,0,canvas.width,canvas.height);
        snake.forEach(s=>{ ctx.fillStyle='lime'; ctx.fillRect(s.x*box,s.y*box,box,box); });
        ctx.fillStyle='red'; ctx.fillRect(food.x*box,food.y*box,box,box);
        let head = {x:snake[0].x,y:snake[0].y};
        if(dir==='UP') head.y--; if(dir==='DOWN') head.y++; if(dir==='LEFT') head.x--; if(dir==='RIGHT') head.x++;
        if(head.x<0 || head.x>=canvas.width/box || head.y<0 || head.y>=canvas.height/box || snake.some(s=>s.x===head.x && s.y===head.y)){ clearInterval(gameInterval); alert('Game Over'); return; }
        snake.unshift(head);
        if(head.x===food.x && head.y===food.y){ food={x:Math.floor(Math.random()*30),y:Math.floor(Math.random()*20)}; } else { snake.pop(); }
    }
    gameInterval=setInterval(loop,100);
}

function startPong() {
    let paddleWidth=10,paddleHeight=80,ballRadius=8;
    let player={x:0,y:canvas.height/2-paddleHeight/2},ai={x:canvas.width-paddleWidth,y:canvas.height/2-paddleHeight/2};
    let ball={x:canvas.width/2,y:canvas.height/2,dx:4,dy:4};
    document.onkeydown = e=>{ if(e.key==='ArrowUp') player.y-=10; if(e.key==='ArrowDown') player.y+=10; };
    function loop(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='white';
        ctx.fillRect(player.x,player.y,paddleWidth,paddleHeight);
        ctx.fillRect(ai.x,ai.y,paddleWidth,paddleHeight);
        ctx.beginPath(); ctx.arc(ball.x,ball.y,ballRadius,0,Math.PI*2); ctx.fill(); ctx.closePath();
        ball.x+=ball.dx; ball.y+=ball.dy;
        if(ball.y<0 || ball.y>canvas.height) ball.dy*=-1;
        if(ball.x<player.x+paddleWidth && ball.y>player.y && ball.y<player.y+paddleHeight || ball.x>ai.x-ballRadius && ball.y>ai.y && ball.y<ai.y+paddleHeight) ball.dx*=-1;
        ai.y+=(ball.y-(ai.y+paddleHeight/2))*0.05;
        if(ball.x<0 || ball.x>canvas.width){ clearInterval(gameInterval); alert('Game Over'); }
    }
    gameInterval=setInterval(loop,20);
}

function startBrickBreaker() {
    const row=5, col=8;
    const brickWidth=60, brickHeight=20, brickPadding=10;
    let bricks=[];
    for(let r=0;r<row;r++){ bricks[r]=[]; for(let c=0;c<col;c++){ bricks[r][c]={x:0,y:0,status:1}; } }
    let paddle={x:canvas.width/2-50,y:canvas.height-20,width:100,height:10};
    let ball={x:canvas.width/2,y:canvas.height-30,dx:3,dy:-3,radius:8};
    let rightPressed=false,leftPressed=false;
    document.onkeydown=e=>{ if(e.key==='ArrowRight') rightPressed=true; if(e.key==='ArrowLeft') leftPressed=true; };
    document.onkeyup=e=>{ if(e.key==='ArrowRight') rightPressed=false; if(e.key==='ArrowLeft') leftPressed=false; };
    function drawBricks(){
        for(let r=0;r<row;r++){
            for(let c=0;c<col;c++){
                if(bricks[r][c].status){
                    let brickX=c*(brickWidth+brickPadding)+35;
                    let brickY=r*(brickHeight+brickPadding)+30;
                    bricks[r][c].x=brickX; bricks[r][c].y=brickY;
                    ctx.fillStyle='red'; ctx.fillRect(brickX,brickY,brickWidth,brickHeight);
                }
            }
        }
    }
    function loop(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        drawBricks();
        ctx.fillStyle='blue'; ctx.fillRect(paddle.x,paddle.y,paddle.width,paddle.height);
        ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.radius,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill(); ctx.closePath();
        ball.x+=ball.dx; ball.y+=ball.dy;
        if(ball.x+ball.dx>canvas.width-ball.radius || ball.x+ball.dx<ball.radius) ball.dx*=-1;
        if(ball.y+ball.dy<ball.radius) ball.dy*=-1;
        else if(ball.y+ball.dy>canvas.height-ball.radius){
            if(ball.x>paddle.x && ball.x<paddle.x+paddle.width) ball.dy*=-1;
            else { clearInterval(gameInterval); alert('Game Over'); }
        }
        if(rightPressed && paddle.x<canvas.width-paddle.width) paddle.x+=7;
        if(leftPressed && paddle.x>0) paddle.x-=7;
        for(let r=0;r<row;r++){
            for(let c=0;c<col;c++){
                let b=bricks[r][c];
                if(b.status && ball.x>b.x && ball.x<b.x+brickWidth && ball.y>b.y && ball.y<b.y+brickHeight){
                    ball.dy*=-1; b.status=0;
                }
            }
        }
    }
    gameInterval=setInterval(loop,20);
}

function startAlienShooter() {
    let bullets=[];
    let aliens=[];
    const ship={x:canvas.width/2-15,y:canvas.height-30,width:30,height:20};
    const alienRows=3, alienCols=7, alienWidth=30, alienHeight=20;
    for(let r=0;r<alienRows;r++){
        for(let c=0;c<alienCols;c++){
            aliens.push({x:c*50+30, y:r*40+30, width:alienWidth, height:alienHeight});
        }
    }
    document.onkeydown=e=>{ if(e.key==='ArrowLeft') ship.x-=10; if(e.key==='ArrowRight') ship.x+=10; if(e.key===' ') bullets.push({x:ship.x+ship.width/2,y:ship.y-5,width:4,height:10}); };
    function loop(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='green'; ctx.fillRect(ship.x,ship.y,ship.width,ship.height);
        bullets.forEach((b,i)=>{
            b.y-=5; ctx.fillStyle='yellow'; ctx.fillRect(b.x,b.y,b.width,b.height);
            aliens.forEach((a,j)=>{
                if(b.x<b.x+b.width && b.x>b.x && b.y<a.y+alienHeight && b.y>a.y){ aliens.splice(j,1); bullets.splice(i,1); }
            });
        });
        aliens.forEach(a=>{ ctx.fillStyle='red'; ctx.fillRect(a.x,a.y,a.width,a.height); a.y+=0.2; if(a.y+alienHeight>canvas.height) { clearInterval(gameInterval); alert('Game Over'); } });
    }
    gameInterval=setInterval(loop,20);
}

function startMemoryMatch() {
    canvas.style.display='none';
    let cards=['🍎','🍌','🍇','🍊','🍎','🍌','🍇','🍊'];
    cards.sort(()=>Math.random()-0.5);
    let selected=[], matched=[];
    function render(){
        gameUI.innerHTML='';
        cards.forEach((c,i)=>{
            let btn=document.createElement('button');
            btn.style.width='60px'; btn.style.height='60px'; btn.style.fontSize='32px'; btn.style.margin='4px';
            btn.textContent=matched.includes(i)||(selected.includes(i))?c:'❓';
            btn.onclick=()=>{
                if(selected.length<2&&!selected.includes(i)&&!matched.includes(i)){
                    selected.push(i);
                    if(selected.length===2){
                        setTimeout(()=>{
                            if(cards[selected[0]]===cards[selected[1]]) matched.push(...selected);
                            selected=[];
                            render();
                            if(matched.length===cards.length) { alert('You Win!'); backToMenu(); }
                        },500);
                    }
                    render();
                }
            };
            gameUI.appendChild(btn);
        });
    }
    render();
}

function startCoinFlip() {
    canvas.style.display='none';
    gameUI.innerHTML='<button id="flipBtn">Flip Coin</button><p id="result"></p>';
    document.getElementById('flipBtn').onclick=()=>{
        document.getElementById('result').textContent=Math.random()<0.5?'Heads':'Tails';
    };
}

function startSkyRunner() {
    let player={x:50,y:canvas.height/2,width:20,height:20,vy:0};
    let obstacles=[];
    let gravity=0.5;
    document.onkeydown=e=>{ if(e.key===' ') player.vy=-8; };
    function loop(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        player.vy+=gravity; player.y+=player.vy;
        ctx.fillStyle='blue'; ctx.fillRect(player.x,player.y,player.width,player.height);
        if(Math.random()<0.02) obstacles.push({x:canvas.width,y:Math.random()*canvas.height,width:20,height:20});
        obstacles.forEach((ob,i)=>{
            ob.x-=4; ctx.fillStyle='red'; ctx.fillRect(ob.x,ob.y,ob.width,ob.height);
            if(player.x<ob.x+ob.width && player.x+player.width>ob.x && player.y<ob.y+ob.height && player.y+player.height>ob.y){ clearInterval(gameInterval); alert('Game Over'); }
            if(ob.x+ob.width<0) obstacles.splice(i,1);
        });
        if(player.y>canvas.height) { clearInterval(gameInterval); alert('Game Over'); }
    }
    gameInterval=setInterval(loop,20);
}

function startRandomRoller() {
    canvas.style.display='none';
    gameUI.innerHTML='<button id="rollBtn">Roll Dice</button><p id="rollResult"></p>';
    document.getElementById('rollBtn').onclick=()=>{
        document.getElementById('rollResult').textContent=Math.floor(Math.random()*6)+1;
    };
}
