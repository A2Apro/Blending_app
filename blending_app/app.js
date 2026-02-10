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

// Tracks which letter index (0, 1, 2, 3) was last spoken so we don't repeat or skip
let lastIndexSpoken = -1; 

// --- PHONICS DICTIONARY ( The "Fake" AI ) ---
// This forces the browser to say sounds instead of letter names
const phonetics = {
    A: "ah", B: "buh", C: "kuh", D: "duh", E: "eh", F: "fff",
    G: "guh", H: "huh", I: "ih", J: "juh", K: "kuh", L: "lll",
    M: "mmm", N: "nnn", O: "aw", P: "puh", Q: "kwuh", R: "rrr",
    S: "sss", T: "tuh", U: "uh", V: "vvv", W: "wuh", X: "ks",
    Y: "yuh", Z: "zzz"
};

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
    // Determine what text to actually speak
    let textToSay = txt;

    // If we are doing phonics, look up the sound mapping
    if (type === "slow" && phonetics[txt]) {
        textToSay = phonetics[txt]; 
    }

    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(textToSay);
    
    if (type === "slow") {
        msg.rate = 0.8; // Faster rate for short phonetic sounds so they are snappy
        msg.pitch = 1.1;
    } else if (type === "blend") {
        msg.text = txt.split("").join(" . "); 
        msg.rate = 0.5;
    } else {
        msg.rate = 0.8;
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

    // Calculate which "Zone" the slider is in (0, 1, 2, or 3)
    // We use a slightly smaller range (95) so we don't trigger the last letter right as we win
    const totalZones = chars.length;
    const zoneSize = 98 / totalZones; 
    const currentZone = Math.floor(sliderValue / zoneSize);

    // Audio Trigger: Only speak if we entered a NEW zone and we aren't finished
    if (currentZone !== lastIndexSpoken && currentZone < totalZones && sliderValue < 98) {
        const letterToSpeak = chars[currentZone];
        if (letterToSpeak) {
            speak(letterToSpeak, "slow");
            lastIndexSpoken = currentZone;
        }
    }

    chars.forEach((char, i) => {
        const card = cards[i];
        if (card) {
            const offset = (i * cardWidth) + (i * currentSpread);
            const centering = (containerWidth - (chars.length * cardWidth + (chars.length - 1) * currentSpread)) / 2;
            card.style.left = (centering + offset) + "px";
            
            // Highlight based on the calculated Zone
            if (i === currentZone && sliderValue < 98) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        }
    });
}

// 5. Success Logic
function win() {
    lastIndexSpoken = -1; // Reset audio tracker
    speak(gameState.currentWord, "blend");
    setTimeout(() => speak(gameState.currentWord, "normal"), 1500);
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
    }, 3500);
}

// 6. Interaction Listeners
slider.oninput = (e) => {
    updateVisuals(e.target.value);
    if (e.target.value == 100) win();
};

document.getElementById('hear-word').onclick = () => speak(gameState.currentWord, "normal");
document.getElementById('hear-letter').onclick = () => {
    // Find active letter or default to first
    const activeCardIndex = cards.findIndex(c => c.classList.contains('active'));
    if (activeCardIndex !== -1) {
        speak(gameState.currentWord[activeCardIndex], "slow");
    } else {
        speak(gameState.currentWord[0], "slow");
    }
};

typeInput.oninput = (e) => {
    if (e.target.value.toUpperCase() === gameState.currentWord) win();
};

const rec = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
const micBtn = document.getElementById('speak-word');
if(micBtn) micBtn.onclick = () => rec.start();
rec.onresult = (e) => {
    if (e.results[0][0].transcript.toUpperCase().includes(gameState.currentWord)) win();
};

// 7. Core Functions
function nextWord() {
    let list;
    if (gameState.tier === 1) list = tier1Words;
    else if (gameState.tier === 2) list = tier2Words;
    else list = tier3Words;

    let nw;
    do { nw = list[Math.floor(Math.random() * list.length)]; } while (nw === gameState.lastWord);
    gameState.lastWord = gameState.currentWord;
    gameState.currentWord = nw;
    lastIndexSpoken = -1; // Reset audio
}

function setChallenge() {
    const modes = ["SLIDE", "TYPE", "SPEAK"];
    gameState.currentMode = modes[Math.floor(Math.random() * modes.length)];
    document.querySelectorAll('.mode-area').forEach(m => m.style.display = 'none');
    document.getElementById('slide-section').style.display = 'block'; 
    slider.value = 0;
    lastIndexSpoken = -1; 
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
    // Don't reset visuals to 0 here to avoid jitter during slide
    if(slider.value == 0) updateVisuals(0);
}

load();