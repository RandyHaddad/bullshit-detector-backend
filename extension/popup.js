const API_BASE = "http://localhost:3000";

document.getElementById("detect").addEventListener("click", async () => {
  const btn = document.getElementById("detect");
  const status = document.getElementById("status");

  btn.disabled = true;
  status.textContent = "Analyzing page...";
  status.className = "";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    const res = await fetch(`${API_BASE}/api/annotate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) throw new Error("Backend error");

    const { replacements, cached } = await res.json();

    if (replacements.length === 0) {
      status.textContent = "No BS claims detected.";
      status.className = "success";
      btn.disabled = false;
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: applyReplacements,
      args: [replacements],
    });

    status.textContent = `${replacements.length} claims annotated${cached ? " (cached)" : ""}`;
    status.className = "success";
  } catch (err) {
    status.textContent = "Error: " + err.message;
    status.className = "error";
  }

  btn.disabled = false;
});

function applyReplacements(replacements) {
  const TYPE_CONFIG = {
    false:      { emoji: "\u274C", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
    suspicious: { emoji: "\u26A0\uFE0F", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
    verified:   { emoji: "\u2705", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
    fluff:      { emoji: "\uD83D\uDCA8", color: "#7c3aed", bg: "#faf5ff", border: "#e9d5ff" },
  };

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  let count = 0;
  for (const r of replacements) {
    const cfg = TYPE_CONFIG[r.type] || TYPE_CONFIG.suspicious;

    for (const node of textNodes) {
      if (!node.nodeValue || !node.nodeValue.includes(r.find)) continue;

      // Build details list
      let detailsHtml = "";
      if (r.details && r.details.length > 0) {
        const items = r.details.map(d => {
          // Auto-link URLs in details
          const linked = d.replace(/(https?:\/\/[^\s,)]+)/g, '<a href="$1" target="_blank" style="color:' + cfg.color + ';text-decoration:underline;">$1</a>');
          return `<li style="margin:2px 0;padding-left:4px;">${linked}</li>`;
        }).join("");
        detailsHtml = `<ul style="margin:4px 0 0 0;padding-left:16px;list-style:disc;font-size:inherit;">${items}</ul>`;
      }

      const wrapper = document.createElement("span");
      wrapper.innerHTML = node.nodeValue.replace(
        r.find,
        `<span style="position:relative;display:inline;">`
          + `<span style="text-decoration:line-through;text-decoration-color:${cfg.color};opacity:0.5;">${r.find}</span>`
          + `<span style="display:inline-block;vertical-align:top;margin-left:6px;padding:4px 8px;background:${cfg.bg};border:1px solid ${cfg.border};border-radius:4px;font-size:0.85em;line-height:1.4;max-width:320px;color:${cfg.color};font-family:inherit;">`
            + `${cfg.emoji} ${r.annotation}`
            + detailsHtml
          + `</span>`
        + `</span>`
      );

      node.parentNode.replaceChild(wrapper, node);
      count++;
    }
  }

  // Banner
  const banner = document.createElement("div");
  banner.style.cssText = "position:fixed;top:0;left:0;right:0;background:white;color:#111;padding:10px 20px;z-index:999999;font-family:inherit;font-size:14px;border-bottom:2px solid #e74c3c;display:flex;align-items:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);";
  banner.innerHTML = `<strong>\uD83E\uDDE0 BS Detector:</strong> ${count} claims annotated <span style="margin-left:auto;cursor:pointer;opacity:0.4;font-size:18px;" onclick="this.parentElement.remove();document.body.style.marginTop='0px';">\u2715</span>`;
  document.body.prepend(banner);
  document.body.style.marginTop = (banner.offsetHeight) + "px";
}
