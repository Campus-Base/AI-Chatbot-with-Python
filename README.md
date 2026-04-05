# AI Chatbot with Python 🤖

A fully functional conversational AI chatbot built with Python, Flask, and the OpenAI GPT API. This application features a clean, responsive web interface, maintains conversation context memory, and streams responses in real-time using Server-Sent Events (SSE).

## ✨ Features

* **Natural Language Understanding:** Powered by the OpenAI API (GPT-3.5-turbo/GPT-4).
* **Contextual Memory:** Retains the last 10 messages of the conversation for intelligent, context-aware follow-ups.
* **Real-time Streaming:** Uses Server-Sent Events (SSE) to create a real-time typing effect, streaming responses back to the UI as they generate.
* **Rich Text Formatting:** Renders Markdown (code blocks, bold text, lists) natively in chat responses.
* **Security & Stability:** Built-in rate limiting and error handling to prevent API abuse.
* **Responsive UI:** Clean, modern web interface that works on desktop and mobile.

## 🛠️ Tech Stack

* **Backend:** Python 3.11
* **Web Framework:** Flask
* **AI/NLP Engine:** OpenAI API
* **Frontend:** HTML5, CSS3, Vanilla JavaScript, Marked.js (for Markdown)
* **WSGI Server:** Gunicorn
* **Rate Limiting:** Flask-Limiter

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* Python 3.11 or higher
* An active OpenAI API Key

### Installation

1. **Clone the repository or create the project directory:**
   ```bash
   mkdir ai-chatbot
   cd ai-chatbot

2. **Create and activate a virtual environment:**
   '''bash
    python -m venv venv
    # On macOS/Linux:
    source venv/bin/activate
    # On Windows:
    venv\Scripts\activate

3. **Install the required dependencies:**
   Create a requirements.txt file and run:

4. **Set up Environment Variables:**
  Create a .env file in the root directory and add your credentials:

5. **Local Development**
  To run the app in development mode using Flask's built-in server:
    '''bash
    python app.py
