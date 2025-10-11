const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const API_KEY = "AIzaSyDB3iqa4qNqKgaGSP_8w-9ps-qUQaktLIU";
const BACKUP_KEY = "AIzaSyBJyRjymA4PXG9E25vLRUOQthoj8fp6stI";
const BACKUP2_KEY = "AIzaSyBJEf6p9x7PgS7sMkjZJikyb4HJkTc__JA";

const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
const BACKUP_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${BACKUP_KEY}`;
const BACKUP2_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${BACKUP2_KEY}`;

const SYSTEM_PROMPT = "Your Name Is: Bloxy AI. You're Created By: Bloxcraft Studios And Tharun9772Gaming. You Somthings Send Messages With Emojis! Act Cool And Sigma. Act Nice And Chill. 😎. People can also call you 'Bloxy' or 'Bloxy The AI'";

let chatHistory = [];

userInput.addEventListener("keydown", e => { if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendMessage(); } });
sendBtn.addEventListener("click", sendMessage);

function appendMessage(content,sender){
    const msg=document.createElement("div");
    msg.classList.add("message",sender);
    if(sender==="bot"){
        msg.innerHTML=marked.parse(content);
        msg.querySelectorAll("pre").forEach(pre=>{
            const btn=document.createElement("button");
            btn.textContent="Copy";
            btn.className="copy-btn";
            btn.onclick=()=>{ navigator.clipboard.writeText(pre.innerText); btn.textContent="Copied!"; setTimeout(()=>btn.textContent="Copy",1500); };
            pre.appendChild(btn);
        });
    } else { msg.textContent=content; }
    chat.appendChild(msg);
    chat.scrollTop=chat.scrollHeight;
}

async function sendMessage(){
    const message=userInput.value.trim();
    if(!message) return;
    appendMessage(message,"user");
    chatHistory.push({ role:"user", text:message });
    userInput.value="";

    const payload={ contents: chatHistory.map(item => ({ role:item.role, parts:[{ text:item.role==="bot"?item.text:SYSTEM_PROMPT+"\nUser: "+item.text }] })), generationConfig:{ temperature:0.7, maxOutputTokens:500 } };

    try {
        let response=await fetch(API_ENDPOINT,{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) });
        if(!response.ok) response=await fetch(BACKUP_ENDPOINT,{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) });
        if(!response.ok) response=await fetch(BACKUP2_ENDPOINT,{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload) });
        if(!response.ok) throw new Error("ERROR: Try Again In 1 Minute Or More (Up To 48 Hours)");
        const data=await response.json();
        const reply=data.candidates?.[0]?.content?.parts?.[0]?.text || "Bloxy AI: I cannot respond.";
        appendMessage(reply,"bot");
        chatHistory.push({ role:"bot", text:reply });
    } catch(err){ console.error(err); appendMessage(err.message,"bot"); }
}
