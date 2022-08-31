export default class Game {
    constructor(size) {
        this.size = size;
        this.gameState = {};
        this.moveObservers = [];
        this.winObservers = [];
        this.loseObservers = [];
        this.setupNewGame();
    }

    setupNewGame() {
        const newBoard = this.addTile(this.addTile(new Array(this.size*this.size).fill(0)));
        this.gameState = {
            board: newBoard,
            score: 0,
            won: false,
            over: false
        }
    }

    loadGame(gameState) { this.gameState = gameState; }
    
    move(direction) {
        let board = this.arrayToMatrix(this.gameState.board);
        switch(direction) {
            case "up":
                board = this.rotate90(board);
                break;
            case "down":
                board = this.rotate270(board);
                break;
            case "left":
                board = this.rotate180(board);
                break;
        }
        const checkForChange = this.arrayToMatrix(this.matrixToArray(board));
        this.slide(board);
        this.collapse(board,true);
        this.slide(board);

        if(this.same(board,checkForChange)) { return; }

        board = this.arrayToMatrix(this.addTile(this.matrixToArray(board)));

        switch(direction) {
            case "up":
                board = this.rotate270(board);
                break;
            case "down":
                board = this.rotate90(board);
                break;
            case "left":
                board = this.rotate180(board);
        }
        this.gameState.board = this.matrixToArray(board);
        this.notifyMoveObservers();

        if(this.hasWon()) {
            this.gameState.won = true;
            this.notifyWinObservers();
        }

        if(this.hasLost()) {
            this.gameState.over = true;
            this.gameState.won = false;
            this.notifyLoseObservers();
        }
    }

    onMove(callback) { this.moveObservers.push(callback); }
    onWin(callback)  { this.winObservers.push(callback);  }
    onLose(callback) { this.loseObservers.push(callback); }

    getGameState() { return this.gameState; }

    /*------------------------------------Helper Functions------------------------------------*/

    addTile(board) {
       let empty = [];
       for(let i=0; i<board.length; i++) {if(board[i]==0) empty.push(i);}

       const randomIndex = Math.floor(Math.random()*empty.length);
       board[empty[randomIndex]] = Math.random() < 0.9 ? 2 : 4;
       return board;
   }

   arrayToMatrix(array) {
        let matrix = [];
        for(let i=0; i<this.size; i++) {
            matrix.push([]);
            for(let j=0; j<this.size; j++) {
                matrix[i].push(array[(i*this.size)+j]);
            }
        }
        return matrix;
    }

   matrixToArray(matrix) {
       const array = new Array(matrix.length*matrix.length);
       for(let i=0; i<this.size; i++) {
           for(let j=0; j<this.size; j++) {
               array[(i*this.size)+j] = matrix[i][j];
           }
       }
       return array;
   }
   
   empty() {return this.arrayToMatrix(new Array(this.size*this.size));}

   rotate90(matrix) {
       const rotated = this.empty();
       for(let i=0; i<this.size; i++) {
           for(let j=0; j<this.size; j++) {
               rotated[i][j] = matrix[(this.size-1)-j][i];
           }
       }
       return rotated;
   }

   rotate180(matrix) {
       const rotated = this.empty();
       for(let i=0; i<this.size; i++) {
           for(let j=0; j<this.size; j++) {
               rotated[i][j] = matrix[(this.size-1)-i][(this.size-1)-j];
           }
       }
       return rotated;
   }

   rotate270(matrix) {
       const rotated = this.empty();
       for(let i=0; i<this.size; i++) {
           for(let j=0; j<this.size; j++) {
               rotated[i][j] = matrix[j][(this.size-1)-i];
           }
       }
       return rotated;
   }

   slide(matrix) {
       let slideCount = 0;
       for(let i=0; i<this.size; i++) {
           for(let j=0; j<this.size; j++) {
               if(matrix[i][(this.size-1)-j]==0) {
                   slideCount++;
               } else if(slideCount>0) {
                   matrix[i][(this.size-1)-j+slideCount] = matrix[i][(this.size-1)-j];
                   matrix[i][(this.size-1)-j] = 0;
               }
           }
           slideCount = 0;
       }
       return matrix;
   }

   collapse(matrix, updateScore) {
       for(let i=0; i<this.size; i++) {
           for(let j=0; j<(this.size-1); j++) {
               if(matrix[i][(this.size-1)-j]==matrix[i][(this.size-1)-j-1]) {
                   matrix[i][(this.size-1)-j] *= 2;
                   if(updateScore) this.gameState.score += matrix[i][(this.size-1)-j];
                   matrix[i][(this.size-1)-j-1] = 0;
               }
           }
       }
       return matrix;
   }

   same(changed, original) {
       for(let i=0; i<this.size; i++) {
           for(let j=0; j<this.size; j++) {
               if(changed[i][j]!=original[i][j]) return false;
           }
       }
       return true;
   }

   hasWon() { return !this.gameState.won&&this.gameState.board.includes(2048); }

   hasLost() {
        if(this.gameState.board.includes(0)) { return false; }

        const right = this.arrayToMatrix(this.gameState.board);
        const checkRight = this.arrayToMatrix(this.matrixToArray(right));
        this.slide(right);
        this.collapse(right, false);
        this.slide(right);
        if(!this.same(right,checkRight)) return false;

        const up = this.rotate90(right);
        const checkUp = this.arrayToMatrix(this.matrixToArray(up));
        this.slide(up);
        this.collapse(up, false);
        this.slide(up);
        if(!this.same(up,checkUp)) return false;

        const down = this.rotate270(right);
        const checkDown = this.arrayToMatrix(this.matrixToArray(down));
        this.slide(down);
        this.collapse(down, false);
        this.slide(down);
        if(!this.same(down,checkDown)) return false;

        const left = this.rotate180(right);
        const checkLeft = this.arrayToMatrix(this.matrixToArray(left));
        this.slide(left);
        this.collapse(left, false);
        this.slide(left);
        if(!this.same(left,checkLeft)) return false;

        return true;
   }

   notifyMoveObservers() {this.moveObservers.forEach((o) => {o(this.gameState)});}
   notifyWinObservers() {this.winObservers.forEach((o) => {o(this.gameState)});}
   notifyLoseObservers() {this.loseObservers.forEach((o) => {o(this.gameState)});}
}