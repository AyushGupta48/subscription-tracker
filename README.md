# SubTrack — Subscription Tracker

A full-stack desktop app to track all your recurring subscriptions in one place. Add services like Netflix, Spotify, or a gym membership and SubTrack automatically calculates your weekly, monthly, and annual spend — and sends browser notifications before payments are due.


---

## Why I Built It

Subscription costs creep up fast and it's easy to lose track of what you're actually paying across streaming services, software, and memberships. I built SubTrack as a personal utility to get a clear picture of my recurring spend and get a heads-up before anything renews.

---

## Features

- Add and manage subscriptions with name, amount, billing cycle, and billing date
- Automatic calculation of next payment date
- Dashboard showing **total monthly and annual spend**
- Countdown showing days until each subscription renews
- **Browser notifications** for payments due within 3 days
- Filter subscriptions by category
- Sort by name, amount, or due date
- Runs locally as a desktop app — data stored in a JSON file, no database setup required
- Windows batch scripts included for one-click launch and shutdown

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React, CSS                        |
| Backend    | Node.js, Express                  |
| Database   | lowdb (JSON file — no SQL needed) |
| Notifications | Web Notifications API          |
| Packaging  | Windows Batch scripts (.bat)      |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher

```bash
node --version  # confirm it's installed
```

### 1. Start the Backend

Open a terminal in the `server/` folder and run:

```bash
npm install
node index.js
```

You should see:
```
✅ Server running at http://localhost:3001
```

**Leave this terminal open** — the backend needs to keep running.

### 2. Start the Frontend

Open a second terminal in the `client/` folder and run:

```bash
npm install
npm start
```

The app opens automatically at `http://localhost:3000`.

### Windows Shortcut (Optional)

Run `Setup-Shortcut.bat` once to create a desktop shortcut. After that, double-click `SubTrack.bat` to launch the app, and `SubTrack-Stop.bat` to shut it down.

---

## Project Structure

```
subscription-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.js          # Main app component
│   │   └── App.css         # Styles
│   └── package.json
│
├── server/                 # Express backend
│   ├── index.js            # API routes + lowdb setup
│   ├── db.json             # Auto-generated data store
│   └── package.json
│
├── SubTrack.bat            # Launch app (Windows)
├── SubTrack-Stop.bat       # Stop app (Windows)
├── Setup-Shortcut.bat      # Create desktop shortcut (Windows)
└── README.md
```

---

## Troubleshooting

**"Could not connect to server"** — Make sure the backend is still running in its terminal window.

**Port already in use** — Restart your machine and try again, or check what's using ports 3000/3001.

**npm install fails** — Make sure you're running the command inside `client/` or `server/`, not the root folder.
