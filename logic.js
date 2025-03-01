// will show game stats
let hasFlippedCard = false;
let lockBoard = true;
let firstCard, secondCard;
let moves = 0;
let pairs = 0;
let timerInterval;
let seconds = 0;
let isGameStarted = false;

const gameContainer = document.querySelector('.memory-game');
const movesDisplay = document.getElementById('moves');
const pairsDisplay = document.getElementById('pairs');
const timeDisplay = document.getElementById('time');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const winModal = document.getElementById('win-modal');
const finalTimeDisplay = document.getElementById('final-time');
const finalMovesDisplay = document.getElementById('final-moves');
const playAgainBtn = document.getElementById('play-again-btn');

// emojis used for displaying on cards (more can be added to make the game more interesting/challenging/tough)
const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

// will initialize game
function initGame() {
    const duplicatedEmojis = [...emojis, ...emojis];
    
    // clear the board
    gameContainer.innerHTML = '';
    
    // shuffle the emojis
    const shuffledEmojis = shuffleArray(duplicatedEmojis);
    
    // create cards
    shuffledEmojis.forEach((emoji, index) => {
        const card = createCard(emoji, index);
        gameContainer.appendChild(card);
    });
    
    // reset game state
    resetGameState();
}

// create a card element
function createCard(emoji, index) {
    const card = document.createElement('div');
    card.classList.add('memory-card');
    card.dataset.emoji = emoji;
    
    const frontFace = document.createElement('div');
    frontFace.classList.add('front-face');
    frontFace.textContent = emoji;
    
    const backFace = document.createElement('div');
    backFace.classList.add('back-face');
    backFace.textContent = '?';
    
    card.appendChild(frontFace);
    card.appendChild(backFace);
    
    card.addEventListener('click', flipCard);
    
    return card;
}

// shuffle array (FY algo)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    
    this.classList.add('flip');
    
    if (!hasFlippedCard) {
        // First card flipped
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    
    // Second card flipped
    secondCard = this;
    checkForMatch();
    
    // increment moves
    moves++;
    movesDisplay.textContent = moves;
}

// check if cards match
function checkForMatch() {
    if (!firstCard || !secondCard) return;
    
    const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
    
    if (isMatch) {
        disableCards();
        pairs++;
        pairsDisplay.textContent = pairs;
        
        // matched class is now added in disableCards function
        if (pairs === emojis.length) {
            endGame();
        }
    } else {
        unflipCards();
    }
}

// Disable matched cards
function disableCards() {
    if (firstCard && secondCard) {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        
        // store references to matched cards locally before resetting board
        const card1 = firstCard;
        const card2 = secondCard;
        
        // add matched class
        card1.classList.add('matched');
        card2.classList.add('matched');
        
        resetBoard();
    }
}

// unflip non-matching cards
function unflipCards() {
    lockBoard = true;
    
    // store references to cards locally before timeout
    const card1 = firstCard;
    const card2 = secondCard;
    
    setTimeout(() => {
        // check if cards still exist in DOM before manipulating
        if (card1 && card2) {
            card1.classList.remove('flip');
            card2.classList.remove('flip');
        }
        
        resetBoard();
    }, 1000);
}

// reset board after each turn
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// reset game state
function resetGameState() {
    moves = 0;
    pairs = 0;
    seconds = 0;
    isGameStarted = false;
    lockBoard = true;
    
    movesDisplay.textContent = moves;
    pairsDisplay.textContent = pairs;
    timeDisplay.textContent = '00:00';
    
    clearInterval(timerInterval);
    
    const cards = document.querySelectorAll('.memory-card');
    cards.forEach(card => {
        card.classList.remove('flip', 'matched');
        card.addEventListener('click', flipCard);
    });
}

// game starts here
function startGame() {
    if (isGameStarted) return;
    
    isGameStarted = true;
    lockBoard = false;
    
    // Start timer
    timerInterval = setInterval(updateTimer, 1000);
    
    startBtn.textContent = 'Game Started';
    startBtn.disabled = true;
}

// update timer
function updateTimer() {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// end game ;)
function endGame() {
    clearInterval(timerInterval);
    
    setTimeout(() => {
        finalTimeDisplay.textContent = timeDisplay.textContent;
        finalMovesDisplay.textContent = moves;
        
        const minTime = localStorage.getItem('minTime');
        const minTimeElement = document.createElement('p');
        
        if (minTime === null || seconds < parseInt(minTime)) {
            localStorage.setItem('minTime', seconds);
            minTimeElement.textContent = "You are the fastest to solve this till now!";
        } else {
            minTimeElement.textContent = `Previous fastest time: ${formatTime(parseInt(minTime))}`;
        }
        
        // Clear previous message if any
        const previousMessage = winModal.querySelector('.modal-content p.message');
        if (previousMessage) {
            previousMessage.remove();
        }
        
        minTimeElement.classList.add('message');
        winModal.querySelector('.modal-content').appendChild(minTimeElement);
        winModal.style.display = 'flex';
    }, 500);
}

// format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// event listeners here
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', () => {
    initGame();
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
});
playAgainBtn.addEventListener('click', () => {
    winModal.style.display = 'none';
    initGame();
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
});

// Initialize the game when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initGame();
});