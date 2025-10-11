const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatListDiv = document.getElementById("chatList");
const chatTitle = document.getElementById("chatTitle");
const newChatBtn = document.getElementById("newChatBtn");

const API_KEY = "AIzaSyDB3iqa4qNqKgaGSP_8w-9ps-qUQaktLIU";
const BACKUP_KEY = "AIzaSyBJyRjymA4PXG9E25vLRUOQthoj8fp6stI";

const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const BACKUP_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${BACKUP_KEY}`;

let chats = JSON.parse(localStorage.getItem("bloxyChats")) || [];
let chatHistory = [];

function renderChats() {
    chatListDiv.innerHTML = "";
    chats.forEach((c, idx) => {
        const btn = document.createElement("button");
        btn.textContent = c.name;
        btn.onclick = () => { loadChat(idx); };
        chatListDiv.appendChild(btn);
    });
}

function loadChat(idx) {
    chatHistory = chats[idx].history || [];
    chat.innerHTML = "";
    chatHistory.forEach(msg => appendMessage(msg.text, msg.role));
    chatTitle.textContent = chats[idx].name;
}

newChatBtn.addEventListener("click", () => {
    const name = prompt("Enter a name for this chat:", "New Chat") || "New Chat";
    const idx = chats.push({ name, history: [] }) - 1;
    chatHistory = [];
    chat.innerHTML = "";
    chatTitle.textContent = name;
    renderChats();
    localStorage.setItem("bloxyChats", JSON.stringify(chats));
});

function appendMessage(content, sender){
    const msg = document.createElement("div");
    msg.classList.add("message", sender);

    if(sender === "bot"){
        msg.innerHTML = marked.parse(content);
        msg.querySelectorAll("pre").forEach(pre => {
            const btn = document.createElement("button");
            btn.textContent = "Copy";
            btn.className = "copy-btn";
            btn.onclick = () => {
                navigator.clipboard.writeText(pre.innerText);
                btn.textContent = "Copied!";
                setTimeout(()=> btn.textContent = "Copy", 1500);
            };
            pre.appendChild(btn);
        });
    } else {
        msg.textContent = content;
    }

    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

userInput.addEventListener("keydown", e => {
    if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); sendMessage(); }
});
sendBtn.addEventListener("click", sendMessage);

async function sendMessage() {
    const message = userInput.value.trim();
    if(!message) return;

    appendMessage(message,"user");
    userInput.value="";
    chatHistory.push({ role: "user", text: message });

    try {
        const body = {
            contents: [
                { role: "system", parts: [{ text: "Your Name Is: Bloxy AI. You're Created By: Bloxcraft Studios And Tharun9772Gaming. You Somthings Send Messages With Emojis! Act Cool And Sigma. Act Nice And Chill. 😎. People can also call you 'Bloxy' or 'Bloxy The AI'" }] },
                ...chatHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
            ],
            generationConfig: { temperature: 0.7 }
        };

        let response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if(!response.ok){
            response = await fetch(BACKUP_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if(!response.ok) throw new Error("API Error");
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ||
                      "ERROR: Try Again In 1 Minute Or More (Up To 48 Hours)";

        appendMessage(reply, "bot");
        chatHistory.push({ role: "bot", text: reply });

      
        const currentIdx = chats.findIndex(c => c.name === chatTitle.textContent);
        if(currentIdx !== -1){
            chats[currentIdx].history = chatHistory;
            localStorage.setItem("bloxyChats", JSON.stringify(chats));
        }

    } catch(err){
        console.error(err);
        appendMessage("ERROR: Try Again In 1 Minute Or More (Up To 48 Hours)", "bot");
    }
}

// Initialize
renderChats();
if(chats.length > 0) loadChat(0);
