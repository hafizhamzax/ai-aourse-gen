// // To run this code you need to install the following dependencies:
// // npm install @google/generative-ai

// const { GoogleGenerativeAI } = require('@google/generative-ai');

// async function main() {
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

//   // User forced model
//   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

//   const prompt = 'INSERT_INPUT_HERE';

//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     console.log(response.text());
//   } catch (error) {
//     console.error(`Model gemini-2.0-flash failed:`, error.message);
//   }
// }

// main();
