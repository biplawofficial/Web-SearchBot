const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();
async function rewriteQuery(query) {
  try {
    const messages = [
      {
        role: "user",
        content: `Generate 5 search queries for "${query}".
        Return strictly JSON:
        ["query1", "query2", "query3", "query4", "query5"]`
      }
    ];

    const res = await axios.post(
      `${process.env.OLLAMA_URL}/api/chat`,
      {
        model: process.env.MODEL,
        messages,
        stream: false
      },
      {
        timeout: 10000 // 10s timeout
      }
    );

    console.log("[LLM] Response received");

    let queries = [];
    try{
        queries = JSON.parse(res.data.message.content);
    } catch(e) {
        queries = res.data.message.content.split("\n");
    }
    console.log("[LLM] Parsed queries:", queries);
    return queries;
  } catch (e) {
    console.error("[LLM ERROR]", e.message);
    return [query]; // always return array
  }
}
rewriteQuery("Price comparision of iphone 11 on amazon and flipkart")