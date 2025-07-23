// Memory Game JavaScript

class MemoryGame {
    constructor() {
        this.gameBoard = document.getElementById('game-board');
        this.scoreElement = document.getElementById('score');
        this.movesElement = document.getElementById('moves');
        this.timerElement = document.getElementById('timer');
        this.matchedPairsElement = document.getElementById('matched-pairs');
        this.currentPlayerElement = document.getElementById('current-player');
        this.gameModeElement = document.getElementById('game-mode');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.difficultySelect = document.getElementById('difficulty');
        this.gameOverModal = document.getElementById('game-over');
        this.playAgainBtn = document.getElementById('play-again-btn');
        
        // New UI elements
        this.gridButtons = document.querySelectorAll('.grid-btn');
        this.playerButtons = document.querySelectorAll('.player-btn');
        this.player1ScoreElement = document.getElementById('player1-score');
        this.player2ScoreElement = document.getElementById('player2-score');
        
        // Game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gameActive = false;
        this.startTime = null;
        this.timerInterval = null;
        
        // Multi-player state
        this.numberOfPlayers = 1;
        this.currentPlayer = 1;
        this.playerScores = { 1: 0, 2: 0 };
        this.playerPairs = { 1: 0, 2: 0 };
        this.gridSize = 4;
        
        // Game symbols for different difficulties
        this.symbols = [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
            '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
            '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺',
            '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞'
        ];
        
        this.initializeEventListeners();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.difficultySelect.addEventListener('change', () => this.resetGame());
        
        // Grid size button listeners
        this.gridButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.gridButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.gridSize = parseInt(btn.dataset.size);
                this.resetGame();
            });
        });
        
        // Player selection button listeners
        this.playerButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.playerButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.numberOfPlayers = parseInt(btn.dataset.players);
                this.updatePlayerDisplay();
                this.resetGame();
            });
        });
    }
    
    startGame() {
        this.createGameBoard(this.gridSize);
        this.gameStarted = true;
        this.gameActive = true;
        this.startTime = Date.now();
        this.startTimer();
        this.startBtn.disabled = true;
        this.startBtn.textContent = 'Game Started';
        this.updateDisplay();
    }
    
    createGameBoard(gridSize) {
        const totalCards = gridSize * gridSize;
        const pairs = totalCards / 2;
        
        // Clear existing board
        this.gameBoard.innerHTML = '';
        this.gameBoard.className = `game-board ${this.getDifficultyClass(gridSize)}`;
        
        // Create pairs of cards
        const cardValues = [];
        for (let i = 0; i < pairs; i++) {
            cardValues.push(this.symbols[i], this.symbols[i]);
        }
        
        // Shuffle cards
        this.shuffleArray(cardValues);
        
        // Create card elements
        this.cards = [];
        cardValues.forEach((value, index) => {
            const card = this.createCard(value, index);
            this.cards.push(card);
            this.gameBoard.appendChild(card);
        });
        
        this.matchedPairs = 0;
        this.totalPairs = pairs;
        this.updateDisplay();
    }
    
    getDifficultyClass(gridSize) {
        const sizeMap = {
            4: 'easy',
            6: 'medium', 
            8: 'hard'
        };
        return sizeMap[gridSize] || 'easy';
    }
    
    createCard(value, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.value = value;
        card.dataset.index = index;
        card.addEventListener('click', () => this.flipCard(card));
        return card;
    }
    
    flipCard(card) {
        if (!this.gameActive || 
            card.classList.contains('flipped') || 
            card.classList.contains('matched') ||
            this.flippedCards.length >= 2) {
            return;
        }
        
        card.classList.add('flipped');
        this.flippedCards.push(card);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateDisplay();
            setTimeout(() => this.checkMatch(), 1000);
        }
    }
    
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const isMatch = card1.dataset.value === card2.dataset.value;
        
        if (isMatch) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;
            
            // Update current player's score
            if (this.numberOfPlayers === 1) {
                this.score += 10;
                // Bonus points for fewer moves
                if (this.moves <= this.totalPairs) {
                    this.score += 5;
                }
            } else {
                this.playerScores[this.currentPlayer] += 10;
                this.playerPairs[this.currentPlayer]++;
                this.updatePlayerScores();
            }
            
            this.checkGameComplete();
        } else {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            
            // Switch players in multiplayer mode
            if (this.numberOfPlayers === 2) {
                this.switchPlayer();
            }
        }
        
        this.flippedCards = [];
        this.updateDisplay();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateCurrentPlayerDisplay();
    }
    
    updatePlayerScores() {
        const player1Points = this.player1ScoreElement.querySelector('.player-points');
        const player1Pairs = this.player1ScoreElement.querySelector('.player-pairs');
        const player2Points = this.player2ScoreElement.querySelector('.player-points');
        const player2Pairs = this.player2ScoreElement.querySelector('.player-pairs');
        
        player1Points.textContent = `${this.playerScores[1]} points`;
        player1Pairs.textContent = `${this.playerPairs[1]} pairs`;
        player2Points.textContent = `${this.playerScores[2]} points`;
        player2Pairs.textContent = `${this.playerPairs[2]} pairs`;
    }
    
    updateCurrentPlayerDisplay() {
        // Remove active class from both players
        this.player1ScoreElement.classList.remove('active');
        this.player2ScoreElement.classList.remove('active');
        
        // Add active class to current player
        if (this.currentPlayer === 1) {
            this.player1ScoreElement.classList.add('active');
        } else {
            this.player2ScoreElement.classList.add('active');
        }
        
        this.currentPlayerElement.textContent = `Player ${this.currentPlayer}`;
    }
    
    updatePlayerDisplay() {
        this.gameModeElement.textContent = this.numberOfPlayers === 1 ? 'Single Player' : 'Two Players';
        
        if (this.numberOfPlayers === 1) {
            this.player2ScoreElement.classList.add('hidden');
            this.player1ScoreElement.classList.add('active');
            this.currentPlayerElement.textContent = 'Player 1';
        } else {
            this.player2ScoreElement.classList.remove('hidden');
            this.updateCurrentPlayerDisplay();
        }
    }
    
    checkGameComplete() {
        if (this.matchedPairs === this.totalPairs) {
            this.gameActive = false;
            this.stopTimer();
            
            if (this.numberOfPlayers === 1) {
                // Calculate final score with time bonus for single player
                const timeBonus = Math.max(0, 100 - Math.floor(this.getElapsedTime() / 1000));
                this.score += timeBonus;
            }
            
            setTimeout(() => this.showGameComplete(), 500);
        }
    }
    
    showGameComplete() {
        const finalScore = document.getElementById('final-score');
        const finalMoves = document.getElementById('final-moves');
        const finalTime = document.getElementById('final-time');
        
        if (this.numberOfPlayers === 1) {
            finalScore.textContent = this.score;
        } else {
            // Determine winner in multiplayer
            const winner = this.playerPairs[1] > this.playerPairs[2] ? 1 : 
                          this.playerPairs[2] > this.playerPairs[1] ? 2 : 'tie';
            
            if (winner === 'tie') {
                finalScore.textContent = 'It\'s a tie!';
            } else {
                finalScore.textContent = `Player ${winner} wins! (${this.playerPairs[winner]} pairs)`;
            }
        }
        
        finalMoves.textContent = this.moves;
        finalTime.textContent = this.formatTime(this.getElapsedTime());
        
        this.gameOverModal.classList.remove('hidden');
    }
    
    resetGame() {
        this.gameBoard.innerHTML = '';
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.gameStarted = false;
        this.gameActive = false;
        this.startTime = null;
        this.currentPlayer = 1;
        this.playerScores = { 1: 0, 2: 0 };
        this.playerPairs = { 1: 0, 2: 0 };
        this.stopTimer();
        
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Game';
        this.gameOverModal.classList.add('hidden');
        
        this.updateDisplay();
        this.updatePlayerDisplay();
        this.updatePlayerScores();
    }
    
    playAgain() {
        this.resetGame();
        this.startGame();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.gameActive && this.startTime) {
                const elapsedTime = this.getElapsedTime();
                this.timerElement.textContent = this.formatTime(elapsedTime);
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    getElapsedTime() {
        return this.startTime ? Date.now() - this.startTime : 0;
    }
    
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateDisplay() {
        this.scoreElement.textContent = this.numberOfPlayers === 1 ? this.score : 
            `P1: ${this.playerScores[1]} | P2: ${this.playerScores[2]}`;
        this.movesElement.textContent = this.moves;
        this.matchedPairsElement.textContent = `${this.matchedPairs}/${this.totalPairs}`;
        
        if (!this.gameStarted) {
            this.timerElement.textContent = '00:00';
        }
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});

// Add some additional features for better user experience
document.addEventListener('keydown', (e) => {
    // ESC key to close game over modal
    if (e.key === 'Escape') {
        document.getElementById('game-over').classList.add('hidden');
    }
    
    // Space bar to start/reset game
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        const startBtn = document.getElementById('start-btn');
        const resetBtn = document.getElementById('reset-btn');
        
        if (!startBtn.disabled) {
            startBtn.click();
        } else {
            resetBtn.click();
        }
    }
});

// Prevent right-click context menu on cards to avoid cheating
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('card')) {
        e.preventDefault();
    }
});

// Add visual feedback for accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
});
