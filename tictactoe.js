// Professional Tic-Tac-Toe Application
class ProfessionalTicTacToe {
  constructor() {
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameMode = 'ai';
    this.aiDifficulty = 'medium';
    this.gameActive = true;
    this.gameHistory = document.getElementById('gameHistory');
    this.gameHistoryData = [];
    this.moveHistory = [];
    this.scores = { X: 0, O: 0, draw: 0 };
    this.settings = {
      soundEffects: true,
      animations: true,
      autoSave: true,
      playerXSymbol: 'X'
    };
    this.themes = ['default', 'ocean', 'sunset', 'forest', 'midnight'];
    this.currentTheme = 0;
    this.gameStartTime = null;
    this.gameEndTime = null;
    this.playerWins = { X: [], O: [] };
    
    this.initializeElements();
    this.bindEvents();
    this.loadSettings();
    this.updateDisplay();
    this.updateStatistics();
  }

  initializeElements() {
    this.boardElement = document.getElementById('board');
    this.gameStatus = document.getElementById('gameStatus');
    this.gameSubtitle = document.getElementById('gameSubtitle');
    this.scoreX = document.getElementById('scoreX');
    this.scoreO = document.getElementById('scoreO');
    this.totalGames = document.getElementById('totalGames');
    this.winRate = document.getElementById('winRate');
    this.avgTime = document.getElementById('avgTime');
    this.streak = document.getElementById('streak');
    this.gameHistory = document.getElementById('gameHistory');
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.themeToggle = document.getElementById('themeToggle');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettings = document.getElementById('closeSettings');
    this.newGameBtn = document.getElementById('newGameBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.undoBtn = document.getElementById('undoBtn');
    this.saveBtn = document.getElementById('saveBtn');
    this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    
    // Settings elements
    this.aiDifficulty = document.getElementById('aiDifficulty');
    this.playerXSymbol = document.getElementById('playerXSymbol');
    this.soundEffects = document.getElementById('soundEffects');
    this.animations = document.getElementById('animations');
    this.autoSave = document.getElementById('autoSave');
  }

  bindEvents() {
    // Board cells
    this.boardElement.addEventListener('click', (e) => {
      if (e.target.classList.contains('board-cell')) {
        const cellIndex = e.target.dataset.cell;
        this.makeMove(parseInt(cellIndex));
      }
    });

    // Control buttons
    this.newGameBtn.addEventListener('click', () => this.newGame());
    this.resetBtn.addEventListener('click', () => this.resetGame());
    this.undoBtn.addEventListener('click', () => this.undoMove());
    this.saveBtn.addEventListener('click', () => this.saveGame());
    this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
    
    // Theme and settings
    this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    this.themeToggle.addEventListener('click', () => this.cycleTheme());
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
    
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mode = e.currentTarget.dataset.mode;
        this.switchMode(mode);
      });
    });
    
    // Settings changes
    this.aiDifficulty.addEventListener('change', () => this.updateSettings());
    this.playerXSymbol.addEventListener('change', () => this.updateSettings());
    this.soundEffects.addEventListener('change', () => this.updateSettings());
    this.animations.addEventListener('change', () => this.updateSettings());
    this.autoSave.addEventListener('change', () => this.updateSettings());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    
    // Modal backdrop click
    this.settingsModal.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) this.closeSettingsModal();
    });
  }

  makeMove(cellIndex) {
    if (this.board[cellIndex] === '' && this.gameActive) {
      // Player move
      this.board[cellIndex] = this.currentPlayer;
      this.moveHistory.push({ player: this.currentPlayer, cell: cellIndex });
      
      this.updateCell(cellIndex, this.currentPlayer);
      this.playSound('move');
      
      if (this.checkWinner()) {
        this.endGame(this.currentPlayer);
    return;
  }
      
      if (this.checkDraw()) {
        this.endGame('draw');
    return;
  }
      
      this.switchPlayer();
      
      // AI move
      if (this.gameMode === 'ai' && this.currentPlayer === 'O' && this.gameActive) {
        setTimeout(() => {
          this.makeAIMove();
        }, 500);
      }
    }
  }

  makeAIMove() {
    if (!this.gameActive) return;
    
    const move = this.getAIMove();
    if (move !== -1) {
      this.board[move] = this.currentPlayer;
      this.moveHistory.push({ player: this.currentPlayer, cell: move });
      
      this.updateCell(move, this.currentPlayer);
      this.playSound('move');
      
      if (this.checkWinner()) {
        this.endGame(this.currentPlayer);
        return;
      }
      
      if (this.checkDraw()) {
        this.endGame('draw');
        return;
      }
      
      this.switchPlayer();
    }
  }

  getAIMove() {
    const availableMoves = this.board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
    
    if (availableMoves.length === 0) return -1;
    
    switch (this.aiDifficulty) {
      case 'easy':
        return this.getRandomMove(availableMoves);
      case 'medium':
        return Math.random() < 0.7 ? this.getBestMove() : this.getRandomMove(availableMoves);
      case 'hard':
        return Math.random() < 0.97 ? this.getBestMove() : this.getRandomMove(availableMoves);
      case 'impossible':
        return this.getBestMove();
      default:
        return this.getRandomMove(availableMoves);
    }
  }

  getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i] === '') {
        this.board[i] = 'O';
        const score = this.advancedMinimax(this.board, 0, false, -Infinity, Infinity);
        this.board[i] = '';
        
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  }

  advancedMinimax(board, depth, isMaximizing, alpha, beta) {
    if (this.checkWinnerForAI()) return isMaximizing ? -10 + depth : 10 - depth;
    if (this.checkDrawForAI()) return 0;
    if (depth > 6) return 0;
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          board[i] = 'O';
          const evalScore = this.advancedMinimax(board, depth + 1, false, alpha, beta);
          board[i] = '';
          maxEval = Math.max(maxEval, evalScore);
          alpha = Math.max(alpha, evalScore);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
          board[i] = 'X';
          const evalScore = this.advancedMinimax(board, depth + 1, true, alpha, beta);
          board[i] = '';
          minEval = Math.min(minEval, evalScore);
          beta = Math.min(beta, evalScore);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  }

  getRandomMove(availableMoves) {
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  updateCell(cellIndex, player) {
    const cell = this.boardElement.children[cellIndex];
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    
    if (this.settings.animations) {
      cell.classList.add('cell-animate');
      setTimeout(() => cell.classList.remove('cell-animate'), 300);
    }
  }

  checkWinner() {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    for (let condition of winConditions) {
      const [a, b, c] = condition;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.highlightWinningCells(condition);
        return true;
      }
    }
    return false;
  }

  checkWinnerForAI() {
    const winConditions = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (let condition of winConditions) {
      const [a, b, c] = condition;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return true;
      }
    }
    return false;
  }

  checkDraw() {
    return this.board.every(cell => cell !== '');
  }

  checkDrawForAI() {
    return this.board.every(cell => cell !== '');
  }

  highlightWinningCells(winningCells) {
    winningCells.forEach(index => {
      this.boardElement.children[index].classList.add('winning');
    });
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    this.updatePlayerDisplay();
  }

  updatePlayerDisplay() {
    const playerCards = document.querySelectorAll('.player-card');
    playerCards.forEach(card => card.classList.remove('active'));
    
    if (this.currentPlayer === 'X') {
      document.getElementById('playerX').classList.add('active');
    } else {
      document.getElementById('playerO').classList.add('active');
    }
    
    this.gameStatus.textContent = `${this.currentPlayer === 'X' ? 'Player X' : 'Player O'}'s Turn`;
  }

  endGame(winner) {
    this.gameActive = false;
    this.gameEndTime = Date.now();
    const now = new Date().toLocaleTimeString();
    if (winner === 'draw') {
      this.scores.draw++;
      this.gameStatus.textContent = "It's a Draw!";
      this.showToast("Game ended in a draw!", 'info');
  } else {
      this.scores[winner]++;
      this.gameStatus.textContent = `Player ${winner} Wins!`;
      this.showToast(`Player ${winner} wins!`, 'success');
      this.playerWins[winner].unshift(now);
      if (this.playerWins[winner].length > 5) this.playerWins[winner].pop();
      this.updatePlayerWinsDisplay();
    }
    this.playSound(winner === 'draw' ? 'draw' : 'win');
    this.addToHistory(winner);
    this.updateStatistics();
    this.updatePlayerScores();
    console.log('endGame: scores', JSON.stringify(this.scores));
    if (this.settings.autoSave) {
      this.saveToLocalStorage();
    }
  }

  updatePlayerScores() {
    // Always update the player score elements
    const scoreX = document.getElementById('scoreX');
    const scoreO = document.getElementById('scoreO');
    if (scoreX) {
      scoreX.textContent = this.scores.X;
      console.log('updatePlayerScores: scoreX', this.scores.X);
    } else {
      console.warn('updatePlayerScores: #scoreX not found');
    }
    if (scoreO) {
      scoreO.textContent = this.scores.O;
      console.log('updatePlayerScores: scoreO', this.scores.O);
    } else {
      console.warn('updatePlayerScores: #scoreO not found');
    }
  }

  updatePlayerWinsDisplay() {
    const xList = document.getElementById('playerXWins');
    const oList = document.getElementById('playerOWins');
    xList.innerHTML = this.playerWins.X.map(t => `<li>Win at ${t}</li>`).join('');
    oList.innerHTML = this.playerWins.O.map(t => `<li>Win at ${t}</li>`).join('');
  }

  newGame() {
    this.board = ['', '', '', '', '', '', '', '', ''];
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.moveHistory = [];
    this.gameStartTime = Date.now();
    
    // Clear board display
    Array.from(this.boardElement.children).forEach(cell => {
      cell.textContent = '';
      cell.className = 'board-cell';
    });
    
    this.updatePlayerDisplay();
    this.playSound('newGame');
    this.showToast('New game started!', 'info');
    this.updatePlayerWinsDisplay();
    this.updatePlayerScores();
    console.log('newGame: scores', JSON.stringify(this.scores));
  }

  resetGame() {
    this.scores = { X: 0, O: 0, draw: 0 };
    this.gameHistoryData = [];
    this.moveHistory = [];
    this.playerWins = { X: [], O: [] };
    this.updateStatistics();
    this.updateHistoryDisplay();
    this.updatePlayerWinsDisplay();
    this.updatePlayerScores();
    this.saveToLocalStorage();
    this.playSound('reset');
    this.showToast('Game statistics reset!', 'warning');
  }

  undoMove() {
    if (this.moveHistory.length > 0 && this.gameActive) {
      const lastMove = this.moveHistory.pop();
      this.board[lastMove.cell] = '';
      
      const cell = this.boardElement.children[lastMove.cell];
      cell.textContent = '';
      cell.className = 'board-cell';
      
      this.currentPlayer = lastMove.player;
      this.updatePlayerDisplay();
      
      this.playSound('undo');
      this.showToast('Move undone!', 'info');
    }
  }

  saveGame() {
    const gameState = {
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameMode: this.gameMode,
      scores: this.scores,
      timestamp: new Date().toISOString()
    };
    
    const savedGames = JSON.parse(localStorage.getItem('tictactoeSavedGames') || '[]');
    savedGames.push(gameState);
    localStorage.setItem('tictactoeSavedGames', JSON.stringify(savedGames));
    
    this.showToast('Game saved successfully!', 'success');
  }

  switchMode(mode) {
    this.gameMode = mode;
    
    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-mode="${mode}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    // Update subtitle
    const modeNames = {
      ai: 'AI Mode',
      player: '2 Players',
      tournament: 'Tournament Mode',
      puzzle: 'Puzzle Mode'
    };
    this.gameSubtitle.textContent = `${modeNames[mode] || mode} - ${this.aiDifficulty} Difficulty`;
    
    this.newGame();
    this.showToast(`Switched to ${modeNames[mode] || mode}`, 'info');
  }

  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    const icon = this.darkModeToggle.querySelector('.icon i');
    const text = this.darkModeToggle.querySelector('.toggle-text');
    
    if (isDark) {
      icon.className = 'fas fa-sun';
      text.textContent = 'Light Mode';
    } else {
      icon.className = 'fas fa-moon';
      text.textContent = 'Dark Mode';
    }
    
    this.showToast(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'success');
  }

  cycleTheme() {
    this.currentTheme = (this.currentTheme + 1) % this.themes.length;
    const theme = this.themes[this.currentTheme];
    
    // Remove all theme classes
    document.body.classList.remove('theme-default', 'theme-ocean', 'theme-sunset', 'theme-forest', 'theme-midnight');
    // Add current theme class
    document.body.classList.add(`theme-${theme}`);
    
    this.showToast(`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`, 'success');
  }

  openSettings() {
    this.settingsModal.classList.remove('hidden');
    setTimeout(() => this.settingsModal.classList.add('show'), 10);
  }

  closeSettingsModal() {
    this.settingsModal.classList.remove('show');
    setTimeout(() => this.settingsModal.classList.add('hidden'), 300);
  }

  updateSettings() {
    this.settings.aiDifficulty = this.aiDifficulty.value;
    this.settings.playerXSymbol = this.playerXSymbol.value;
    this.settings.soundEffects = this.soundEffects.checked;
    this.settings.animations = this.animations.checked;
    this.settings.autoSave = this.autoSave.checked;
    
    this.saveSettings();
    this.gameSubtitle.textContent = `${this.gameMode === 'ai' ? 'AI Mode' : '2 Players'} - ${this.aiDifficulty.value} Difficulty`;
    this.showToast('Settings updated', 'success');
  }

  handleKeyboard(e) {
    if (e.ctrlKey && e.code === 'KeyN') {
      e.preventDefault();
      this.newGame();
      return;
    }
    if (e.ctrlKey && e.code === 'KeyR') {
      e.preventDefault();
      this.resetGame();
      return;
    }
    if (e.ctrlKey && e.code === 'KeyZ') {
      e.preventDefault();
      this.undoMove();
      return;
    }
    if (e.code === 'Escape') {
      this.closeSettingsModal();
      return;
    }
  }

  playSound(type) {
    if (!this.settings.soundEffects) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const frequencies = {
        move: 800,
        win: 1000,
        draw: 600,
        newGame: 1200,
        reset: 400,
        undo: 500
      };
      
      oscillator.frequency.setValueAtTime(frequencies[type] || 500, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio not supported in this browser');
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${this.getToastIcon(type)}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  getToastIcon(type) {
    const icons = {
      success: 'check-circle',
      warning: 'exclamation-triangle',
      error: 'times-circle',
      info: 'info-circle'
    };
    return icons[type] || 'info-circle';
  }

  addToHistory(winner) {
    const gameRecord = {
      winner: winner,
      timestamp: new Date().toLocaleTimeString(),
      duration: this.gameEndTime - this.gameStartTime,
      mode: this.gameMode
    };
    this.gameHistoryData.unshift(gameRecord);
    if (this.gameHistoryData.length > 10) {
      this.gameHistoryData.pop();
    }
    this.updateHistoryDisplay();
  }

  updateHistoryDisplay() {
    if (!this.gameHistory) return;
    this.gameHistory.innerHTML = '';
    this.gameHistoryData.forEach(record => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      const result = record.winner === 'draw' ? 'Draw' : `Player ${record.winner} Won`;
      const duration = Math.round(record.duration / 1000);
      historyItem.innerHTML = `
        <div class="history-result">${result}</div>
        <div class="history-time">${duration}s</div>
      `;
      this.gameHistory.appendChild(historyItem);
    });
  }

  clearHistory() {
    this.gameHistoryData = [];
    this.updateHistoryDisplay();
    this.showToast('Game history cleared', 'info');
  }

  updateStatistics() {
    const totalGames = this.scores.X + this.scores.O + this.scores.draw;
    const winRate = totalGames > 0 ? Math.round((this.scores.X / totalGames) * 100) : 0;
    
    this.scoreX.textContent = this.scores.X;
    this.scoreO.textContent = this.scores.O;
    this.totalGames.textContent = totalGames;
    this.winRate.textContent = `${winRate}%`;
    
    // Calculate average time (placeholder)
    this.avgTime.textContent = '45s';
    
    // Calculate win streak (placeholder)
    this.streak.textContent = '3';
  }

  updateDisplay() {
    this.updatePlayerDisplay();
    this.updateStatistics();
    this.updateHistoryDisplay();
  }

  saveToLocalStorage() {
    const data = {
      scores: this.scores,
      gameHistory: this.gameHistoryData,
      settings: this.settings,
      gameMode: this.gameMode,
      playerWins: this.playerWins
    };
    localStorage.setItem('tictactoeData', JSON.stringify(data));
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('tictactoeData');
      if (saved) {
        const data = JSON.parse(saved);
        this.scores = data.scores || { X: 0, O: 0, draw: 0 };
        this.gameHistoryData = data.gameHistory || [];
        this.settings = { ...this.settings, ...data.settings };
        this.gameMode = data.gameMode || 'ai';
        this.playerWins = data.playerWins || { X: [], O: [] };
        if (this.aiDifficulty) this.aiDifficulty.value = this.settings.aiDifficulty || 'medium';
        if (this.playerXSymbol) this.playerXSymbol.value = this.settings.playerXSymbol || 'X';
        if (this.soundEffects) this.soundEffects.checked = this.settings.soundEffects;
        if (this.animations) this.animations.checked = this.settings.animations;
        if (this.autoSave) this.autoSave.checked = this.settings.autoSave;
        this.switchMode(this.gameMode);
        this.updatePlayerScores();
        this.updatePlayerWinsDisplay();
        this.updateHistoryDisplay();
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('tictactoeSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new ProfessionalTicTacToe();
}); 