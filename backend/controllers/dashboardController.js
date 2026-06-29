const db = require('../config/db');

exports.getDashboardData = async (req, res) => {
  try {
    // 1. Fetch plant settings
    const [settingsRows] = await db.query('SELECT * FROM plant_settings LIMIT 1');
    if (settingsRows.length === 0) {
      return res.status(500).json({ error: 'Plant settings not found in database.' });
    }
    const plant = settingsRows[0];

    // 2. Fetch today's schedule summary. Today is defined in the local time zone.
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const today = `${year}-${month}-${day}`;

    const [scheduleRows] = await db.query(
      `SELECT 
        SUM(calculated_revenue_inr) AS today_revenue,
        SUM(CASE WHEN recommended_action = 'GENERATE' THEN 100 ELSE 0 END) AS generated_energy,
        SUM(CASE WHEN recommended_action = 'PUMP' THEN 100 ELSE 0 END) AS pumped_energy
       FROM optimization_schedules
       WHERE run_date = ?`,
      [today]
    );

    const summary = scheduleRows[0] || {};

    return res.status(200).json({
      plant: {
        id: plant.id,
        plant_name: plant.plant_name,
        efficiency_rate: Number(plant.efficiency_rate),
        max_storage_mwh: Number(plant.max_storage_mwh),
        min_storage_mwh: Number(plant.min_storage_mwh),
        current_storage_mwh: Number(plant.current_storage_mwh)
      },
      today_revenue: Number(summary.today_revenue || 0),
      generated_energy: Number(summary.generated_energy || 0),
      pumped_energy: Number(summary.pumped_energy || 0),
      today_date: today
    });

  } catch (error) {
    console.error('Error in getDashboardData:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
