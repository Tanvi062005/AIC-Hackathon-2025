// src/ui/index.js
import addOnUISdk from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

addOnUISdk.ready.then(async () => {const { runtime } = addOnUISdk.instance;
    const sandbox = await runtime.apiProxy("documentSandbox");
    const roastBtn = document.getElementById("roast-btn");
    const roastOut = document.getElementById("roast-output");
    const tipOut = document.getElementById("tip-output");
    
    const BASE_URL = "https://roast-backend-e21yv8tvd-yuvraajs-projects.vercel.app";





  roastBtn.disabled = false;
  roastBtn.addEventListener("click", async () => {
    roastOut.innerText = "Analyzing…";
    tipOut.innerText   = "";

    const elems = await sandbox.getCanvasElements();

    if (!elems.length) {
      roastOut.innerText = "👻 Nothing here to roast!";
      tipOut.innerText   = "💡 Tip: Add text or shapes, then roast me.";
      return;
    }

      try {
        console.log("Sending to /api/roast:", JSON.stringify({ elements: elems }, null, 2));
        const response = await fetch(
            `${BASE_URL}/api/roast`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ elements: elems }) }
          );
          

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const { roast, tip } = await response.json();

      roastOut.innerText = roast;
      tipOut.innerText   = tip;

    } catch (error) {
      console.error("API call error:", error);
      roastOut.innerText = "🤖 Oops! Something went wrong.";
      tipOut.innerText   = "💡 Tip: Check the backend URL and HF_API_TOKEN.";
    }
  });
});
