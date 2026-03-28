import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Create from './pages/Create';
import Orders from './pages/Orders';
import Bilanc from './pages/Bilanc';
import Materials from './pages/Materials';
import CarInsurance from './pages/CarInsurance';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">Granimor</div>
          <div className="navbar-links">
            <NavLink to="/create" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Create</NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Order</NavLink>
            <NavLink to="/bilanc" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Bilanc</NavLink>
            <NavLink to="/materials" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Materials</NavLink>
            <NavLink to="/car-insurance" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Car Insurance</NavLink>
          </div>
        </nav>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Orders />} />
            <Route path="/create" element={<Create />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/bilanc" element={<Bilanc />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/car-insurance" element={<CarInsurance />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;