const db = require('../config/db');

exports.uploadTariffs = async (req, res) => {
  try {
    const { date, tariffs } = req.body;

    // Validation
    if (!date) {
      return res.status(400).json({ error: 'Date is required.' });
    }

    if (!Array.isArray(tariffs) || tariffs.length !== 24) {
      return res.status(400).json({ error: 'Exactly 24 tariff values are required.' });
    }

    const values = [];
    for (let i = 0; i < tariffs.length; i++) {
      const { hour, price } = tariffs[i];
      if (hour === undefined || price === undefined) {
        return res.status(400).json({ error: `Tariff block at index ${i} is missing hour or price.` });
      }
      
      const hr = Number(hour);
      const pr = Number(price);

      if (isNaN(hr) || hr < 0 || hr > 23) {
        return res.status(400).json({ error: `Hour at index ${i} must be a number between 0 and 23.` });
      }

      if (isNaN(pr) || pr < 0) {
        return res.status(400).json({ error: `Price at index ${i} must be a non-negative number.` });
      }

      values.push([date, hr, pr]);
    }

    // Insert or update using bulk insert syntax with ON DUPLICATE KEY UPDATE
    const query = `
      INSERT INTO market_tariffs (tariff_date, hour_block, price_per_mwh_inr)
      VALUES ?
      ON DUPLICATE KEY UPDATE price_per_mwh_inr = VALUES(price_per_mwh_inr)
    `;

    await db.query(query, [values]);

    return res.status(201).json({ message: 'Tariffs uploaded successfully.' });
  } catch (error) {
    console.error('Error in uploadTariffs:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
