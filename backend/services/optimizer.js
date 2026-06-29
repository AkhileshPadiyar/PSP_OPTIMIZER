/**
 * Deterministic Pumped Storage Hydro Power Plant Scheduling Optimizer.
 *
 * @param {Array} tariffs - Array of { hour: Number, price: Number }
 * @param {Number} currentStorage - Starting reservoir level in MWh
 * @param {Number} maxStorage - Max storage capacity in MWh
 * @param {Number} minStorage - Min storage capacity in MWh
 * @param {Number} efficiency - Plant efficiency rate (e.g., 0.8)
 * @returns {Array} - Array of 24 schedule entries
 */
function optimizeSchedule(tariffs, currentStorage, maxStorage, minStorage, efficiency) {
  // Sort tariffs by price to identify the 6 cheapest and 6 most expensive hours.
  // Use a stable sort key to ensure deterministic output if there are price ties.
  const sorted = [...tariffs].sort((a, b) => {
    if (a.price !== b.price) {
      return a.price - b.price;
    }
    return a.hour - b.hour;
  });

  // Select cheapest 6 hours for pumping
  const pumpHours = new Set(sorted.slice(0, 6).map(t => t.hour));

  // Select expensive 6 hours for generating
  const generateHours = new Set(sorted.slice(18, 24).map(t => t.hour));

  // Sort tariffs by hour to simulate sequentially from hour 0 to 23
  const chronologicalTariffs = [...tariffs].sort((a, b) => a.hour - b.hour);

  const schedule = [];
  let waterTracker = currentStorage;

  for (let hour = 0; hour < 24; hour++) {
    const tariff = chronologicalTariffs.find(t => t.hour === hour) || { hour, price: 0 };
    const price = Number(tariff.price);
    let action = 'HOLD';
    let revenue = 0;

    if (pumpHours.has(hour) && (waterTracker + 100 <= maxStorage)) {
      action = 'PUMP';
      waterTracker += 100;
      revenue = -(100 * price);
    } else if (generateHours.has(hour) && (waterTracker - 125 >= minStorage)) {
      action = 'GENERATE';
      waterTracker -= 125;
      revenue = +(100 * price);
    } else {
      action = 'HOLD';
      revenue = 0;
    }

    schedule.push({
      hour,
      price,
      recommended_action: action,
      resulting_storage: waterTracker,
      calculated_revenue: revenue
    });
  }

  return schedule;
}

module.exports = { optimizeSchedule };
