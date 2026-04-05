import os
import json
from flask import Flask, render_template, request, Response, session
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", os.urandom(24))

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Rate Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per day", "20 per hour"]
)

# In-memory storage for conversation histories (keyed by IP/Session for demo purposes)
chat_histories = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
@limiter.limit("5 per minute") # Rate limit specifically for the chat endpoint
def chat():
    user_id = get_remote_address()
    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return {"error": "Message is required"}, 400

    # Initialize context memory if it doesn't exist
    if user_id not in chat_histories:
        chat_histories[user_id] = [{"role": "system", "content": "You are a helpful, intelligent assistant."}]

    history = chat_histories[user_id]
    history.append({"role": "user", "content": user_message})

    # Memory Management: Retain system prompt (index 0) + last 10 messages
    if len(history) > 11:
        chat_histories[user_id] = [history[0]] + history[-10:]
        history = chat_histories[user_id]

    def generate_response():
        try:
            # Stream the response from OpenAI
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=history,
                stream=True
            )
            
            assistant_response = ""
            for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    assistant_response += content
                    # Yield data in Server-Sent Events (SSE) format
                    yield f"data: {json.dumps({'content': content})}\n\n"
            
            # Save the full assistant response to the history once complete
            history.append({"role": "assistant", "content": assistant_response})
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(generate_response(), mimetype="text/event-stream")

if __name__ == "__main__":
    app.run(debug=True)