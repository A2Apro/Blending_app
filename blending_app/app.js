// 1. Word Banks (Confirmed Foundation)
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

let lastLetterSpoken = ""; // To prevent audio stuttering

// 3. UI Hooks
const scoreDisp = document.getElementById('score');
const tierDisp = document.getElementById('tier-level');
const progressBar = document.getElementById('progress-bar');
const cards = [document.getElementById('card-1'), document.getElementById('card-2'), document.getElementById('card-3'), document.getElementById('card-4')];
const letters = [document.getElementById('letter-1'), document.getElementById('letter-2'), document.getElementById('letter-3'), document.getElementById('letter-4')];
const slider = document.getElementById('blend-slider');
const typeInput = document.getElementById('type-input');

// --- AUDIO ENGINE ---
function speak(txt, type = "normal") {
    // If it's a letter sound-out and it's already playing, skip to avoid "piling"
    if (type === "slow" && window.speechSynthesis.speaking) return;
    
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(txt);
    if (type === "slow") {
        msg.rate = 0.35;
        msg.pitch = 1.3;
    } else if (type === "blend") {
        msg.text = txt.split("").join(" . . . "); 
        msg.rate = 0.4;
    } else {
        msg.rate = 0.65;
        msg.pitch = 1.1;
    }
    window.speechSynthesis.speak(msg);
}

// 4. Visual Stretch & Slider Audio Logic
function updateVisuals(sliderValue) {
    const chars = gameState.currentWord.split("");
    const container = document.getElementById('blender-box');
    const containerWidth = container.offsetWidth;
    const cardWidth = 75; 
    const maxSpread = containerWidth - (chars.length * cardWidth) - 40;
    const currentSpread = maxSpread * (1 - (sliderValue / 100));

    chars.forEach((char, i) => {
        const card = cards[i];
        if (card) {
            const offset = (i * cardWidth) + (i * currentSpread);
            const centering = (containerWidth - (chars.length * cardWidth + (chars.length - 1) * currentSpread)) / 2;
            card.style.left = (centering + offset) + "px";
            
            const segment = 100 / chars.length;
            if (sliderValue >= i * segment && sliderValue < (i + 1) * segment) {
                card.classList.add('active');
                
                // AUDIO TRIGGER: Speak letter if it's new
                if (lastLetterSpoken !== char && sliderValue < 95) {
                    speak(char, "slow");
                    lastLetterSpoken = char;
                }
            } else {
                card.classList.remove('active');
            }
        }
    });
}

// 5. Success Logic
function win() {
    lastLetterSpoken = ""; // Reset for next word
    speak(gameState.currentWord, "blend");
    setTimeout(() => speak(gameState.currentWord, "normal"), 2000);
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
    }, 4500);
}

// 6. Interaction Listeners
slider.oninput = (e) => {
    updateVisuals(e.target.value);
    if (e.target.value == 100) win();
};

document.getElementById('hear-word').onclick = () => speak(gameState.currentWord, "normal");
document.getElementById('hear-letter').onclick = () => {
    const activeCard = document.querySelector('.letter-card.active span');
    if (activeCard) speak(activeCard.innerText, "slow"); 
};

typeInput.oninput = (e) => {
    if (e.target.value.toUpperCase() === gameState.currentWord) win();
};

// 7. Core Functions
function nextWord() {
    let list;
    // STRICT TIER FILTER
    if (gameState.tier === 1) list = tier1Words;
    else if (gameState.tier === 2) list = tier2Words;
    else list = tier3Words;

    let nw;
    do { nw = list[Math.floor(Math.random() * list.length)]; } while (nw === gameState.lastWord);
    gameState.lastWord = gameState.currentWord;
    gameState.currentWord = nw;
}

function setChallenge() {
    const modes = ["SLIDE", "TYPE", "SPEAK"];
    gameState.currentMode = modes[Math.floor(Math.random() * modes.length)];
    document.querySelectorAll('.mode-area').forEach(m => m.style.display = 'none');
    document.getElementById('slide-section').style.display = 'block'; 
    slider.value = 0;
    lastLetterSpoken = ""; // Reset for new challenge
    if (gameState.currentMode === "TYPE") document.getElementById('type-section').style.display = 'block';
    else if (gameState.currentMode === "SPEAK") document.getElementById('speak-section').style.display = 'block';
    updateVisuals(0);
}

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

function load() {
    const saved = localStorage.getItem('blendingAppSave');
    if (saved) gameState = JSON.parse(saved);
    update();
    setChallenge();
}

function update() {
    scoreDisp.innerText = gameState.points;
    tierDisp.innerText = gameState.tier;
    
    let percentage = 0;
    if (gameState.tier === 1) percentage = (gameState.points / 50) * 100;
    else if (gameState.tier === 2) percentage = ((gameState.points - 50) / 100) * 100;
    else percentage = 100;
    
    progressBar.style.width = percentage + "%";

    const chars = gameState.currentWord.split("");
    cards.forEach((c, i) => {
        if (chars[i]) {
            c.style.display = 'flex';
            letters[i].innerText = chars[i];
        } else {
            c.style.display = 'none';
        }
    });
    updateVisuals(0);
}

load();