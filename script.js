document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const soundToggle = document.getElementById('sound-toggle');
    const gameBoard = document.getElementById('game-board');
    const scoreValue = document.getElementById('score-value');

    let cards = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let score = 0;
    let matches = 0;
    let soundEnabled = true;

    // Sound effects (simple placeholders)
    const matchSound = new Audio('data:audio/wav;base64,UklGRlhoBQAAAEhXQVZFZm10IBAAAAABAAEARKwAAJgBAABlYWxpbmZvcm1hdAIAAAAAEAAwAAACZGF0YQAAAAAAAAAAAGQAAAAAAAAA'); // Short beep
    const flipSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAJgBAABlYWxpbmZvcm1hdAIAAAAAEAAwAAACZGF0YQAAAAAAAAAA'); // Even shorter click

    const emojis = ['🍎', '🍌', '🍒', '🍇', '🍋', '🍊', '🍓', '🥝'];

    function initializeGame() {
        score = 0;
        matches = 0;
        scoreValue.textContent = score;
        gameBoard.innerHTML = '';
        cards = shuffle([...emojis, ...emojis]); // Duplicate for pairs
        renderCards();
        lockBoard = false;
        firstCard = null;
        secondCard = null;
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
        if (matches === emojis.length) {
            setTimeout(() => {
                alert(`Congratulations, Mr.! You matched all the pairs! Final Score: ${score}`);
                showStartScreen();
            }, 500);
        }
    }

    function showGameScreen() {
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initializeGame();
    }

    function showStartScreen() {
        startScreen.classList.remove('hidden');
        gameScreen.classList.add('hidden');
    }

    // Event Listeners
    startButton.addEventListener('click', showGameScreen);
    restartButton.addEventListener('click', initializeGame);
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    });

    // Initial setup
    showStartScreen();
});