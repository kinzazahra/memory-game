// --- THEMES ---
const themes = {
    tech: ['🚀', '💻', '💡', '⚙️', '🌐', '📱', '🔒', '📊', '🔋', '📡', '🕹️', '💾', '🎧', '📸', '🔬', '🔭', '⌨️', '🖱️'],
    animals: ['🐶', '🐱', '🦊', '🐼', '🐸', '🦋', '🐙', '🐒', '🐢', '🐳', '🦁', '🐯', '🐰', '🐷', '🦄', '🐝', '🦉', '🦖'],
    food: ['🍔', '🍕', '🌮', '🍣', '🍩', '🥑', '🍿', '🍉', '🥨', '🍟', '🌭', '🥗', '🍦', '🍰', '☕', '🍓', '🍇', '🍒'],
    spooky: ['👻', '🦇', '🕷️', '🕸️', '🧛', '🧟', '💀', '🎃', '👽', '👁️', '🩸', '🦴', '🍬', '🦉', '🐺', '🧟‍♀️', '🧛‍♂️', '🕯️']
};

let currentDeck = [];
let cardsArray = [];
let flippedCards = [];
let matchedPairs = 0;
let currentPairsCount = 8; // Adjusts dynamically

let level = 1; 
let score = 0; 
let lives = 3; 
let moves = 0;
let timerInterval = null; 
let timeLeft = 60; 
let lockBoard = true; 

const grid = document.getElementById("grid"); 
let highScore = localStorage.getItem("highScore") || 0; 

// --- AUDIO SYNTHESIZER ---
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, type, duration, vol=0.1) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const playFlip = () => playTone(300, 'sine', 0.1, 0.05);
const playMatch = () => { playTone(400, 'sine', 0.1, 0.1); setTimeout(() => playTone(600, 'sine', 0.2, 0.1), 100); };
const playError = () => playTone(150, 'sawtooth', 0.3, 0.1);
const playWin = () => { playTone(400, 'square', 0.1, 0.1); setTimeout(() => playTone(500, 'square', 0.1, 0.1), 100); setTimeout(() => playTone(600, 'square', 0.3, 0.1), 200); };

// --- GAME LOGIC ---

function initGame() {
    initAudio(); // Browsers require a user click to start audio
    
    const themeKey = document.getElementById("themeSelect").value;
    currentDeck = themes[themeKey];

    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameOver").classList.add("hidden"); 
    
    level = 1; 
    score = 0; 
    lives = 3; 
    
    startLevel();
}

function startLevel() {
    clearInterval(timerInterval);
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    lockBoard = true; 
    
    // Time formula: Base 60s, minus 5s per level, plus extra time for bigger grids
    timeLeft = Math.max(60 - ((level - 1) * 5), 20); 
    if (level >= 3 && level <= 4) timeLeft += 15; // Extra time for 4x5
    if (level >= 5) timeLeft += 40; // Extra time for 6x6
    
    document.getElementById("timer").innerText = timeLeft; 
    
    generateGrid(); // Calculates size and builds board
    updateUI();
    
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.add('flipped'));

    // 5 Second Preview
    setTimeout(() => {
        allCards.forEach(card => card.classList.remove('flipped'));
        lockBoard = false; 
        startTimer(); 
    }, 5000);
}

function generateGrid() {
    grid.innerHTML = ""; 
    
    // Dynamic Grid Sizing
    if (level <= 2) {
        currentPairsCount = 8;
        grid.className = "grid-4x4";
    } else if (level <= 4) {
        currentPairsCount = 10;
        grid.className = "grid-4x5";
    } else {
        currentPairsCount = 18;
        grid.className = "grid-6x6";
    }

    // Slice the exact number of pairs needed from the deck
    const selectedIcons = currentDeck.slice(0, currentPairsCount);
    cardsArray = [...selectedIcons, ...selectedIcons];
    cardsArray.sort(() => 0.5 - Math.random());

    cardsArray.forEach((icon) => { 
        let card = document.createElement("div"); 
        card.classList.add("card"); 
        card.dataset.icon = icon; 
        
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">❓</div>
                <div class="card-back">${icon}</div>
            </div>
        `;
        
        card.addEventListener("click", () => flipCard(card)); 
        grid.appendChild(card); 
    });
}

function flipCard(card) { 
    if (lockBoard || card.classList.contains("flipped")) return; 
    
    playFlip();
    card.classList.add("flipped"); 
    flippedCards.push(card); 
    
    if (flippedCards.length === 2) { 
        moves++; 
        checkMatch();
    }
}

function checkMatch() {
    lockBoard = true; 
    let [card1, card2] = flippedCards;
    
    if (card1.dataset.icon === card2.dataset.icon) {
        matchedPairs++;
        score += 10;
        playMatch();
        updateUI();
        resetTurn();
        
        if (matchedPairs === currentPairsCount) {
            clearInterval(timerInterval);
            playWin();
            triggerConfetti(); 
            
            score += (timeLeft * 2) + (lives * 10);
            level++;
            setTimeout(startLevel, 2500); 
        }
    } else {
        lives--;
        playError();
        updateUI();
        
        // Shake animation
        card1.classList.add("shake");
        card2.classList.add("shake");

        if (lives <= 0) {
            setTimeout(() => gameOver("Out of Lives!"), 600);
        } else {
            setTimeout(() => {
                card1.classList.remove("shake", "flipped");
                card2.classList.remove("shake", "flipped");
                resetTurn();
            }, 1000);
        }
    }
}

function resetTurn() {
    flippedCards = [];
    lockBoard = false;
}

function calculateStars() {
    // Dynamic star calculation based on grid size
    if (moves <= currentPairsCount + 2) return "⭐⭐⭐";
    if (moves <= currentPairsCount + 6) return "⭐⭐";
    if (moves <= currentPairsCount + 10) return "⭐";
    return "💔"; 
}

function startTimer() { 
    document.getElementById("timer").innerText = timeLeft; 
    
    timerInterval = setInterval(() => { 
        timeLeft--; 
        document.getElementById("timer").innerText = timeLeft; 
        
        if (timeLeft <= 0) {   
            clearInterval(timerInterval);
            gameOver("Time's Up!"); 
        }
    }, 1000); 
}

function updateUI() { 
    document.getElementById("score").innerText = score; 
    document.getElementById("level").innerText = level; 
    document.getElementById("lives").innerText = lives; 
    document.getElementById("moves").innerText = moves;
    document.getElementById("stars").innerText = calculateStars();
}

function triggerConfetti() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6, x: 0.2 } });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6, x: 0.8 } });
}

function gameOver(message) { 
    clearInterval(timerInterval); 
    lockBoard = true; 
    
    document.getElementById("endMessage").innerText = message;
    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOver").classList.remove("hidden"); 

    if (score > highScore) { 
        highScore = score;
        localStorage.setItem("highScore", highScore); 
        triggerConfetti(); 
    }
    
    document.getElementById("highScore").innerText = highScore; 
}