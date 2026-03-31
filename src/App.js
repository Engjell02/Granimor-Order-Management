import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Create from './pages/Create';
import Orders from './pages/Orders';
import Bilanc from './pages/Bilanc';
import Materials from './pages/Materials';
import CarInsurance from './pages/CarInsurance';
import { useLang } from './LanguageContext';
import './App.css';

function App() {
  const { t, lang, setLang } = useLang();
  const [showBackup, setShowBackup] = useState(false);

  const handleExport = () => {
    const data = {
      granimor_orders: localStorage.getItem('granimor_orders'),
      granimor_materials: localStorage.getItem('granimor_materials'),
      granimor_cars: localStorage.getItem('granimor_cars'),
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `granimor_backup_${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.granimor_orders) localStorage.setItem('granimor_orders', data.granimor_orders);
        if (data.granimor_materials) localStorage.setItem('granimor_materials', data.granimor_materials);
        if (data.granimor_cars) localStorage.setItem('granimor_cars', data.granimor_cars);
        alert('Backup restored successfully! The app will now reload.');
        window.location.reload();
      } catch {
        alert('Invalid backup file. Please select a valid Granimor backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">Granimor</div>
          <div className="navbar-links" style={{ flex: 1 }}>
            <NavLink to="/create" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>{t.create || 'Create'}</NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>{t.orders || 'Orders'}</NavLink>
            <NavLink to="/bilanc" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>{t.bilanc || 'Bilanc'}</NavLink>
            <NavLink to="/materials" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>{t.materials || 'Materials'}</NavLink>
            <NavLink to="/car-insurance" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>{t.carInsurance || 'Car Insurance'}</NavLink>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setShowBackup(true)} style={{
              padding: '5px 12px', borderRadius: 6, border: '1px solid #c9a84c', cursor: 'pointer',
              fontSize: 12, fontWeight: 600, background: 'transparent', color: '#c9a84c'
            }}>💾 Backup</button>
            <div style={{ display: 'flex', gap: 4 }}>
              {['en', 'mk', 'al'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  background: lang === l ? '#c9a84c' : '#2a2a4a', color: 'white', transition: 'all 0.2s'
                }}>{l.toUpperCase()}</button>
              ))}
            </div>
          </div>
        </nav>

        {/* Backup Modal */}
        {showBackup && (
          <div className="modal-overlay" onClick={() => setShowBackup(false)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 420 }}>
              <div className="modal-title">💾 Backup & Restore</div>
              <p style={{ fontSize: 14, color: '#555', marginBottom: 24 }}>
                Export your data to a file to keep it safe. You can restore it anytime from the same file.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button className="btn btn-dark" onClick={handleExport} style={{ padding: '12px 20px', fontSize: 14 }}>
                  📤 Export Backup
                </button>
                <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>— or —</div>
                <label style={{
                  display: 'block', padding: '12px 20px', background: '#f3f4f6', borderRadius: 8,
                  cursor: 'pointer', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#374151',
                  border: '2px dashed #ddd'
                }}>
                  📥 Import Backup
                  <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
                </label>
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 16, padding: '10px', background: '#fafafa', borderRadius: 8 }}>
                💡 Tip: Export your backup regularly to a USB drive or cloud storage to prevent data loss.
              </div>
              <div className="modal-actions">
                <button className="btn btn-gray" onClick={() => setShowBackup(false)}>Close</button>
              </div>
            </div>
          </div>
        )}

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