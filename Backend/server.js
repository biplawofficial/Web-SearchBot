const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

const { rewriteQuery } = require("./helper");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MAX_CACHE_SIZE = 100;
const cache = new Map();

function cacheGet(key) {
  const normalized = key.trim().toLowerCase();
  if (!cache.has(normalized)) return undefined;
  // Move to end (most-recently used)
  const value = cache.get(normalized);
  cache.delete(normalized);
  cache.set(normalized, value);
  return value;
}

function cacheSet(key, value) {
  const normalized = key.trim().toLowerCase();
  if (cache.has(normalized)) cache.delete(normalized);
  cache.set(normalized, value);
  // Evict oldest entry if over limit
  if (cache.size > MAX_CACHE_SIZE) {
    const oldest = cache.keys().next().value;
    cache.delete(oldest);
  }
}

//SERPER
async function searchWeb(query) {
  console.log(`[SEARCH] Querying Serper API with: "${query}"`);
  const res = await axios.post(
    "https://google.serper.dev/search",
    { q: query },
    {
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  const results = res.data.organic?.slice(0, 3) || [];
  console.log(`[SEARCH] Retrieved ${results.length} results from Serper`);

  return results.map(r => ({
    title: r.title,
    snippet: r.snippet,
    link: r.link
  }));
}

//LLM (OLLAMA)
async function askLLM(query, context) {
  const messages = [
    {
      role: "system",
      content:
        "You are a query based AI assistant. Answer using the given query and context. Be concise and accurate. If unsure say so. and the most important thing answer like a real chatbot dont just paste thing as it is, you summarize data and then provide response in a humanized way okay!"
    },
    {
      role: "user",
      content: `
        Context:
        ${context}

        Question: ${query}
        Also include source links at the end.
    `
    }
  ];

  const res = await axios.post(
    `${process.env.OLLAMA_URL}/api/chat`,
    {
      model: process.env.MODEL,
      messages,
      stream: false
    }
  );
  console.log(`[LLM] Received response from Ollama`);

  return res.data.message.content;
}

function formatContext(results) {
  return results
    .map(
      r => `
Title: ${r.title}
Snippet: ${r.snippet}
Link: ${r.link}
`
    )
    .join("\n");
}

//API

app.post("/query", async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    console.log(`[API] Error: Empty or invalid query received`);
    return res.status(400).json({ error: "No query" });
  }

  if (query.length > 2000) {
    console.log(`[API] Error: Query too long (${query.length} chars)`);
    return res.status(400).json({ error: "Query too long (max 2000 chars)" });
  }

  try {
    // CACHE (fast, normalized key)
    const cached = cacheGet(query);
    if (cached) {
      console.log(`[CACHE] Hit! Returning cached response for: "${query}"`);
      return res.json({ response: cached });
    }

    // Rewrite query into sub-queries (fallback to original on failure)
    let queries;
    try {
      queries = await rewriteQuery(query);
      if (!Array.isArray(queries) || queries.length === 0) {
        queries = [query];
      }
    } catch (rewriteErr) {
      console.warn(`[REWRITE] Failed, falling back to original query: ${rewriteErr.message}`);
      queries = [query];
    }

    // Search web for each sub-query and merge results
    const searchResults = await Promise.all(
      queries.map(q => searchWeb(q))
    );
    const merged = searchResults.flat().slice(0, 5);
    const context = formatContext(merged);

    // Ask LLM once with the original query + merged context
    const answer = await askLLM(query, context);

    cacheSet(query, answer);
    res.json({ response: answer });

  } catch (err) {
    console.error(`[ERROR] ${err.message}`);
    res.status(500).json({ error: "Failed" });
  }
});



// START 
app.listen(8007, () => {
  console.log(`[SERVER] Started on http://localhost:8007`);
  console.log(`[CONFIG] SERPER_API_KEY: ${process.env.SERPER_API_KEY ? "✓ Set" : "✗ Missing"}`);
  console.log(`[CONFIG] OLLAMA_URL: ${process.env.OLLAMA_URL || "✗ Missing"}`);
  console.log(`[CONFIG] MODEL: ${process.env.MODEL || "✗ Missing"}`);
});