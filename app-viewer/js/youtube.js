const params = new URLSearchParams(window.location.search);
const view = params.get("view");

const JSON_URL = "https://cdn.jsdelivr.net/gh/tharun9772/game-assets@main/libraries/youtube/gms.json";

const viewerFrame = document.getElementById("viewerFrame");
const viewerTitle = document.getElementById("viewerTitle");
const openNewTab = document.getElementById("openNewTab");

function show404() {
  viewerFrame.src = "about:blank";
  viewerFrame.srcdoc = "<h1 style='color:white;background:black;height:100vh;display:flex;align-items:center;justify-content:center;margin:0;font-family:sans-serif;'>404 - Game Not Found</h1>";
}

function buildSrcdoc(url, html) {
  try {
    const parsed = new URL(url);
    const base = parsed.origin + parsed.pathname.replace(/[^/]*$/, "");
    return `<base href="${base}">${html}`;
  } catch (err) {
    return html;
  }
}

function loadIntoViewer(url) {
  return fetch(url, { credentials: "omit" })
    .then(r => {
      if (!r.ok) throw new Error("Failed to fetch page: " + r.status);
      return r.text();
    })
    .then(html => {
      const srcdoc = buildSrcdoc(url, html);

      viewerFrame.src = "about:blank";
      viewerFrame.srcdoc = srcdoc;

      return srcdoc;
    });
}

if (!view) {
  show404();
} else {
  const targetName = decodeURIComponent(view);

  fetch(JSON_URL)
    .then(r => r.json())
    .then(data => {
      const game = data.find(g => g.name === targetName);
      if (!game || !game.url) throw new Error("Game entry missing");

      const fullUrl = game.url;
      viewerTitle.textContent = game.name;

      loadIntoViewer(fullUrl)
        .then(srcdoc => {
          openNewTab.onclick = () => {
            const popup = window.open("about:blank", "_blank", "noopener,noreferrer");

            if (!popup) {
              window.open(fullUrl, "_blank", "noopener,noreferrer");
              return;
            }

            popup.document.open();
            popup.document.write(srcdoc);
            popup.document.close();
          };
        })
        .catch(err => {
          console.error(err);
          viewerFrame.src = fullUrl;
          openNewTab.onclick = () => {
            window.open(fullUrl, "_blank", "noopener,noreferrer");
          };
        });
    })
    .catch(err => {
      console.error(err);
      show404();
    });
}

document.getElementById("closeViewer").onclick = () => {
  window.top.location.href = "/";
};
