const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow cross-origin requests from extension

const PORT = process.env.PORT || 3000;

// 🛍️ API Endpoint: /api/compare?title=Product Name
app.get('/api/compare', async (req, res) => {
  const productTitle = req.query.title;

  if (!productTitle) {
    return res.status(400).json({ error: 'Missing product title' });
  }

  const searchUrl = `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(productTitle)}`;

  try {
    const { data: html } = await axios.get(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);
    let bestDeal = null;

    $('div.sh-dgr__grid-result').each((i, el) => {
      const priceText = $(el)
        .find('.a8Pemb, .sh-osd__offer-price')
        .first()
        .text()
        .replace(/[^\d]/g, '');
      const price = parseInt(priceText, 10);

      const storeName = $(el).find('.aULzUe.IuHnof').first().text();

      // 🔗 Extract clean product URL
      const fullUrl = $(el).find('a.shntl').first().attr('href');
      const match = fullUrl && fullUrl.match(/url\?url=([^&]+)/);
      const productUrl = match ? decodeURIComponent(match[1]) : 'https://www.google.com' + fullUrl;

      // 🖼️ Get actual product image
      const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');

      if (!isNaN(price)) {
        if (!bestDeal || price < bestDeal.lowestPrice) {
          bestDeal = {
            lowestPrice: price,
            storeName,
            productUrl,
            image,
          };
        }
      }
    });

    if (!bestDeal) {
      return res.json({ lowestPrice: null });
    }

    return res.json(bestDeal);
  } catch (error) {
    console.error('Scraping failed:', error);
    res.status(500).json({ error: 'Failed to scrape Google Shopping' });
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Server running on http://localhost:${PORT}`);
});
