chrome.runtime.onMessage.addListener((msg) => {
  if (!msg.replacements) return;

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
  for (const replacement of msg.replacements) {
    for (const node of textNodes) {
      if (node.nodeValue && node.nodeValue.includes(replacement.find)) {
        const span = document.createElement("span");
        span.innerHTML = node.nodeValue.replace(
          replacement.find,
          `<span style="background:#fecaca;text-decoration:line-through;padding:1px 3px;border-radius:2px;">${replacement.find}</span> <span style="background:#1a1a2e;color:#4ade80;padding:1px 6px;border-radius:2px;font-size:0.9em;">${replacement.replace.replace(replacement.find, "").trim()}</span>`
        );
        node.parentNode.replaceChild(span, node);
        count++;
      }
    }
  }

  // Add banner at top
  const banner = document.createElement("div");
  banner.style.cssText = "position:fixed;top:0;left:0;right:0;background:#1a1a2e;color:white;padding:12px 20px;z-index:999999;font-family:system-ui,sans-serif;font-size:14px;border-bottom:3px solid #e74c3c;display:flex;align-items:center;gap:8px;";
  banner.innerHTML = `<span style="font-size:18px;">&#x1F9E0;</span> <strong>BS Detector:</strong> ${count} claims annotated on this page. <span style="margin-left:auto;cursor:pointer;opacity:0.6;" onclick="this.parentElement.remove()">&#x2715;</span>`;
  document.body.prepend(banner);
  document.body.style.marginTop = (banner.offsetHeight) + "px";
});
