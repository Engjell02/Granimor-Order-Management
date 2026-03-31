# Granimor Order Management System

A desktop application built for **Granimor** — a granite and marble supplier — to manage orders, payments, materials, and car insurance.

## Features

- 📋 **Orders** — Create, approve, decline, and track stone orders
- 💰 **Balance** — Track debts and payments per client
- 🪨 **Materials** — Manage standard and handcraft material inventory
- 🚗 **Car Insurance** — Track vehicle insurance expiry dates
- 🖨 **Invoice Printing** — Generate and print editable invoices (EN/MK/AL)
- 💾 **Backup & Restore** — Export and import all data as JSON
- 🌐 **3 Languages** — English, Macedonian, Albanian

## Tech Stack

- React, Electron, localStorage
- Packaged as a portable Windows `.exe`

## Getting Started
```bash
npm install
npm start          # Run in browser
npm run electron   # Run as desktop app
npm run electron:build  # Build .exe
```

## Data Storage

App data is stored locally at:
```
C:\Users\[Username]\AppData\Roaming\granimor\Local Storage\
```
Use the **💾 Backup** button regularly to export your data to a safe location.
