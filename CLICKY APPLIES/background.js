chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "SUBMIT_APPLICATION") {
    submitToSheets(msg.data)
      .then((res) => sendResponse({ success: true, result: res }))
      .catch((err) => sendResponse({ success: false, error: err.message }));

    return true;
  }
});

async function submitToSheets(data) {
  const { WEB_APP_URL } = await chrome.storage.sync.get(["WEB_APP_URL"]);

  if (!WEB_APP_URL) {
    throw new Error("WEB_APP_URL is not set");
  }

  const response = await fetch(WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  // 🔥 IMPORTANT FIX (DON'T USE response.json)
  const text = await response.text();

  console.log("RAW RESPONSE:", text);

  try {
    return JSON.parse(text);
  } catch (e) {
    return { raw: text };
  }
}























