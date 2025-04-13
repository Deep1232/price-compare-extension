// Get active tab's product title from content script
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          // Simple title getter
          const title = document.querySelector('h1')?.innerText || document.title;
          return title;
        },
      },
      async (results) => {
        const title = results[0].result;
        const container = document.getElementById('container');
  
        try {
          const response = await fetch(`http://localhost:3000/api/compare?title=${encodeURIComponent(title)}`);
          const data = await response.json();
  
          if (!data.lowestPrice) {
            container.innerHTML = '❌ No price found.';
            return;
          }
  
          container.innerHTML = `
            <img src="${data.image}" alt="Product Image"/>
            <div class="price">₹${data.lowestPrice}</div>
            <div class="store">Sold by: ${data.storeName}</div>
            <a class="button" href="${data.productUrl}" target="_blank">Buy Now</a>
          `;
        } catch (err) {
          container.innerHTML = '⚠️ Error fetching price.';
        }
      }
    );
  });
  