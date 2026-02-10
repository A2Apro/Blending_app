// 1. Word Banks
const tier1Words = ["AT", "AM", "IN", "UP", "IT", "ON", "AN", "ED"];
const tier2Words = ["CAT", "DOG", "PIG", "SUN", "BOX", "MAP", "BAT", "NET", "TOP", "FIN"];
const tier3Words = ["FROG", "STOP", "BLUE", "SWIM", "HAND", "JUMP", "DRUM", "GIFT", "FAST"];

// 2. Initial Game State
let gameState = {
    points: 0,
    tier: 1,
    currentWord: "AT",
    lastWord: "",
    currentMode: "SLIDE" 
};

// 3. Connect to UI Hooks
const scoreDisplay = document.getElementById('score');
const tierDisplay = document.getElementById('tier-level');
const cards = [document.getElementById('card-1'), document.getElementById('card-2'), document.getElementById('card-3'), document.getElementById('card-4')];
const letterEls = [document.getElementById('letter-1'), document.getElementById('letter-2'), document.getElementById('letter-3'), document.getElementById('letter-4')];
const slider = document.getElementById('blend-slider');
const typeInput = document.getElementById('type-input');
const resetTierButton = document.getElementById('reset-tier-button');

// --- AUDIO ENGINE ---
function speak(text, isSlow = false) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.rate = isSlow ? 0.5 : 0.7; // Slower rate for sounding out letters
    msg.pitch = 1.2; // Slightly higher pitch to sound friendlier for kids
    window.speechSynthesis.speak(msg);
}

// Sound out individual letters
document.getElementById('hear-letter').onclick = () => {
    const activeCard = document.querySelector('.letter-card.active span');
    if (activeCard) {
        speak(activeCard.innerText, true);
    }
};

// Hear the full word
document.getElementById('hear-word').onclick = () => speak(gameState.currentWord);

// --- GAME LOGIC ---
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
    const chars = gameState.currentWord.split("");
    
    cards.forEach((c, i) => {
        if (chars[i]) {
            c.style.display = 'flex';
            letterEls[i].innerText = chars[i];
        } else {
            c.style.display = 'none';
        }
    });
    activateCard(0); // Start with the first letter highlighted
}

function activateCard(index) {
    cards.forEach((c, i) => {
        if (i === index) {
            c.classList.add('active');
            // Optional: Uncomment below to auto-speak the letter when it highlights
            // speak(letterEls[i].innerText, true); 
        } else {
            c.classList.remove('active');
        }
    });
}

function setNextChallenge() {
    const modes = ["SLIDE", "TYPE", "SPEAK"];
    gameState.currentMode = modes[Math.floor(Math.random() * modes.length)];
    document.querySelectorAll('.mode-area').forEach(el => el.style.display = 'none');
    
    if (gameState.currentMode === "SLIDE") {
        document.getElementById('slide-section').style.display = 'block';
        slider.value = 0;
    } else if (gameState.currentMode === "TYPE") {
        document.getElementById('type-section').style.display = 'block';
        typeInput.value = "";
        typeInput.focus();
    } else {
        document.getElementById('speak-section').style.display = 'block';
    }
}

function winWord() {
    speak(gameState.currentWord); // Victory audio: The full word
    gameState.points += 10;
    
    // Level Up Logic
    if (gameState.points >= 50 && gameState.tier === 1) {
        gameState.tier = 2;
        alert("🎉 AMAZING! You unlocked Tier 2: 3-Letter Words!");
    } else if (gameState.points >= 150 && gameState.tier === 2) {
        gameState.tier = 3;
        alert("🌟 WOW! You are a Pro! Tier 3 Unlocked: 4-Letter Words!");
    }

    setTimeout(() => {
        getNewWord();