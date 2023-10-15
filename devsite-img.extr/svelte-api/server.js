const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const https = require('https');

const app = express();
const corsOptions = {
  origin: 'http://localhost:8080',
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200
};

app.use(cors(corsOptions));
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

  try {
    const response = await axios.get(url, {
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
    });
    const $ = cheerio.load(response.data);

    const imgUrls = $('img').map((_, img) => $(img).attr('src')).get();

    res.json({ success: true, imgUrls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
