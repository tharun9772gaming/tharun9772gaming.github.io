const chat = document.getElementById("chat");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const SCTRIPT_BATCH = "AIzaSyDB3iqa4qNqKgaGSP_8w-9ps-qUQaktLIU";
const SCTRIPT_BATCH_2 = "AIzaSyBJyRjymA4PXG9E25vLRUOQthoj8fp6stI";
const SCTRIPT_BATCH_3 = "AIzaSyBJEf6p9x7PgS7sMkjZJikyb4HJkTc__JA";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${SCTRIPT_BATCH}`;
const API_URL2 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${SCTRIPT_BATCH_2}`;
const API_URL3 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${SCTRIPT_BATCH_3}`;

const SYSTEM_PROMPT = "Your Name Is: Bloxy AI. You're Created By: Bloxcraft Studios And Tharun9772Gaming. You Somthings Send Messages With Emojis! Act Cool And Sigma. Act Nice And Chill. 😎. People can also call you 'Bloxy' or 'Bloxy The AI'";

let chatHistory = [];
const MAX_TURNS = 6;

userInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
sendBtn.addEventListener("click", sendMessage);

function appendMessage(content, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  if (sender === "bot") {
    msg.innerHTML = marked.parse(content);
    msg.querySelectorAll("pre").forEach(pre => {
      const btn = document.createElement("button");
      btn.textContent = "Copy";
      btn.className = "copy-btn";
      btn.onclick = () => {
        navigator.clipboard.writeText(pre.innerText);
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = "Copy"), 1500);
      };
      pre.appendChild(btn);
    });
  } else {
    msg.textContent = content;
  }

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function buildPayload() {
  const recent = chatHistory.slice(-MAX_TURNS * 2);
  const contents = [
    { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
    ...recent.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      parts: [{ text: m.text }]
    }))
  ];
  return {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 700 }
  };
}

async function fetchWithFallback(urls, body) {
  let lastResponse = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      lastResponse = res;
      if (res.ok) return res;
      let text;
      try { text = await res.text(); } catch { text = "<no body>"; }
      console.warn(`Endpoint ${url} returned ${res.status}:`, text);
    } catch (err) {
      console.warn(`Network error on ${url}:`, err);
    }
  }
  return lastResponse;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  chatHistory.push({ role: "user", text: message });
  userInput.value = "";

  const payload = buildPayload();

  try {
    const res = await fetchWithFallback([API_URL, API_URL2, API_URL3], payload);

    if (!res || !res.ok) {
      appendMessage("ERROR: Try Again In 1 Minute Or More (Up To 48 Hours)", "bot");
      return;
    }

    const data = await res.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      data.output?.[0]?.content?.[0]?.text ??
      "ERROR: Try Again In 1 Minute Or More (Up To 48 Hours)";

    appendMessage(reply, "bot");
    chatHistory.push({ role: "bot", text: reply });
  } catch (err) {
    console.error(err);
    appendMessage("ERROR: Try Again In 1 Minute Or More (Up To 48 Hours)", "bot");
  }
}

