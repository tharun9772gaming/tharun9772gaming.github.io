const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatNames = document.getElementById("chatNames");
const newChatBtn = document.getElementById("newChatBtn");

const API_KEY = "AIzaSyDB3iqa4qNqKgaGSP_8w-9ps-qUQaktLIU";
const BACKUP_KEY = "AIzaSyBJyRjymA4PXG9E25vLRUOQthoj8fp6stI";
const NAME_KEY = "AIzaSyBJEf6p9x7PgS7sMkjZJikyb4HJkTc__JA";

const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const BACKUP_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${BACKUP_KEY}`;
const NAME_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${NAME_KEY}`;

let chatHistory = [];
let chats = JSON.parse(localStorage.getItem("bloxyChats")) || [];

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

async function getChatName(message){
    try {
        const resp = await fetch(NAME_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role:"user", parts:[{text: message}]}],
                generationConfig:{ temperature:0.7 }
            })
        });
        const data = await resp.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "New Chat";
    } catch { return "New Chat"; }
}

function renderChats(){
    chatNames.innerHTML = "";
    chats.forEach((c, i)=>{
        const li = document.createElement("li");
        li.textContent = c.name;
        li.onclick = () => loadChat(i);
        chatNames.appendChild(li);
    });
}

function loadChat(index){
    chatHistory = chats[index].history || [];
    chat.innerHTML = "";
    chatHistory.forEach(msg => appendMessage(msg.text, msg.role));
}

newChatBtn.onclick = async ()=>{
    const welcome = "Welcome To Bloxy AI!";
    chat.innerHTML = "";
    chatHistory = [];
    appendMessage(welcome,"bot");
    const name = await getChatName(welcome);
    chats.push({name, history: chatHistory});
    localStorage.setItem("bloxyChats", JSON.stringify(chats));
    renderChats();
};

async function sendMessage(){
    const message = userInput.value.trim();
    if(!message) return;

    appendMessage(message,"user");
    chatHistory.push({role:"user", text: message});
    userInput.value = "";

    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({contents: chatHistory.map(m=>({role:m.role, parts:[{text:m.text}]})), generationConfig:{temperature:0.7}})
        });

        if(!response.ok) throw new Error("API Error");

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I don't answer nonsense.";
        appendMessage(reply,"bot");
        chatHistory.push({role:"bot", text:reply});

     
        if(chats.length === 0 || !chats[chats.length-1].history.includes(chatHistory[0])){
            const chatName = await getChatName(reply);
            chats.push({name:chatName, history: chatHistory});
        } else {
            chats[chats.length-1].history = chatHistory;
        }
        localStorage.setItem("bloxyChats", JSON.stringify(chats));
        renderChats();

    } catch(err){
        console.error(err);
        appendMessage("Error: Check your API key or network.", "bot");
    }
}

userInput.addEventListener("keydown", e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); sendMessage(); }});
sendBtn.addEventListener("click", sendMessage);

renderChats();
