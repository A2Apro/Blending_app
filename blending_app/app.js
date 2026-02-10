// 1. Initial State
let gameState = {
    points: 0,
    tier: 1, 
    currentWord: "...", // Placeholder
    wordData: null, // Stores the AI sounds & sentence
    currentMode: "SLIDE" 
};

// 2. UI Hooks
const scoreDisp = document.getElementById('score');
const tierDisp = document.getElementById('tier-level');
const progressBar = document.getElementById('progress-bar');
const cards = [document.getElementById('card-1'), document.getElementById('card-2'), document.getElementById('card-3'), document.getElementById('card-4')];
const letters = [document.getElementById('letter-1'), document.getElementById('letter-2'), document.getElementById('letter-3'), document.getElementById('letter-4')];
const slider = document.getElementById('blend-slider');
const typeInput = document.getElementById('type-input');

// 3. Audio Engine (Uses AI Data)
function speak(txt, type = "normal") {
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(txt);
    
    if (type === "slow") {
        msg.rate = 0.8; 
        msg.pitch = 1.1;
    } else if (type === "blend") {
        // Use AI sounds if available, otherwise spell it out
        if (gameState.wordData && gameState.wordData.sounds) {
            msg.text = gameState.wordData.sounds.join(" . . ");
        } else {
            msg.text = txt.split("").join(" . . ");
        }
        msg.rate = 0.5;
    } else {
        msg.rate = 0.8;
        msg.pitch = 1.1;
    }
    window.speechSynthesis.speak(msg);
}

// 4. CALL THE WAITER (Fetch from Netlify Function)
async function getNewWord() {
    gameState.currentWord = "..."; 
    update(); // Show loading state

    try {
        // This calls the file you created in Step 2
        const response = await fetch('/.netlify/functions/fetch-word');
        const data = await response.json();
        
        if (data.word) {
            gameState.currentWord = data.word;
            gameState.wordData = data; 
            console.log("Gemini 3 Delivered:", data);
        }
    } catch (error) {
        console.error("Waiter dropped the food:", error);
        // Fallback just in case
        gameState.currentWord = "CAT";
        gameState.wordData = { sounds: ["kuh", "ah", "tuh"], sentence: "The cat nap." };
    }
    
    update();
    setChallenge();
}

// 5. Visual Logic (No changes needed, just re-pasted for completeness)
function updateVisuals(sliderValue) {
    if (gameState.currentWord === "...") return;

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
                if (!card.classList.contains('active')) {
                    card.classList.add('active');
                    // Play the specific AI sound for this letter
                    if (gameState.wordData && gameState.wordData.sounds[i]) {
                        speak(gameState.wordData.sounds[i], "slow");
                    }
                }
            } else {
                card.classList.remove('active');
            }
        }
    });
}

// 6. Win Logic
function win() {
    speak(gameState.currentWord, "blend");
    
    // Play the AI sentence after a delay!
    setTimeout(() => {
        if (gameState.wordData && gameState.wordData.sentence) {
            speak(gameState.wordData.sentence, "normal");
        }
    }, 2000);

    gameState.points += 10;
    
    // Wait 5 seconds, then ask the waiter for the next word
    setTimeout(() => {
        getNewWord(); 
    }, 5000);
}

// 7. Listeners & Init
slider.oninput = (e) => {
    updateVisuals(e.target.value);
    if (e.target.value == 100) win();
};

document.getElementById('hear-word').onclick = () => speak(gameState.currentWord, "normal");
document.getElementById('hear-letter').onclick = () => {
    const activeIndex = cards.findIndex(c => c.classList.contains('active'));
    if (activeIndex !== -1 && gameState.wordData) {
        speak(gameState.wordData.sounds[activeIndex], "slow");
    } else {
        // Default to first sound if nothing is active
        if(gameState.wordData) speak(gameState.wordData.sounds[0], "slow");
    }
};

typeInput.oninput = (e) => {
    if (e.target.value.toUpperCase() === gameState.currentWord) win();
};

function update() {
    scoreDisp.innerText = gameState.points;
    tierDisp.innerText = gameState.tier;
    
    let percentage = (gameState.points % 100); 
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
    
    if (slider.value == 0) updateVisuals(0);
}

function setChallenge() {
    const modes = ["SLIDE", "TYPE", "SPEAK"];
    gameState.currentMode = modes[Math.floor(Math.random() * modes.length)];
    document.querySelectorAll('.mode-area').forEach(m => m.style.display = 'none');
    document.getElementById('slide-section').style.display = 'block'; 
    slider.value = 0;
    if (gameState.currentMode === "TYPE") document.getElementById('type-section').style.display = 'block';
    else if (gameState.currentMode === "SPEAK") document.getElementById('speak-section').style.display = 'block';
    updateVisuals(0);
}

// Start Game by asking the waiter
getNewWord();