import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MinerDashboard from "./pages/MinerDashboard";

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/:tag" element={<MinerDashboard />} />
    </Routes>
  </Router>
);

export default App;
