const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");

const PAGE_SIZE = 60;

let DATA = {
  apps: [],
  nowgg: []
};

let CURRENT = [];
let FILTERED = [];
let RENDERED = 0;
let OBSERVER_SENTINEL = null;
let OBSERVER = null;

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

function normalize(g) {
  if (!g || !g.name || !g.url) return null;
  return {
    name: g.name,
    img: g.img || "/1f3ae.png",
    url: g.url
  };
}

async function loadBlox() {
  if (DATA.blox.length) return;
  try {
    const r = await fetch("/Cloud Gaming/games.json");
    DATA.blox = safeArray(await r.json()).map(normalize).filter(Boolean);
  } catch (e) {
    console.error("Blox load error:", e);
  }
}

async function loadNowGG() {
  if (DATA.nowgg.length) return;
  try {
    const r = await fetch("https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/nowgg.fun/games.json");
    const d = await r.json();
    const rawData = safeArray(d);

    DATA.nowgg = rawData.map(g => {
      if (!g.name || !g.url) return null;

      let rawUrl = g.url.trim();
      let cleanUrl = rawUrl.startsWith("http") ? rawUrl : "https://" + rawUrl;

      return {
        name: g.name,
        img: g.img || "/1f3ae.png",
        url: "/sail/embed/#" + cleanUrl
      };
    }).filter(Boolean);

  } catch (e) {
    console.error("NowGG load error:", e);
  }
}

document.querySelectorAll(".cat").forEach(btn => {
  btn.onclick = async () => {
    document.querySelectorAll(".cat").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");

    const cat = btn.dataset.cat;

    if (cat === "all") {
      await Promise.all([loadBlox(), loadNowGG()]);
      CURRENT = Object.values(DATA).flat().map(normalize).filter(Boolean);
    } else {
      const loaderMap = {
        blox: loadApps,
        nowgg: loadNowGG
      };
      if (loaderMap[cat]) await loaderMap[cat]();
      CURRENT = DATA[cat] || [];
    }

    FILTERED = CURRENT;
    search.value = "";
    RESET_RENDER();
    updateCount();
    render(true);
  };
});

search.oninput = () => {
  const v = search.value.toLowerCase().trim();
  FILTERED = CURRENT.filter(g => g?.name?.toLowerCase().includes(v));
  RESET_RENDER();
  updateCount();
  render(true);
};

function render(reset = false) {
  const fallback = "/1f3ae.png";
  if (reset) {
    grid.innerHTML = "";
    RENDERED = 0;
  }

  const valid = FILTERED.filter(g => g && g.name && g.url);
  const slice = valid.slice(RENDERED, RENDERED + PAGE_SIZE);
  const frag = document.createDocumentFragment();

  for (const g of slice) {
    const card = document.createElement("div");
    card.className = "game-card";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = g.img || fallback;
    img.onerror = () => img.src = fallback;

    const title = document.createElement("h3");
    title.textContent = g.name;

    const link = document.createElement("a");
    link.className = "play-btn";
    link.href = g.url;
    link.textContent = "Play";

    card.append(img, title, link);
    frag.appendChild(card);
  }

  grid.appendChild(frag);
  RENDERED += slice.length;

  if (RENDERED < valid.length) setupObserver();
}

function setupObserver() {
  if (OBSERVER_SENTINEL) OBSERVER_SENTINEL.remove();

  OBSERVER_SENTINEL = document.createElement("div");
  grid.appendChild(OBSERVER_SENTINEL);

  if (OBSERVER) OBSERVER.disconnect();

  OBSERVER = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      RESET_OBSERVER_ONLY();
      render(false);
    }
  }, { rootMargin: "300px" });

  OBSERVER.observe(OBSERVER_SENTINEL);
}

function RESET_OBSERVER_ONLY() {
  if (OBSERVER) OBSERVER.disconnect();
  if (OBSERVER_SENTINEL) {
    OBSERVER_SENTINEL.remove();
    OBSERVER_SENTINEL = null;
  }
}

function RESET_RENDER() {
  RENDERED = 0;
  RESET_OBSERVER_ONLY();
}

function updateCount() {
  count.textContent = FILTERED.length + " games";
}

(async () => {
  await loadNowGG();
  CURRENT = DATA.blox;
  FILTERED = CURRENT;
  updateCount();
  render(true);
})();
