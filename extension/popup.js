const API_BASE = "http://localhost:3000";
let activeTabId = null;
let isShowingAnnotations = false;
let lastReplacements = null;

document.getElementById("detect").addEventListener("click", async () => {
  const btn = document.getElementById("detect");
  const toggle = document.getElementById("toggle");
  const status = document.getElementById("status");

  btn.disabled = true;
  status.textContent = "Analyzing page...";
  status.className = "";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTabId = tab.id;
    const url = tab.url;
    const mode = document.getElementById("mode").value;

    // Save original page HTML before we touch anything
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (!document.body.dataset.bsOriginal) {
          document.body.dataset.bsOriginal = document.body.innerHTML;
        }
      },
    });

    const res = await fetch(`${API_BASE}/api/annotate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, mode }),
    });

    if (!res.ok) throw new Error("Backend error");

    const { replacements, cached } = await res.json();

    if (replacements.length === 0) {
      status.textContent = "No BS claims detected.";
      status.className = "success";
      btn.disabled = false;
      return;
    }

    lastReplacements = replacements;

    // Apply annotations immediately
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: applyReplacements,
      args: [replacements],
    });

    isShowingAnnotations = true;

    // Hide detect, show toggle
    btn.style.display = "none";
    document.getElementById("mode").style.display = "none";
    toggle.style.display = "block";
    toggle.textContent = "Show Original";
    toggle.style.background = "#333";
    toggle.style.color = "#e0e0e0";

    status.textContent = `${replacements.length} claims annotated${cached ? " (cached)" : ""}`;
    status.className = "success";
  } catch (err) {
    status.textContent = "Error: " + err.message;
    status.className = "error";
    btn.disabled = false;
  }
});

document.getElementById("toggle").addEventListener("click", async () => {
  if (!activeTabId) return;
  const toggle = document.getElementById("toggle");

  if (isShowingAnnotations) {
    // Show original
    await chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      func: () => {
        if (document.body.dataset.bsOriginal) {
          document.body.innerHTML = document.body.dataset.bsOriginal;
          document.body.style.marginTop = "0px";
        }
      },
    });
    toggle.textContent = "Show BS Annotations";
    toggle.style.background = "#4ade80";
    toggle.style.color = "#000";
  } else {
    // Show annotations
    await chrome.scripting.executeScript({
      target: { tabId: activeTabId },
      func: () => {
        if (document.body.dataset.bsAnnotated) {
          document.body.innerHTML = document.body.dataset.bsAnnotated;
        }
      },
    });
    toggle.textContent = "Show Original";
    toggle.style.background = "#333";
    toggle.style.color = "#e0e0e0";
  }

  isShowingAnnotations = !isShowingAnnotations;
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
      if (!node.parentNode || !node.nodeValue || !node.nodeValue.includes(r.find)) continue;

      let detailsHtml = "";
      if (r.details && r.details.length > 0) {
        const items = r.details.map(d => {
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
          + `<span style="display:inline-block;vertical-align:top;margin-left:6px;padding:4px 8px;background:${cfg.bg};border:1px solid ${cfg.border};border-radius:4px;font-size:0.85em;line-height:1.4;max-width:320px;color:${cfg.color};font-family:inherit;text-align:left;">`
            + `${cfg.emoji} ${r.annotation}`
            + detailsHtml
          + `</span>`
        + `</span>`
      );

      node.parentNode.replaceChild(wrapper, node);
      count++;
    }
  }

  // Save annotated state for toggling
  document.body.dataset.bsAnnotated = document.body.innerHTML;

  // Banner
  const banner = document.createElement("div");
  banner.style.cssText = "position:fixed;top:0;left:0;right:0;background:white;color:#111;padding:10px 20px;z-index:999999;font-family:inherit;font-size:14px;border-bottom:2px solid #e74c3c;display:flex;align-items:center;gap:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);";
  banner.innerHTML = `<strong>\uD83E\uDDE0 BS Detector:</strong> ${count} claims annotated <span style="margin-left:auto;cursor:pointer;opacity:0.4;font-size:18px;" onclick="this.parentElement.remove();document.body.style.marginTop='0px';">\u2715</span>`;
  document.body.prepend(banner);
  document.body.style.marginTop = (banner.offsetHeight) + "px";
}
