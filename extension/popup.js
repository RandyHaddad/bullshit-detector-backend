const API_BASE = "http://localhost:3000";

document.getElementById("detect").addEventListener("click", async () => {
  const btn = document.getElementById("detect");
  const status = document.getElementById("status");

  btn.disabled = true;
  status.textContent = "Analyzing page...";
  status.className = "";

  try {
    // Get current tab URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = tab.url;

    // Call backend
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

    // Inject content script to apply replacements
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    // Send replacements to content script
    await chrome.tabs.sendMessage(tab.id, { replacements });

    status.textContent = `${replacements.length} claims annotated${cached ? " (cached)" : ""}`;
    status.className = "success";
  } catch (err) {
    status.textContent = "Error: " + err.message;
    status.className = "error";
  }

  btn.disabled = false;
});
