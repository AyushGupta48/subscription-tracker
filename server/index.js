const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup using lowdb (plain JSON file, no compilation needed)
const adapter = new FileSync(path.join(__dirname, "db.json"));
const db = low(adapter);

// Set default structure
if (!db.has("subscriptions").value()) db.set("subscriptions", []).write();
if (!db.has("nextId").value()) db.set("nextId", 1).write();

// Helper: calculate next billing date
function getNextBillingDate(startDate, billingCycle) {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let next = new Date(start);

  while (next <= today) {
    if (billingCycle === "weekly") {
      next.setDate(next.getDate() + 7);
    } else if (billingCycle === "monthly") {
      next.setMonth(next.getMonth() + 1);
    } else if (billingCycle === "annually") {
      next.setFullYear(next.getFullYear() + 1);
    }
  }

  return next.toISOString().split("T")[0];
}

// Helper: get days until next billing
function getDaysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}

// Helper: enrich a subscription with computed fields
function enrich(sub) {
  const nextDate = getNextBillingDate(sub.start_date, sub.billing_cycle);
  const daysUntil = getDaysUntil(nextDate);
  return { ...sub, next_billing_date: nextDate, days_until: daysUntil };
}

// GET all subscriptions
app.get("/api/subscriptions", (req, res) => {
  const rows = db.get("subscriptions").sortBy("name").value();
  res.json(rows.map(enrich));
});

// GET upcoming (due in next 7 days)
app.get("/api/subscriptions/upcoming", (req, res) => {
  const rows = db.get("subscriptions").value();
  const upcoming = rows
    .map(enrich)
    .filter((s) => s.days_until <= 7)
    .sort((a, b) => a.days_until - b.days_until);
  res.json(upcoming);
});

// POST add subscription
app.post("/api/subscriptions", (req, res) => {
  const { name, amount, billing_cycle, start_date, category, color } = req.body;

  if (!name || !amount || !billing_cycle || !start_date) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const id = db.get("nextId").value();
  db.update("nextId", (n) => n + 1).write();

  const newSub = {
    id,
    name,
    amount: parseFloat(amount),
    billing_cycle,
    start_date,
    category: category || "Other",
    color: color || "#6b7280",
    created_at: new Date().toISOString(),
  };

  db.get("subscriptions").push(newSub).write();
  res.status(201).json(enrich(newSub));
});

// PUT update subscription
app.put("/api/subscriptions/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, amount, billing_cycle, start_date, category, color } = req.body;

  const sub = db.get("subscriptions").find({ id }).value();
  if (!sub) return res.status(404).json({ error: "Not found" });

  db.get("subscriptions")
    .find({ id })
    .assign({ name, amount: parseFloat(amount), billing_cycle, start_date, category, color })
    .write();

  const updated = db.get("subscriptions").find({ id }).value();
  res.json(enrich(updated));
});

// DELETE subscription
app.delete("/api/subscriptions/:id", (req, res) => {
  const id = parseInt(req.params.id);
  db.get("subscriptions").remove({ id }).write();
  res.json({ message: "Deleted" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
