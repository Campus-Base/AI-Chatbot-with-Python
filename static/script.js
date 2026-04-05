const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // Parse Markdown for assistant messages, standard text for user
    if (role === 'assistant') {
        bubble.innerHTML = marked.parse(content);
    } else {
        bubble.textContent = content;
    }
    
    messageDiv.appendChild(bubble);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    return bubble; // Return so we can update it during streaming
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Show user message
    appendMessage('user', text);
    userInput.value = '';
    sendBtn.disabled = true;

    // 2. Create placeholder for assistant message
    const aiBubble = appendMessage('assistant', '...').querySelector('.bubble');
    let aiFullResponse = "";

    try {
        // 3. Make POST request & read stream
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.replace('data: ', '').trim();
                    if (dataStr === '[DONE]') break;
                    
                    try {
                        const dataObj = JSON.parse(dataStr);
                        if (dataObj.error) {
                            aiFullResponse = `Error: ${dataObj.error}`;
                        } else if (dataObj.content) {
                            aiFullResponse += dataObj.content;
                        }
                        // Update UI with parsed Markdown stream
                        aiBubble.innerHTML = marked.parse(aiFullResponse);
                        chatBox.scrollTop = chatBox.scrollHeight;
                    } catch (e) {
                        console.error("Error parsing JSON:", e);
                    }
                }
            }
        }
    } catch (error) {
        aiBubble.textContent = "Sorry, something went wrong. Please try again later.";
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});