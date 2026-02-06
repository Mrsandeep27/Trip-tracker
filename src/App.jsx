import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import Settlement from './pages/Settlement';

function App() {
  return (
    <TripProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trip/:tripId" element={<Dashboard />} />
            <Route path="/trip/:tripId/add" element={<AddExpense />} />
            <Route path="/trip/:tripId/settle" element={<Settlement />} />
          </Routes>
        </div>
      </Router>
    </TripProvider>
  );
}

export default App;
