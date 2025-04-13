// 🟢 Step 1: Get product title from Amazon or Flipkart
let productTitle = "";

if (window.location.hostname.includes("amazon")) {
  const titleElem = document.getElementById("productTitle");
  if (titleElem) productTitle = titleElem.innerText.trim();
} else if (window.location.hostname.includes("flipkart")) {
  const titleElem = document.querySelector("span.B_NuCI");
  if (titleElem) productTitle = titleElem.innerText.trim();
}

if (!productTitle) {
  console.log("❌ Product title not found.");
  return;
}

// 🔵 Step 2: Send product title to your server
const apiUrl = `http://localhost:3000/api/compare?title=${encodeURIComponent(productTitle)}`;

fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
    if (!data || !data.lowestPrice) {
      showPopup("No prices found.");
      return;
    }

    showPopup(`
      <div style="text-align:center;">
        <img src="${data.image}" alt="product" style="width:100px; height:auto; margin-bottom:8px; border-radius:8px;">
        <div style="font-size:18px; color:green; font-weight:bold;">₹${data.lowestPrice}</div>
        <div style="font-size:14px; margin:4px 0;">From: ${data.storeName}</div>
        <a href="${data.productUrl}" target="_blank" style="
          display:inline-block;
          margin-top:6px;
          background-color:#007bff;
          color:white;
          padding:6px 12px;
          border-radius:6px;
          text-decoration:none;
        ">Buy Now</a>
      </div>
    `);
  })
  .catch(err => {
    console.error("Error contacting server:", err);
    showPopup("Server error.");
  });

// 🔘 Floating popup with custom HTML
function showPopup(html) {
  const popup = document.createElement("div");
  popup.innerHTML = html;
  popup.style.position = "fixed";
  popup.style.bottom = "20px";
  popup.style.right = "20px";
  popup.style.backgroundColor = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.padding = "12px";
  popup.style.borderRadius = "10px";
  popup.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
  popup.style.zIndex = "9999";
  popup.style.maxWidth = "220px";
  popup.style.fontFamily = "Arial, sans-serif";

  document.body.appendChild(popup);

  setTimeout(() => popup.remove(), 15000);
}
