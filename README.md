# 🔍 Serper AI Search Assistant

An AI-powered search assistant that combines **real-time web search** with **LLM-based summarization** to deliver concise, human-friendly answers to your queries — complete with source links.

## ✨ Features

- **Web Search via Serper API** — fetches the top Google results for any query
- **LLM-Powered Answers via Ollama** — summarizes search results into natural, conversational responses
- **Smart Query Rewriting** — automatically expands a single question into multiple sub-queries for richer context
- **LRU Response Cache** — caches up to 100 recent answers for instant repeat lookups
- **Markdown Rendering** — assistant responses are rendered with full Markdown & GFM support
- **Modern Chat UI** — clean React interface with typing indicators, auto-scroll, and an empty-state landing

## 🏗️ Architecture

```
┌──────────────┐        POST /query        ┌──────────────┐
│   Frontend   │  ──────────────────────▶  │   Backend    │
│  (React +    │  ◀──────────────────────  │  (Express)   │
│   Vite)      │       JSON response       │              │
└──────────────┘                           └──────┬───────┘
                                                  │
                                    ┌─────────────┼─────────────┐
                                    ▼             ▼             ▼
                              ┌──────────┐ ┌──────────┐ ┌────────────┐
                              │  Serper  │ │  Ollama  │ │ LRU Cache  │
                              │  API     │ │  LLM     │ │ (in-mem)   │
                              └──────────┘ └──────────┘ └────────────┘
```

## 📂 Project Structure

```
serper/
├── Backend/
│   ├── server.js       # Express API — search, LLM, caching, query endpoint
│   ├── helper.js       # Query rewriting via Ollama
│   ├── .env            # API keys & config (SERPER_API_KEY, OLLAMA_URL, MODEL)
│   └── package.json
├── Frontend/
│   ├── src/
│   │   ├── App.jsx             # Main chat application
│   │   ├── App.css             # Styling
│   │   ├── components/
│   │   │   ├── Header.jsx          # App header / branding
│   │   │   ├── ChatInput.jsx       # Query input bar
│   │   │   ├── ChatMessage.jsx     # Message bubble (user & assistant)
│   │   │   ├── TypingIndicator.jsx # Loading animation
│   │   │   └── EmptyState.jsx      # Landing state when no messages
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── .env            # Frontend config (BACKEND_URL)
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

| Tool               | Purpose                                                  |
| ------------------ | -------------------------------------------------------- |
| **Node.js** (v18+) | Runtime for both frontend & backend                      |
| **npm**            | Package manager                                          |
| **Ollama**         | Local LLM inference ([ollama.com](https://ollama.com))   |
| **Serper API Key** | Google search results ([serper.dev](https://serper.dev)) |

### 1. Clone the Repository

```bash
git clone <repo-url>
cd serper
```

### 2. Set Up the Backend

```bash
cd Backend
npm install
```

Create / edit the `.env` file:

```env
SERPER_API_KEY=your_serper_api_key
OLLAMA_URL=http://localhost:11434
MODEL=your_model_name
```

Start the server:

```bash
node server.js
```

The backend will start on **http://localhost:8007**.

### 3. Set Up the Frontend

```bash
cd Frontend
npm install
```

Start the dev server:

```bash
npm run dev
```

The frontend will start on **http://localhost:5173** (default Vite port).

### 4. Start Ollama

Make sure Ollama is running and the model specified in `Backend/.env` is available:

```bash
ollama serve
ollama pull <model_name>
```

## 🔧 API Reference

### `POST /query`

Send a search query and receive an AI-summarized answer.

**Request Body:**

```json
{
  "query": "What is the latest iPhone price?"
}
```

**Response:**

```json
{
  "response": "The latest iPhone 16 starts at $799 for the base model..."
}
```

**Error Codes:**

| Status | Reason                                              |
| ------ | --------------------------------------------------- |
| `400`  | Missing or invalid query / query exceeds 2000 chars |
| `500`  | Internal server error (search or LLM failure)       |

## 🛠️ Tech Stack

| Layer    | Technology                                   |
| -------- | -------------------------------------------- |
| Frontend | React 19, Vite 7, react-markdown, remark-gfm |
| Backend  | Express 5, Axios, dotenv                     |
| Search   | Serper API (Google Search)                   |
| LLM      | Ollama (local inference)                     |

## 📄 License

ISC
# Web-SearchBot
