// 1. Word Banks
const tier1Words = ["AT", "AM", "IN", "UP", "IT", "ON", "AN", "ED"];
const tier2Words = ["CAT", "DOG", "PIG", "SUN", "BOX", "MAP", "BAT", "NET", "TOP", "FIN"];
const tier3Words = ["FROG", "STOP", "BLUE", "SWIM", "HAND", "JUMP", "DRUM", "GIFT", "FAST"];

// 2. Initial Game State
let gameState = {
    points: 0,
    tier: 1,
    currentWord: "AT",
    lastWord: ""
};

// 3. Connect to the HTML "Hooks"
const scoreDisplay = document.getElementById('score');
const tierDisplay = document.getElementById('tier-level');
const wordDisplay = document.getElementById('word-display');
const blendButton = document.getElementById('blend-button');
const tryAgainButton = document.getElementById('try-again-button');
const resetTierButton = document.getElementById('reset-tier-button');

function loadGame() {
    const saved = localStorage.getItem('blendingAppSave');
    if (saved) {
        gameState = JSON.parse(saved);
        updateScreen();
    }
}

function updateScreen() {
    scoreDisplay.innerText = gameState.points;
    tierDisplay.innerText = gameState.tier;
    wordDisplay.innerText = gameState.currentWord;
}

// 4. Logic to pick a new word (only called on success)
function getNewWord() {
    let wordList;
    if (gameState.tier === 1) wordList = tier1Words;
    else if (gameState.tier === 2) wordList = tier2Words;
    else wordList = tier3Words;

    let nextWord;
    do {
        const randomIndex = Math.floor(Math.random() * wordList.length);
        nextWord = wordList[randomIndex];
    } while (nextWord === gameState.lastWord); 

    gameState.lastWord = gameState.currentWord;
    gameState.currentWord = nextWord;
}

function checkLevelUp() {
    if (gameState.points >= 50 && gameState.tier === 1) {
        gameState.tier = 2;
        alert("🎉 AMAZING! You unlocked Tier 2: 3-Letter Words!");
    } else if (gameState.points >= 150 && gameState.tier === 2) {
        gameState.tier = 3;
        alert("🌟 WOW! You are a Pro! Tier 3 Unlocked: 4-Letter Words!");
    }
}

// SUCCESS: Child got it right
blendButton.addEventListener('click', () => {
    gameState.points += 10;
    checkLevelUp();
    getNewWord(); // Change word
    saveAndRefresh();
});

// REPEAT: Child got it wrong
tryAgainButton.addEventListener('click', () => {
    alert("Let's try that one more time! You can do it.");
    // Notice: We do NOT call getNewWord() here, so the word stays the same.
    saveAndRefresh();
});

// REFRESH: Reset the current tier points
resetTierButton.addEventListener('click', () => {
    if (confirm("Do you want to start this tier over?")) {
        if (gameState.tier === 1) gameState.points = 0;
        if (gameState.tier === 2) gameState.points = 50;
        if (gameState.tier === 3) gameState.points = 150;
        getNewWord();
        saveAndRefresh();
    }
});

function saveAndRefresh() {
    localStorage.setItem('blendingAppSave', JSON.stringify(gameState));
    updateScreen();
}

loadGame();
updateScreen();