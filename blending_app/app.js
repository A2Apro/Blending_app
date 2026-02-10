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

// 3. UI Hooks
const scoreDisp = document.getElementById('score');
const tierDisp = document.getElementById('tier-level');
const cards = [document.getElementById('card-1'), document.getElementById('card-2'), document.getElementById('card-3'), document.getElementById('card-4')];
const letters = [document.getElementById('letter-1'), document.getElementById('letter-2'), document.getElementById('letter-3'), document.getElementById('letter-4')];
const slider = document.getElementById('blend-slider');
const typeInput = document.getElementById('type-input');

// --- IMPROVED AUDIO ENGINE ---
function speak(txt, type = "normal") {
    window.speechSynthesis.cancel(); // Clear any "piled up" voices
    
    const msg = new SpeechSynthesisUtterance(txt);
    
    if (type === "slow") {
        // For sounding out individual letters
        msg.rate = 0.35; // Very slow
        msg.pitch = 1.3; // Higher, clearer pitch
    } else if (type === "blend") {
        // For the "Success" sound-out
        // We add spaces between letters to force the AI to pause
        msg.text = txt.split("").join(" . . . "); 
        msg.rate = 0.4;
    } else {
        // For hearing the full word normally
        msg.rate = 0.65; // Still slightly slow for clarity
        msg.pitch = 1.1;
    }
    
    window.speechSynthesis.speak(msg);
}

// 4. Button Connections
document.getElementById('hear-word').onclick = () => {
    speak(gameState.currentWord, "normal");
};

document.getElementById('hear-letter').onclick = () => {
    const activeCard = document.querySelector('.letter-card.active span');
    if (activeCard) {
        // Speak the letter name/sound clearly and slowly
        speak(activeCard.innerText, "slow"); 
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
    highlight(0); 
}

function highlight(idx) {
    cards.forEach((c, i) => {
        if (i === idx) c.classList.add('active');
        else c.classList.remove('active');
    });
}

function setChallenge() {
    const modes = ["SLIDE", "TYPE", "SPEAK"];
    gameState.currentMode = modes[Math.floor(Math.random() * modes.length)];
    document.querySelectorAll('.mode-area').forEach(m => m.style.display = 'none');
    
    if (gameState.currentMode === "SLIDE") {
        document.getElementById('slide-section').style.display = 'block';
        slider.value = 0;
    } else if (gameState.currentMode === "TYPE") {
        document.getElementById('type-section').style.display = 'block';
        if(typeInput) { typeInput.value = ""; typeInput.focus(); }
    } else {
        document.getElementById('speak-section').style.display = 'block';
    }
}

function win() {
    // First, sound it out slowly: "A . . . T"
    speak(gameState.currentWord, "blend");
    
    // Then, after a short pause, say the whole word: "AT!"
    setTimeout(() => {
        speak(gameState.currentWord, "normal");
    }, 2000);

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
    }, 4000); // Wait longer so they can hear the full audio sequence
}

function nextWord() {
    let list = gameState.tier === 1 ? tier1Words : (gameState.tier === 2 ? tier2Words : tier3Words);
    let nw;
    do { nw = list[Math.floor(Math.random() * list.length)]; } while (nw === gameState.lastWord);
    gameState.lastWord = gameState.currentWord;
    gameState.currentWord = nw;
}

// 5. Interaction Listeners
slider.oninput = (e) => {
    const v = e.target.value;
    const wordLength = gameState.currentWord.length;
    let activeIdx = Math.floor((v / 101) * wordLength);
    highlight(activeIdx);
    
    // Optional: Sound out letter as the slider hits it
    // if (v % 33 === 0) speak(gameState.currentWord[activeIdx], "slow");

    if (v == 100) win();
};

if(typeInput) {
    typeInput.oninput = (e) => {
        if (e.target.value.toUpperCase() === gameState.currentWord) win();
    };
}

const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
const micBtn = document.getElementById('speak-word');
if(micBtn) { micBtn.onclick = () => rec.start(); }

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

load();