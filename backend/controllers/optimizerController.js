const db = require('../config/db');
const { optimizeSchedule } = require('../services/optimizer');

exports.runOptimizer = async (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ error: 'Date is required.' });
  }

  try {
    // 1. Fetch plant settings
    const [settingsRows] = await db.query('SELECT * FROM plant_settings LIMIT 1');
    if (settingsRows.length === 0) {
      return res.status(500).json({ error: 'Plant settings not found in database.' });
    }
    const plantSettings = settingsRows[0];

    // 2. Fetch tariffs for the target date
    const [tariffRows] = await db.query(
      'SELECT * FROM market_tariffs WHERE tariff_date = ? ORDER BY hour_block ASC',
      [date]
    );

    if (tariffRows.length === 0) {
      return res.status(400).json({
        error: `No tariff data found for date ${date}. Please upload electricity prices first.`
      });
    }

    if (tariffRows.length !== 24) {
      return res.status(400).json({
        error: `Incomplete tariff data found for date ${date} (found ${tariffRows.length}/24 hours). Please re-upload tariffs.`
      });
    }

    // 3. Map database tariffs to optimizer inputs
    const tariffs = tariffRows.map(row => ({
      hour: row.hour_block,
      price: Number(row.price_per_mwh_inr)
    }));

    // 4. Run the optimization algorithm
    const schedule = optimizeSchedule(
      tariffs,
      Number(plantSettings.current_storage_mwh),
      Number(plantSettings.max_storage_mwh),
      Number(plantSettings.min_storage_mwh),
      Number(plantSettings.efficiency_rate)
    );

    const dailyRevenue = schedule.reduce((sum, item) => sum + item.calculated_revenue, 0);

    // 5. DB transaction to delete existing schedule, insert new schedule, and update storage settings
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Delete existing schedule for this run date
      await connection.query(
        'DELETE FROM optimization_schedules WHERE run_date = ?',
        [date]
      );

      // Map schedule for batch insert
      const insertValues = schedule.map(item => [
        date,
        item.hour,
        item.price,
        item.recommended_action,
        item.resulting_storage,
        item.calculated_revenue
      ]);

      await connection.query(
        `INSERT INTO optimization_schedules 
         (run_date, hour_block, price_per_mwh_inr, recommended_action, resulting_storage_mwh, calculated_revenue_inr) 
         VALUES ?`,
        [insertValues]
      );

      // Update current storage level in plant settings with the final storage value (at hour 23)
      const finalStorage = schedule[23].resulting_storage;
      await connection.query(
        'UPDATE plant_settings SET current_storage_mwh = ? WHERE id = ?',
        [finalStorage, plantSettings.id]
      );

      await connection.commit();
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }

    // 6. Return response
    return res.status(200).json({
      daily_revenue: dailyRevenue,
      schedule: schedule,
      storage_profile: schedule.map(item => ({
        hour: item.hour,
        storage: item.resulting_storage
      }))
    });

  } catch (error) {
    console.error('Error in runOptimizer:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const query = `
      SELECT 
        run_date,
        SUM(calculated_revenue_inr) AS revenue,
        SUM(CASE WHEN recommended_action = 'PUMP' THEN 1 ELSE 0 END) AS pump_count,
        SUM(CASE WHEN recommended_action = 'GENERATE' THEN 1 ELSE 0 END) AS generate_count,
        SUM(CASE WHEN recommended_action = 'HOLD' THEN 1 ELSE 0 END) AS hold_count
      FROM optimization_schedules
      GROUP BY run_date
      ORDER BY run_date DESC
    `;

    const [rows] = await db.query(query);

    // Format run_date as YYYY-MM-DD string
    const formattedRows = rows.map(row => {
      let dateStr = row.run_date;
      if (row.run_date instanceof Date) {
        // Correct timezone offset adjustment to local date string
        const year = row.run_date.getFullYear();
        const month = String(row.run_date.getMonth() + 1).padStart(2, '0');
        const day = String(row.run_date.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
      return {
        ...row,
        run_date: dateStr,
        revenue: Number(row.revenue),
        pump_count: Number(row.pump_count),
        generate_count: Number(row.generate_count),
        hold_count: Number(row.hold_count)
      };
    });

    return res.status(200).json(formattedRows);
  } catch (error) {
    console.error('Error in getHistory:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
