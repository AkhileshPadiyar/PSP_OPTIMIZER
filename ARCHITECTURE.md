# PSPOPTIMIZER_LITE

## Complete System Architecture Specification

### Pumped Storage Hydro Power Plant Scheduling Simulator
---

# 1. Project Objective

The application represents a simplified Decision Support System (DSS) similar to the one used in electric utility organizations such as THDCIL.

The objective is to:

* Upload 24-hour electricity market prices
* Simulate plant scheduling decisions
* Calculate hourly storage levels
* Calculate daily revenue
* Display operational analytics
* Maintain historical optimization reports

---

# 2. Technology Stack

## Frontend

* React (Vite)
* React Router v6
* Tailwind CSS
* Axios
* Recharts

## Backend

* Node.js
* Express.js

## Database

* MySQL 8+

For Database connection used the mysql2 package.

Used plain SQL queries only.

---

# 3. Project Structure

```
PSPOPTIMIZER_LITE/

│
├── backend/
│   ├── config/
│   │      db.js
│   │
│   ├── routes/
│   │      dashboardRoutes.js
│   │      marketRoutes.js
│   │      optimizerRoutes.js
│   │
│   ├── controllers/
│   │      dashboardController.js
│   │      marketController.js
│   │      optimizerController.js
│   │
│   ├── services/
│   │      optimizer.js
│   │
│   ├── schema.sql
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │
│   ├── components/
│   │      Sidebar.jsx
│   │      StatCard.jsx
│   │      RevenueCard.jsx
│   │      StorageBar.jsx
│   │      AdvisoryConsole.jsx
│   │      ScheduleTable.jsx
│   │
│   ├── pages/
│   │      Dashboard.jsx
│   │      TariffUpload.jsx
│   │      OptimizationResults.jsx
│   │      HistoryLog.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── README.md
```


---

# 4. Database Design

The backend consist three tables.

## Database

```
psp_optimizer_db
```

---

## Table 1

### plant_settings

Stores physical operating limits.

Columns

```
id
plant_name
efficiency_rate
max_storage_mwh
min_storage_mwh
current_storage_mwh
```

Seeded exactly one default row.

```
Tehri PSP Unit-1

Efficiency = 0.80

Maximum Storage = 1000 MWh

Minimum Storage = 100 MWh

Current Storage = 500 MWh
```

---

## Table 2

### market_tariffs

Stores uploaded day-ahead electricity prices.

Columns

```
id

tariff_date

hour_block

price_per_mwh_inr
```

Exactly 24 rows per date.

Hour values must be

```
0

1

2

...

23
```

Duplicate uploads overwrite existing values using

```
ON DUPLICATE KEY UPDATE
```

---

## Table 3

### optimization_schedules

Stores optimizer output.

Columns

```
id

run_date

hour_block

price_per_mwh_inr

recommended_action

resulting_storage_mwh

calculated_revenue_inr

created_at
```

---

# 5. REST API Specification

Base URL

```
/api/v1
```

---

## GET

```
/dashboard
```

Returns

```
Plant information

Today's revenue

Generated energy

Pumped energy
```

Status

```
200 OK
```

---

## POST

```
/market/upload
```

Request

```
{
   date,

   tariffs:[

      {hour,price}

   ]
}
```

Validation

* Exactly 24 tariff values
* Hour values 0–23
* Numeric prices only

Status

```
201 Created
```

---

## POST

```
/optimizer/run
```

Request

```
{
   "date":"YYYY-MM-DD"
}
```

Execution Flow

1. Read plant settings.

2. Read market prices.

3. Execute optimizer.js.

4. Delete existing schedule for that day.

5. Insert 24 new rows.

6. Update current_storage_mwh.

Response

```
Daily revenue

Hourly schedule

Storage profile
```

Status

```
200 OK
```

---

## GET

```
/optimizer/history
```

Returns

Daily summaries grouped by run_date.

Status

```
200 OK
```

---

# 6. Optimizer Algorithm

All scheduling logic must exist inside

```
backend/services/optimizer.js
```

The algorithm must be deterministic.

No AI.

No ML.

No randomness.

---

## Constants

```
Pump = 100 MWh

Generate = 100 MWh

Efficiency = 80%
```

Generation requires

```
100 / 0.80

=

125 MWh

of stored water.
```

---

## Algorithm

Input

```
Tariffs

Current Storage

Maximum Storage

Minimum Storage

Efficiency
```

Step 1

Sort prices in ascending order.

Step 2

Select

Lowest 6 hours

↓

Pump Hours

Step 3

Select

Highest 6 hours

↓

Generate Hours

Step 4

Initialize

```
waterTracker
```

Step 5

Loop

```
Hour 0

↓

Hour 23
```

### Pump Rule

If

Current hour belongs to cheapest six

AND

Storage +100 ≤ Maximum

```
Action = PUMP

Storage +=100

Revenue = -(100 × Price)
```

---

### Generate Rule

If

Current hour belongs to highest six

AND

Storage−125 ≥ Minimum

```
Action = GENERATE

Storage -=125

Revenue = +(100 × Price)
```

---

### Hold Rule

Otherwise

```
Action = HOLD

Revenue = 0

Storage unchanged
```

---

Each iteration produces

```
{

hour,

price,

recommended_action,

resulting_storage,

calculated_revenue

}
```

Return

Exactly

24 entries.

---

# 7. Frontend Pages

The application contains exactly four pages.

---

## Dashboard

Displays

* Current Storage
* Revenue
* Efficiency
* Advisory Console

Top cards

```
Storage

Revenue

Efficiency
```

Storage card includes a progress bar.

Blue

↓

Normal

Red

↓

Near minimum storage.

---

## Tariff Upload

Contains

* Date picker
* 24 hourly inputs
* Submit button

Submit uploads all prices through Axios.

---

## Optimization Results

Contains

### Chart 1

Line Chart

Hourly prices

### Chart 2

Area Chart

Reservoir storage profile

Below charts

Schedule table.

Color rules

PUMP

Blue

GENERATE

Green

HOLD

Slate

---

## History

Displays

Historical optimization runs.

Each row contains

* Date
* Revenue
* Pump count
* Generate count
* Hold count


---
