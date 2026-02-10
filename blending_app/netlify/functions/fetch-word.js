const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
    // 1. Get the API Key from Netlify settings
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { statusCode: 500, body: "Missing API Key" };

    // 2. Connect to Google using the specific Preview model
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // 3. The Order: Ask for a word + exact phonics
    const prompt = `
    Generate a JSON object for a child learning to read.
    Target: A single 3-letter or 4-letter word (CVC or simple blend).
    
    Required JSON Format:
    {
      "word": "FROG",
      "letters": ["F", "R", "O", "G"],
      "sounds": ["fff", "rrr", "aw", "guh"], 
      "sentence": "The frog jumped on the log!"
    }
    
    IMPORTANT: The "sounds" array must match the letter count exactly. 
    Use phonetic spelling for text-to-speech (e.g., "kuh" for hard C, "ah" for short A).
    Return ONLY raw JSON. No markdown formatting.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean up markdown if Gemini adds it
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: text
        };
    } catch (error) {
        console.error("Gemini Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};