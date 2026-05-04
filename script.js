const icons = ['🚀', '💻', '💡', '⚙️', '🌐', '📱', '🔒', '📊'];
let cardsArray = [];
let flippedCards = [];
let matchedPairs = 0;

let level = 1; 
let score = 0; 
let lives = 3; 
let timerInterval = null; 
let timeLeft = 60; 
let lockBoard = true; // Start locked so the user can't click during the 5s preview

const grid = document.getElementById("grid"); 
let highScore = localStorage.getItem("highScore") || 0; 
document.getElementById("highScore").innerText = highScore; 

function startGame() { 
    document.getElementById("gameOver").classList.add("hidden"); 
    document.getElementById("startBtn").classList.add("hidden");
    
    level = 1; 
    score = 0; 
    lives = 3; 
    
    startLevel();
}

function startLevel() {
    clearInterval(timerInterval);
    flippedCards = [];
    matchedPairs = 0;
    lockBoard = true; // Lock the board during the preview
    
    // Decrease time slightly as levels progress, minimum 20 seconds
    timeLeft = Math.max(60 - ((level - 1) * 5), 20); 
    document.getElementById("timer").innerText = timeLeft; 
    
    updateUI();
    generateGrid();
    
    // --- 5 SECOND PREVIEW LOGIC ---
    const allCards = document.querySelectorAll('.card');
    
    // Flip all cards immediately to show them
    allCards.forEach(card => card.classList.add('flipped'));

    // Wait 5 seconds, hide them, unlock the board, and start the timer
    setTimeout(() => {
        allCards.forEach(card => card.classList.remove('flipped'));
        lockBoard = false; 
        startTimer(); 
    }, 5000);
}

function generateGrid() {
    grid.innerHTML = ""; // Clear existing grid
    
    // Create pairs and shuffle them
    cardsArray = [...icons, ...icons];
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
    // Ignore clicks if board is locked or card is already flipped
    if (lockBoard || card.classList.contains("flipped")) return; 
    
    card.classList.add("flipped"); 
    flippedCards.push(card); 
    
    // When two cards are flipped, check for a match
    if (flippedCards.length === 2) { 
        checkMatch();
    }
}

function checkMatch() {
    lockBoard = true; // Lock the board so user can't click a 3rd card
    let [card1, card2] = flippedCards;
    
    if (card1.dataset.icon === card2.dataset.icon) {
        // It's a match!
        matchedPairs++;
        score += 10;
        updateUI();
        resetTurn();
        
        // Check if level is complete (all 8 pairs found)
        if (matchedPairs === icons.length) {
            clearInterval(timerInterval);
            level++;
            setTimeout(startLevel, 1000); // Start next level after 1 second
        }
    } else {
        // Not a match, lose a life
        lives--;
        updateUI();
        
        if (lives <= 0) {
            setTimeout(() => gameOver("Out of Lives!"), 600);
        } else {
            // Wait 1 second, then flip them back
            setTimeout(() => {
                card1.classList.remove("flipped");
                card2.classList.remove("flipped");
                resetTurn();
            }, 1000);
        }
    }
}

function resetTurn() {
    flippedCards = [];
    lockBoard = false;
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
}

function gameOver(message) { 
    clearInterval(timerInterval); 
    lockBoard = true; 
    
    document.getElementById("endMessage").innerText = message;
    document.getElementById("finalScore").innerText = score;
    document.getElementById("gameOver").classList.remove("hidden"); 

    if (score > highScore) { 
        localStorage.setItem("highScore", score); 
        document.getElementById("highScore").innerText = score; 
    }
}