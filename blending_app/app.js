// 1. Setup the initial game data
let gameState = {
    points: 0,
    tier: 1,
    currentWord: "AT"
};

// 2. Connect the code to the "Hooks" we made in the HTML
const scoreDisplay = document.getElementById('score');
const tierDisplay = document.getElementById('tier-level');
const wordDisplay = document.getElementById('word-display');
const blendButton = document.getElementById('blend-button');

// 3. The "Load" function (Check if the child played before)
function loadGame() {
    const saved = localStorage.getItem('blendingAppSave');
    if (saved) {
        gameState = JSON.parse(saved);
        updateScreen();
    }
}

// 4. The "Update" function (Refresh the numbers on the screen)
function updateScreen() {
    scoreDisplay.innerText = gameState.points;
    tierDisplay.innerText = gameState.tier;
    wordDisplay.innerText = gameState.currentWord;
}

// 5. The "Action" (What happens when they click the button)
blendButton.addEventListener('click', () => {
    // Add 10 points for "blending" the word
    gameState.points += 10;
    
    // Save the new score to the browser
    localStorage.setItem('blendingAppSave', JSON.stringify(gameState));
    
    // Refresh the screen so they see the new score
    updateScreen();
    
    alert("Great job blending " + gameState.currentWord + "!");
});

// Run the load function immediately when the page opens
loadGame();
updateScreen();