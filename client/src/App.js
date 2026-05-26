import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const API = "/api/subscriptions";

const CATEGORIES = ["Streaming", "Gaming", "Fitness", "Music", "News", "Software", "Cloud", "Other"];

const CATEGORY_COLORS = {
  Streaming: "#e50914",
  Gaming: "#107c10",
  Fitness: "#ff6b35",
  Music: "#1db954",
  News: "#1a73e8",
  Software: "#7c3aed",
  Cloud: "#0891b2",
  Other: "#6b7280",
};

const CYCLE_LABELS = { weekly: "Weekly", monthly: "Monthly", annually: "Annually" };

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);
}

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function DueBadge({ days }) {
  if (days === 0) return <span className="badge badge-danger">Due today</span>;
  if (days === 1) return <span className="badge badge-danger">Due tomorrow</span>;
  if (days <= 3) return <span className="badge badge-warn">In {days} days</span>;
  if (days <= 7) return <span className="badge badge-info">In {days} days</span>;
  return null;
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SubscriptionForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    amount: initial?.amount || "",
    billing_cycle: initial?.billing_cycle || "monthly",
    start_date: initial?.start_date || new Date().toISOString().split("T")[0],
    category: initial?.category || "Other",
    color: initial?.color || CATEGORY_COLORS["Other"],
  });

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      if (field === "category") next.color = CATEGORY_COLORS[val] || "#6b7280";
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.amount || !form.start_date) return;
    onSave(form);
  };

  return (
    <form className="sub-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>Subscription Name *</label>
        <input
          type="text"
          placeholder="e.g. Netflix, Spotify, Gym..."
          value={form.name}
          onChange={set("name")}
          required
        />
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label>Amount (AUD) *</label>
          <input
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={set("amount")}
            required
          />
        </div>
        <div className="form-row">
          <label>Billing Cycle *</label>
          <select value={form.billing_cycle} onChange={set("billing_cycle")}>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
      </div>
      <div className="form-grid">
        <div className="form-row">
          <label>First Billing Date *</label>
          <input type="date" value={form.start_date} onChange={set("start_date")} required />
        </div>
        <div className="form-row">
          <label>Category</label>
          <select value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary">
          {initial ? "Save Changes" : "Add Subscription"}
        </button>
      </div>
    </form>
  );
}

