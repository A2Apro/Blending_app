// 1. Word Banks
const tier1Words = ["AT", "AM", "IN", "UP", "IT", "ON", "AN", "ED"];
const tier2Words = ["CAT", "DOG", "PIG", "SUN", "BOX", "MAP", "BAT", "NET", "TOP", "FIN"];
const tier3Words = ["FROG", "STOP", "BLUE", "SWIM", "HAND", "JUMP", "DRUM", "GIFT", "FAST"];

// 2. Initial State
let gameState = {
    points: 0,
    tier: 1,
    currentWord: "AT",
    lastWord: "",
    currentMode: "SLIDE" 
};

// 3. Elements - Matching your new HTML IDs
const scoreDisp = document.getElementById('score');
const tierDisp = document.getElementById('tier-level');
const cards = [document.getElementById('card-1'), document.getElementById('card-2'), document.getElementById('card-3'), document.getElementById('card-4')];
const letters = [document.getElementById('letter-1'), document.getElementById('letter-2'), document.getElementById('letter-3'), document.getElementById('letter-4')];
const slider = document.getElementById('blend-slider');
const typeInput = document.getElementById('type-input');

// --- AUDIO ENGINE ---
function speak(txt, slow = false) {
    // Stop any current speech before starting new speech
    window.speechSynthesis.cancel();
    
    const msg = new SpeechSynthesisUtterance(txt);
    msg.rate = slow ? 0.5 : 0.8; // Slower for "Hear Letter"
    msg.pitch = 1.2; // Friendly kid-pitch
    window.speechSynthesis.speak(msg);
}

// 4. Button Connections
document.getElementById('hear-word').onclick = () => {
    speak(gameState.currentWord);
};

document.getElementById('hear-letter').onclick = () => {
    // Find which letter card is currently highlighted (active)
    const activeCard = document.querySelector('.letter-card.active span');
    if (activeCard) {
        speak(activeCard.innerText, true); // Speak only that letter
    } else {
        // Fallback: Speak the first letter if none are active
        speak(gameState.currentWord[0], true);
    }
};

// --- GAME LOGIC ---
function load() {
    const saved = localStorage.getItem('blendingAppSave');
    if (saved) {
        gameState = JSON.parse(saved);
    }
    update();
    setChallenge();
}

function update() {
    scoreDisp.innerText = gameState.points;
    tierDisp.innerText = gameState.tier;
    const chars = gameState.currentWord.split("");
    
    cards.forEach((c, i) => {
        if (chars[i]) {
            c.style.display = 'flex';
            letters[i].innerText = chars[i];
        } else {
            c.style.display = 'none';
        }
    });
    highlight(0); // Start with the first card highlighted
}

function highlight(idx) {
    cards.forEach((c, i) => {
        if (i === idx) c.classList.add('active');
        else c.classList.remove('active');
    });
}

function setChallenge() {
    // Randomly pick a mode
    const modes = ["SLIDE", "TYPE", "SPEAK"];
    gameState.currentMode = modes[Math.floor(Math.random() * modes.length)];
    
    // Hide all areas
    document.querySelectorAll('.mode-area').forEach(m => m.style.display = 'none');
    
    if (gameState.currentMode === "SLIDE") {
        document.getElementById('slide-section').style.display = 'block';
        slider.value = 0;
    } else if (gameState.currentMode === "TYPE") {
        document.getElementById('type-section').style.display = 'block';
        if(typeInput) {
            typeInput.value = "";
            typeInput.focus();
        }
    } else {
        document.getElementById('speak-section').style.display = 'block';
    }
}

function win() {
    speak(gameState.currentWord); // Celebrate with the full word audio
    gameState.points += 10;
    
    if (gameState.points >= 50 && gameState.tier === 1) {
        gameState.tier = 2;
        alert("🎉 Amazing! You reached Tier 2!");
    } else if (gameState.points >= 150 && gameState.tier === 2) {
        gameState.tier = 3;
        alert("🌟 Super Star! You reached Tier 3!");
    }

    setTimeout(() => {
        nextWord();
        setChallenge();
        save();
    }, 1200);
}

function nextWord() {
    let list = gameState.tier === 1 ? tier1Words : (gameState.tier === 2 ? tier2Words : tier3Words);
    let nw;
    do { 
        nw = list[Math.floor(Math.random() * list.length)]; 
    } while (nw === gameState.lastWord);
    
    gameState.lastWord = gameState.currentWord;
    gameState.currentWord = nw;
}

// 5. Interaction Listeners
slider.oninput = (e) => {
    const v = e.target.value;
    const wordLength = gameState.currentWord.length;
    
    // Calculate which card should be active based on slider
    let activeIdx = Math.floor((v / 101) * wordLength);
    highlight(activeIdx);
    
    if (v == 100) win();
};

if(typeInput) {
    typeInput.oninput = (e) => {
        if (e.target.value.toUpperCase() === gameState.currentWord) win();
    };
}

// Voice Recognition
const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
const micBtn = document.getElementById('speak-word');
if(micBtn) {
    micBtn.onclick = () => rec.start();
}
rec.onresult = (e) => {
    const speech = e.results[0][0].transcript.toUpperCase();
    if (speech.includes(gameState.currentWord)) win();
};

document.getElementById('reset-tier-button').onclick = () => {
    if (confirm("Restart this tier?")) {
        gameState.points = gameState.tier === 1 ? 0 : (gameState.tier === 2 ? 50 : 150);
        nextWord();
        setChallenge();
        save();
    }
};

function save() {
    localStorage.setItem('blendingAppSave', JSON.stringify(gameState));
    update();
}

// Initialize the game
load();