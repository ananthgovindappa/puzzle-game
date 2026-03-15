document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const soundToggle = document.getElementById('sound-toggle');
    const gameBoard = document.getElementById('game-board');
    const scoreValue = document.getElementById('score-value');
    const levelValue = document.getElementById('level-value'); // New: to display current level
    const celebrationDisplay = document.getElementById('celebration-display'); // New: for stars/fireworks
    const levelCompleteMessage = document.getElementById('level-complete-message'); // New
    const nextLevelButton = document.getElementById('next-level-button'); // New

    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let score = 0;
    let matches = 0;
    let soundEnabled = true;
    let currentLevelIndex = 0; // Start at level 0

    // Sound effects - using slightly more complex base64 for better compatibility
    const flipSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAJgBAABlYWxpbmZvcm1hdAIAAAAAEAAwAAACZGF0YQAAAAAAAAD/DgA='); // Short click
    const matchSound = new Audio('data:audio/wav;base64,UklGRlhoBQAAAEhXQVZFZm10IBAAAAABAAEARKwAAJgBAABlYWxpbmZvcm1hdAIAAAAAEAAwAAACZGF0YQAAAAAAAAAAAGQAAAAAAAAA'); // Short beep (kept previous, assuming it was the alert sound)
    const celebrationSound = new Audio('data:audio/wav;base64,UklGRoAAAABXQVZFZm10IBAAAAABAAEARKwAAJgBAABlYWxpbmZvcm1hdAIAAAAAEAAwAAACZGF0YQAAAAAAAAAAAEQAAABkAAAAAAAAAAABAAAAAAAAAAD/DgA='); // A little chime

    const allEmojis = ['🍎', '🍌', '🍒', '🍇', '🍋', '🍊', '🍓', '🥝', '🍉', '🍍', '🍑', '🌶️', '🍆', '🥦', '🥕', '🥔'];

    const levels = [
        { pairs: 2, cols: 2, rows: 2, timeLimit: 0, scoreThresholds: [200, 150, 100] }, // 4 cards, 2 pairs
        { pairs: 4, cols: 4, rows: 2, timeLimit: 0, scoreThresholds: [400, 300, 200] }, // 8 cards, 4 pairs
        { pairs: 6, cols: 4, rows: 3, timeLimit: 0, scoreThresholds: [600, 450, 300] }, // 12 cards, 6 pairs
        { pairs: 8, cols: 4, rows: 4, timeLimit: 0, scoreThresholds: [800, 600, 400] }, // 16 cards, 8 pairs
        { pairs: 10, cols: 5, rows: 4, timeLimit: 0, scoreThresholds: [1000, 750, 500] } // 20 cards, 10 pairs
    ];

    function initializeGame(level = 0) {
        currentLevelIndex = level;
        if (currentLevelIndex >= levels.length) {
            // Game completed!
            displayOverallGameEnd();
            return;
        }

        const currentLevel = levels[currentLevelIndex];
        const selectedEmojis = allEmojis.slice(0, currentLevel.pairs);

        score = 0;
        matches = 0;
        scoreValue.textContent = score;
        levelValue.textContent = currentLevelIndex + 1;
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${currentLevel.cols}, 1fr)`;

        cards = shuffle([...selectedEmojis, ...selectedEmojis]); // Duplicate for pairs
        renderCards();
        lockBoard = false;
        firstCard = null;
        secondCard = null;

        hideCelebration();
        levelCompleteMessage.classList.add('hidden');
        nextLevelButton.classList.add('hidden');
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function renderCards() {
        cards.forEach((emoji, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.dataset.emoji = emoji;
            cardElement.dataset.index = index; // Unique index for each card

            cardElement.innerHTML = `
                <div class="front">?</div>
                <div class="back">${emoji}</div>
            `;
            cardElement.addEventListener('click', flipCard);
            gameBoard.appendChild(cardElement);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return; // Prevent double clicking the same card

        if (soundEnabled) flipSound.play();

        this.classList.add('flipped');

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

        if (isMatch) {
            disableCards();
            if (soundEnabled) matchSound.play();
        } else {
            unflipCards();
        }

        updateScore(isMatch);
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matches++;

        resetBoard();
        checkGameEnd();
    }

    function unflipCards() {
        lockBoard = true;
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function updateScore(isMatch) {
        if (isMatch) {
            score += 100;
        } else {
            score = Math.max(0, score - 20); // Deduct for incorrect match
        }
        scoreValue.textContent = score;
    }

    function checkGameEnd() {
        if (matches === levels[currentLevelIndex].pairs) {
            setTimeout(() => {
                displayLevelCompletion();
            }, 500);
        }
    }

    function displayLevelCompletion() {
        const currentLevel = levels[currentLevelIndex];
        const thresholds = currentLevel.scoreThresholds;
        let stars = 0;

        if (score >= thresholds[0]) {
            stars = 3;
        } else if (score >= thresholds[1]) {
            stars = 2;
        } else if (score >= thresholds[2]) {
            stars = 1;
        }

        if (soundEnabled) celebrationSound.play();

        levelCompleteMessage.innerHTML = `Level ${currentLevelIndex + 1} Complete! Score: ${score} <br> Stars: ${'⭐'.repeat(stars)}`;
        levelCompleteMessage.classList.remove('hidden');

        if (currentLevelIndex < levels.length - 1) {
            nextLevelButton.classList.remove('hidden');
        } else {
            // Last level completed
            displayOverallGameEnd();
        }
        showCelebration();
    }

    function displayOverallGameEnd() {
        levelCompleteMessage.innerHTML = `Congratulations, Mr.! You completed all levels! Final Score: ${score}`; // No stars for overall end
        levelCompleteMessage.classList.remove('hidden');
        nextLevelButton.classList.add('hidden'); // No next level
        showCelebration();
    }

    function showCelebration() {
        celebrationDisplay.classList.remove('hidden');
        // Simple text-based fireworks animation
        celebrationDisplay.innerHTML = '🎉🎇🎆';
        // Trigger CSS animation for fireworks (if implemented in CSS)
    }

    function hideCelebration() {
        celebrationDisplay.classList.add('hidden');
        celebrationDisplay.innerHTML = '';
    }

    function showGameScreen() {
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initializeGame(0);
    }

    function showStartScreen() {
        startScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
        hideCelebration(); // Ensure celebration is hidden when going to start screen
    }

    // Event Listeners
    startButton.addEventListener('click', showGameScreen);
    restartButton.addEventListener('click', () => initializeGame(currentLevelIndex)); // Restart current level
    nextLevelButton.addEventListener('click', () => initializeGame(currentLevelIndex + 1)); // Go to next level

    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    });

    // Initial setup
    showStartScreen();
});