# TripSplit Budget - Implementation Plan

## 1. Foundation & Design System
- [ ] Clean up Vite boilerplate (App.jsx, index.css)
- [ ] Install dependencies: `react-router-dom`, `lucide-react`
- [ ] Define Design System in `index.css`:
    - Premium color palette (HSL variables) with vibrant gradients
    - Typography (Inter or built-in system fonts)
    - CSS utility classes for glassmorphism, spacing, and layout

## 2. Core Navigation & Routing
- [ ] Set up `BrowserRouter` in `main.jsx`
- [ ] Create `App.jsx` with routes:
    - `/` (Home: Create or Join Trip)
    - `/trip/:tripId` (Trip Dashboard)
    - `/trip/:tripId/add` (Add Expense)
    - `/trip/:tripId/settle` (Settlement View)

## 3. Feature: Home Page (Landing)
- [ ] Hero section with "Create a Trip" and "Join a Trip" actions
- [ ] "Create Trip" flow: Generate unique ID, set trip name
- [ ] "Join Trip" flow: Enter Code/Link, Enter User Name

## 4. Feature: Trip Dashboard
- [ ] Header with Trip Info & Share Link
- [ ] "Your Balance" summary cards
- [ ] Recent Activity / Expenses List
- [ ] Floating Action Button for "Add Expense"

## 5. Feature: Add Expense
- [ ] Form for Amount, Description, Payer, and Split Details (Equal vs Custom)

## 6. Logic: Settlement Engine
- [ ] Calculate "Who owes Example"
- [ ] Visual graph or simple list of debts
