import React, { useState, useMemo } from 'react';
import { useData } from '../DataContext';

function isExpired(endDate) { return new Date(endDate) < new Date(); }
function isExpiringSoon(endDate) {
  const diff = new Date(endDate).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

export default function CarInsurance() {
  const { cars, addCar, updateCar, deleteCar } = useData();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [carName, setCarName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredCars = useMemo(() => {
    if (!search.trim()) return cars;
    const q = search.toLowerCase();
    return cars.filter(c => c.carName?.toLowerCase().includes(q) || c.plateNumber?.toLowerCase().includes(q));
  }, [cars, search]);

  const openCreate = () => {
    setEditing(null);
    setCarName(''); setPlateNumber(''); setStartDate(''); setEndDate('');
    setDialogOpen(true);
  };

  const openEdit = (ci) => {
    setEditing(ci);
    setCarName(ci.carName); setPlateNumber(ci.plateNumber);
    setStartDate(ci.startDate); setEndDate(ci.endDate);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!carName.trim() || !plateNumber.trim() || !startDate || !endDate) return;
    const data = { carName: carName.trim(), plateNumber: plateNumber.trim().toUpperCase(), startDate, endDate };
    editing ? updateCar(editing.id, data) : addCar(data);
    setDialogOpen(false);
  };

  const StatusBadge = ({ endDate }) => {
    const expired = isExpired(endDate);
    const expiring = isExpiringSoon(endDate);
    const style = expired
      ? { background: '#fee2e2', color: '#ef4444' }
      : expiring
      ? { background: '#fef3c7', color: '#d97706' }
      : { background: '#dcfce7', color: '#16a34a' };
    const label = expired ? 'Expired' : expiring ? 'Expiring Soon' : 'Active';
    return <span style={{ ...style, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{label}</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>Car Insurance</h1>
          <p style={{ color: '#888', marginTop: 4 }}>Track vehicle insurance policies and expiration dates</p>
        </div>
        <button className="btn btn-dark" onClick={openCreate}>+ Add Car</button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔍</span>
        <input className="search-bar" style={{ paddingLeft: 36, marginBottom: 0 }} placeholder="Search by car name or plate number..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filteredCars.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 10, padding: '60px 20px', textAlign: 'center', border: '1px dashed #ddd' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🚗</div>
          <div style={{ fontWeight: 600, color: '#555' }}>{search.trim() ? 'No cars found' : 'No cars registered'}</div>
          <div style={{ color: '#aaa', fontSize: 14, marginTop: 4 }}>
            {search.trim() ? 'Try a different search term' : 'Add your first vehicle to track its insurance'}
          </div>
          {!search.trim() && <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={openCreate}>+ Add Car</button>}
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Car</th>
              <th>Plate Number</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.map(ci => (
              <tr key={ci.id}>
                <td style={{ fontWeight: 600 }}>{ci.carName}</td>
                <td style={{ fontFamily: 'monospace' }}>{ci.plateNumber}</td>
                <td style={{ color: '#555' }}>{ci.startDate ? new Date(ci.startDate).toLocaleDateString() : '—'}</td>
                <td style={{ color: '#555' }}>{ci.endDate ? new Date(ci.endDate).toLocaleDateString() : '—'}</td>
                <td><StatusBadge endDate={ci.endDate} /></td>
                <td>
                  <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn" style={{ background: '#f3f4f6', color: '#374151' }} onClick={() => openEdit(ci)}>✏️</button>
                    <button className="btn" style={{ background: '#fee2e2', color: '#ef4444' }} onClick={() => setDeleteConfirmId(ci.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add/Edit Modal */}
      {dialogOpen && (
        <div className="modal-overlay" onClick={() => setDialogOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 480 }}>
            <div className="modal-title">{editing ? 'Edit Car Insurance' : 'Add Car Insurance'}</div>
            <div className="form-group">
              <label>Car Name (Make and Model) *</label>
              <input value={carName} onChange={e => setCarName(e.target.value)} placeholder="e.g. Mercedes-Benz Sprinter" />
            </div>
            <div className="form-group">
              <label>Plate Number *</label>
              <input value={plateNumber} onChange={e => setPlateNumber(e.target.value)} placeholder="e.g. AA 123 BB" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date *</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>End Date *</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setDialogOpen(false)}>Cancel</button>
              <button className="btn btn-dark" onClick={handleSubmit}>{editing ? 'Save Changes' : 'Add Car'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 400 }}>
            <div className="modal-title">Delete Car</div>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>Are you sure you want to delete this car insurance record? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn btn-red" onClick={() => { deleteCar(deleteConfirmId); setDeleteConfirmId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}