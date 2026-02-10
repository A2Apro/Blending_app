const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  // 1. Check for API Key
  if (!process.env.GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "API Key missing" }) };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // --- THIS IS THE FIX ---
    // We add 'apiVersion: v1beta' so it looks in the right place for Gemini 3
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", // gemini-3-flash-preview isn't fully public in all SDKs yet, 2.0 is the current bleeding edge preview equivalent, but if you have access to 3, use that string.
      apiVersion: "v1beta" 
    });
    
    // Note: If you specifically have access to "gemini-3-flash-preview", 
    // change the model name back to that. But keeping "apiVersion: v1beta" is mandatory.

    const prompt = `
      Generate a random simple word for a child learning to read.
      Return ONLY the word in JSON format like this: { "word": "cat" }
      Do not add markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the text (remove markdown if AI adds it)
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanedText);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};