function SubscriptionCard({ sub, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const monthlyEquiv = sub.billing_cycle === "weekly"
    ? sub.amount * 4.33
    : sub.billing_cycle === "annually"
    ? sub.amount / 12
    : sub.amount;

  return (
    <div className="sub-card" style={{ "--card-color": sub.color }}>
      <div className="card-accent" />
      <div className="card-body">
        <div className="card-top">
          <div className="card-title-row">
            <span className="card-dot" style={{ background: sub.color }} />
            <h3 className="card-name">{sub.name}</h3>
            <span className="card-category">{sub.category}</span>
          </div>
          <DueBadge days={sub.days_until} />
        </div>

        <div className="card-amount">
          <span className="amount-main">{formatCurrency(sub.amount)}</span>
          <span className="amount-cycle">/ {sub.billing_cycle}</span>
          {sub.billing_cycle !== "monthly" && (
            <span className="amount-equiv">≈ {formatCurrency(monthlyEquiv)}/mo</span>
          )}
        </div>

        <div className="card-dates">
          <div className="date-item">
            <span className="date-label">Next payment</span>
            <span className="date-value">{formatDate(sub.next_billing_date)}</span>
          </div>
          <div className="date-item">
            <span className="date-label">Started</span>
            <span className="date-value">{formatDate(sub.start_date)}</span>
          </div>
        </div>

        <div className="card-actions">
          <button className="btn-edit" onClick={() => onEdit(sub)}>Edit</button>
          {confirming ? (
            <div className="confirm-row">
              <span className="confirm-text">Sure?</span>
              <button className="btn-confirm-yes" onClick={() => onDelete(sub.id)}>Yes</button>
              <button className="btn-confirm-no" onClick={() => setConfirming(false)}>No</button>
            </div>
          ) : (
            <button className="btn-delete" onClick={() => setConfirming(true)}>Delete</button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsBar({ subs }) {
  const monthly = subs.reduce((acc, s) => {
    const m = s.billing_cycle === "weekly"
      ? s.amount * 4.33
      : s.billing_cycle === "annually"
      ? s.amount / 12
      : s.amount;
    return acc + m;
  }, 0);

  const upcoming7 = subs.filter((s) => s.days_until <= 7).length;
  const annual = monthly * 12;

  return (
    <div className="stats-bar">
      <div className="stat">
        <span className="stat-value">{formatCurrency(monthly)}</span>
        <span className="stat-label">per month</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-value">{formatCurrency(annual)}</span>
        <span className="stat-label">per year</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-value">{subs.length}</span>
        <span className="stat-label">active</span>
      </div>
      <div className="stat-divider" />
      <div className="stat">
        <span className="stat-value" style={{ color: upcoming7 > 0 ? "var(--warn)" : "inherit" }}>
          {upcoming7}
        </span>
        <span className="stat-label">due this week</span>
      </div>
    </div>
  );
}

export default function App() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("name");
  const [notifAsked, setNotifAsked] = useState(false);

  const fetchSubs = useCallback(async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setSubs(data);
      setError(null);
    } catch (e) {
      setError("Could not connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  // Request notification permission + send alerts for upcoming
  useEffect(() => {
    if (!notifAsked && subs.length > 0) {
      setNotifAsked(true);
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") sendUpcomingNotifications(subs);
        });
      } else if (Notification.permission === "granted") {
        sendUpcomingNotifications(subs);
      }
    }
  }, [subs, notifAsked]);

  function sendUpcomingNotifications(subscriptions) {
    subscriptions
      .filter((s) => s.days_until <= 3)
      .forEach((s) => {
        const label =
          s.days_until === 0 ? "today" :
          s.days_until === 1 ? "tomorrow" :
          `in ${s.days_until} days`;
        new Notification(`SubTrack: ${s.name} due ${label}`, {
          body: `${formatCurrency(s.amount)} — ${s.billing_cycle}`,
          icon: "/favicon.ico",
        });
      });
  }

  async function handleAdd(form) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const newSub = await res.json();
    setSubs((prev) => [...prev, newSub].sort((a, b) => a.name.localeCompare(b.name)));
    setShowAdd(false);
  }

  async function handleEdit(form) {
    const res = await fetch(`${API}/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const updated = await res.json();
    setSubs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditing(null);
  }

  async function handleDelete(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setSubs((prev) => prev.filter((s) => s.id !== id));
  }

  const allCategories = ["All", ...CATEGORIES.filter((c) => subs.some((s) => s.category === c))];

  const filtered = subs
    .filter((s) => filter === "All" || s.category === filter)
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "amount") return b.amount - a.amount;
      if (sort === "due") return a.days_until - b.days_until;
      return 0;
    });

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <h1>SubTrack</h1>
          </div>
          <button className="btn-primary btn-add" onClick={() => setShowAdd(true)}>
            + Add Subscription
          </button>
        </div>
      </header>

      <main className="main">
        {error && <div className="error-banner">{error}</div>}

        {!loading && <StatsBar subs={subs} />}

        <div className="toolbar">
          <div className="filter-tabs">
            {allCategories.map((cat) => (
              <button
                key={cat}
                className={`filter-tab ${filter === cat ? "active" : ""}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="sort-row">
            <span className="sort-label">Sort by</span>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Name</option>
              <option value="amount">Amount</option>
              <option value="due">Due Date</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading subscriptions…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">◈</span>
            <p>{subs.length === 0 ? "No subscriptions yet. Add your first one!" : "No subscriptions in this category."}</p>
          </div>
        ) : (
          <div className="cards-grid">
            {filtered.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                sub={sub}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showAdd && (
        <Modal title="Add Subscription" onClose={() => setShowAdd(false)}>
          <SubscriptionForm onSave={handleAdd} onClose={() => setShowAdd(false)} />
        </Modal>
      )}

      {editing && (
        <Modal title="Edit Subscription" onClose={() => setEditing(null)}>
          <SubscriptionForm initial={editing} onSave={handleEdit} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
