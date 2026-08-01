class TicTacToeGame {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameMode = 'ai'; // 'ai' or 'player'
        this.gameActive = false;
        this.scoreX = 0;
        this.scoreO = 0;

        // Winning combinations
        this.winningCombinations = [
            [0, 1, 2], // Top row
            [3, 4, 5], // Middle row
            [6, 7, 8], // Bottom row
            [0, 3, 6], // Left column
            [1, 4, 7], // Middle column
            [2, 5, 8], // Right column
            [0, 4, 8], // Diagonal top-left to bottom-right
            [2, 4, 6]  // Diagonal top-right to bottom-left
        ];
    }

    startGame(mode) {
        this.gameMode = mode;
        this.resetBoard();
        this.showScreen('gameScreen');

        const modeText = mode === 'ai' ? 'vs AI' : 'Two Players';
        document.getElementById('gameMode').textContent = modeText;
    }

    resetBoard() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;

        // Clear all cells
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'x', 'o', 'winning');
            cell.onclick = (e) => this.handleCellClick(e);
        });

        this.updateUI();
        this.hideModal();
    }

    handleCellClick(event) {
        const cell = event.target;
        const index = parseInt(cell.dataset.index);

        // Check if cell is already taken or game is not active
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }

        // Make the move
        this.makeMove(index, this.currentPlayer);

        // Check for win or draw
        if (this.checkWin(this.currentPlayer)) {
            this.endGame(this.currentPlayer);
            return;
        }

        if (this.checkDraw()) {
            this.endGame('draw');
            return;
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateUI();

        // If AI mode and it's O's turn, let AI play
        if (this.gameMode === 'ai' && this.currentPlayer === 'O' && this.gameActive) {
            setTimeout(() => this.aiMove(), 500);
        }
    }

    makeMove(index, player) {
        this.board[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add('taken', player.toLowerCase());
    }

    // AI Logic using Minimax Algorithm
    aiMove() {
        if (!this.gameActive) return;

        const bestMove = this.findBestMove();

        if (bestMove !== -1) {
            this.makeMove(bestMove, 'O');

            // Check for win or draw
            if (this.checkWin('O')) {
                this.endGame('O');
                return;
            }

            if (this.checkDraw()) {
                this.endGame('draw');
                return;
            }

            // Switch back to player
            this.currentPlayer = 'X';
            this.updateUI();
        }
    }

    findBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        // Check terminal states
        if (this.checkWin('O')) return 10 - depth;
        if (this.checkWin('X')) return depth - 10;
        if (this.checkDraw()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWin(player) {
        return this.winningCombinations.some(combination => {
            return combination.every(index => this.board[index] === player);
        });
    }

    checkDraw() {
        return this.board.every(cell => cell !== '');
    }

    endGame(winner) {
        this.gameActive = false;

        if (winner !== 'draw') {
            // Update scores
            if (winner === 'X') {
                this.scoreX++;
                document.getElementById('scoreX').textContent = this.scoreX;
            } else {
                this.scoreO++;
                document.getElementById('scoreO').textContent = this.scoreO;
            }

            // Highlight winning combination
            this.highlightWinningCombination(winner);

            // Show game over modal
            const title = winner === 'X' ? '🎉 Player X Wins!' : '🤖 Player O Wins!';
            const message = winner === 'X' ? 'Congratulations!' :
                (this.gameMode === 'ai' ? 'AI wins this round!' : 'Congratulations!');

            this.showGameOverModal(title, message);
        } else {
            this.showGameOverModal("It's a Draw!", "Well played by both sides!");
        }
    }

    highlightWinningCombination(player) {
        for (let combination of this.winningCombinations) {
            if (combination.every(index => this.board[index] === player)) {
                combination.forEach(index => {
                    const cell = document.querySelector(`[data-index="${index}"]`);
                    cell.classList.add('winning');
                });
                break;
            }
        }
    }

    updateUI() {
        const turnText = this.currentPlayer === 'X' ? "X's Turn" : "O's Turn";
        document.getElementById('currentTurn').textContent = turnText;
    }

    showScreen(screenId) {
        const screens = ['menuScreen', 'gameScreen'];
        screens.forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    showMenu() {
        this.gameActive = false;
        this.hideModal();
        this.showScreen('menuScreen');
    }

    showGameOverModal(title, message) {
        document.getElementById('gameOverTitle').textContent = title;
        document.getElementById('gameOverMessage').textContent = message;
        document.getElementById('gameOverModal').classList.remove('hidden');
    }

    hideModal() {
        document.getElementById('gameOverModal').classList.add('hidden');
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');

        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
    }
}

// Initialize game
const game = new TicTacToeGame();
