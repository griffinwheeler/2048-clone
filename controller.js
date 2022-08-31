import Game from "./game.js";

const game = new Game(4);

const gameBoard = document.querySelector('.game-board');
const resetBtn = document.querySelector('.reset-btn');
const score = document.querySelector('.value');
const best = document.querySelector('.best');
const alertContainer = document.querySelector('.alert-container');
const message = document.querySelector('.message');
const btnContainer = document.querySelector('.btn-container');
var prevScore;

setUpBoard(game.gameState);

const cells = [...gameBoard.children];

function setUpBoard(gameState) {
    gameState.board.forEach(() => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        gameBoard.append(cellElement);
    });
}

function reset() {
    game.setupNewGame();
    renderBoard(game.gameState);
    updateScore(game.gameState);
    document.addEventListener('keydown', keypress);
    message.textContent = '';
    btnContainer.innerHTML = '';
}

function keypress(e) {
    game.move(e.key.slice(5).toLowerCase());
    game.moveTiles(e.key.slice(5).toLowerCase());
}

const renderBoard = function(gameState) {
    cells.forEach((cell,index) => {
        cell.innerHTML = '';
        const tileElement = document.createElement('div');
        tileElement.classList.add('tile');
        tileElement.classList.add(`n${gameState.board[index]}`);
        tileElement.textContent = gameState.board[index]>0 ? gameState.board[index] : '';
        cell.append(tileElement);
    });
}

const updateScore = function(gameState) {
    prevScore = score.textContent;
    score.textContent = gameState.score;
    const scoreAdd = gameState.score - prevScore;
    if(scoreAdd<=0) return;
    if(best.textContent<gameState.score) best.textContent = gameState.score;
    const alertElement = document.createElement('div');
    alertElement.classList.add('alert');
    alertElement.textContent = '+' + scoreAdd;
    alertContainer.prepend(alertElement);
    setTimeout(() => {
        alertElement.classList.add('hide');
        alertElement.addEventListener('transitionend', () => {
            alertElement.remove();
        });
    }, 0);
}

const renderWin = function(gameState) {
    document.removeEventListener('keydown', keypress);
    message.textContent = 'You win!';
    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Keep going';
    const spaceElement = document.createElement('div');
    spaceElement.classList.add('space');
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Try again';
    continueBtn.addEventListener('click', function() {
        document.addEventListener('keydown', keypress);
        message.textContent = '';
        btnContainer.innerHTML = '';
    });
    restartBtn.addEventListener('click', reset);
    btnContainer.append(continueBtn);
    btnContainer.append(spaceElement);
    btnContainer.append(restartBtn);
}

const renderLose = function(gameState){
    document.removeEventListener('keydown', keypress);
    message.textContent = 'Game over!';
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'Try again';
    restartBtn.addEventListener('click', reset);
    btnContainer.append(restartBtn);
}

game.onMove(renderBoard);
game.onMove(updateScore);
game.onWin(renderWin);
game.onLose(renderLose);

function loadGame(){
    renderBoard(game.gameState);
    updateScore(game.gameState);
    resetBtn.addEventListener('click', reset);
    document.addEventListener('keydown', keypress);
}

loadGame();
