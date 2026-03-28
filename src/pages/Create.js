import React, { useState, useMemo } from 'react';
import { useData } from '../DataContext';
import { useNavigate } from 'react-router-dom';

function parseDimensions(input) {
  const parts = input.toLowerCase().split('x').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  if (parts.length === 0) return 0;
  if (parts.length >= 2) return parts[0] * parts[1];
  return parts[0];
}
function formatDimensions(input) {
  const parts = input.toLowerCase().split('x').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
  if (parts.length >= 2) return `${parts[0]}x${parts[1]}`;
  if (parts.length === 1) return `${parts[0]}`;
  return input;
}
function sanitizeDimension(value) {
  const cleaned = value.replace(/[^0-9.]/g, '');  // Remove anything that's not a digit or period
  const parts = cleaned.split('.');  // Prevent multiple decimal points
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  return cleaned;
}
export default function Create() {
  const { materials, addOrder } = useData();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [comment, setComment] = useState('');
  const [materialItems, setMaterialItems] = useState([{ materialId: '', dimensions: '', quantity: '1' }]);
  const [additionalCosts, setAdditionalCosts] = useState([]);

  const standardMaterials = materials.filter(m => m.type === 'standard');
  const handcraftMaterials = materials.filter(m => m.type === 'handcraft');

  function addMaterialItem() { setMaterialItems(prev => [...prev, { materialId: '', dimensions: '', quantity: '1' }]); }
  function removeMaterialItem(i) { setMaterialItems(prev => prev.filter((_, idx) => idx !== i)); }
  function updateMaterialItem(i, field, value) { setMaterialItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item)); }
  function addAdditionalCost() { setAdditionalCosts(prev => [...prev, { amount: '', reason: '' }]); }
  function removeAdditionalCost(i) { setAdditionalCosts(prev => prev.filter((_, idx) => idx !== i)); }
  function updateAdditionalCost(i, field, value) { setAdditionalCosts(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item)); }

  const computedItems = useMemo(() => {
    return materialItems.map(item => {
      const mat = materials.find(m => m.id === item.materialId);
      if (!mat) return { ...item, area: 0, cost: 0, material: null };
      if (mat.type === 'handcraft') {
        const qty = parseInt(item.quantity) || 1;
        return { ...item, area: 0, cost: mat.price * qty, material: mat };
      } else {
        const area = parseDimensions(item.dimensions);
        return { ...item, area, cost: area * mat.pricePerM2, material: mat };
      }
    });
  }, [materialItems, materials]);

  const itemsTotal = computedItems.reduce((sum, item) => sum + item.cost, 0);
  const addTotal = additionalCosts.reduce((sum, ac) => sum + (parseFloat(ac.amount) || 0), 0);
  const grandTotal = itemsTotal + addTotal;
  const hasValidItems = computedItems.some(item => item.material && (item.material.type === 'handcraft' || item.dimensions.trim()));

  function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim() || !hasValidItems) return;
    const items = computedItems
      .filter(item => item.material && (item.material.type === 'handcraft' || item.dimensions.trim()))
      .map(item => ({
        materialId: item.materialId,
        materialName: item.material.name,
        materialCode: item.material.code,
        dimensions: item.material.type === 'handcraft' ? '' : item.dimensions.trim(),
        area: item.area, cost: item.cost,
        quantity: item.material.type === 'handcraft' ? parseInt(item.quantity) || 1 : 1,
      }));
    const costs = additionalCosts.filter(ac => parseFloat(ac.amount) > 0)
      .map(ac => ({ amount: parseFloat(ac.amount), reason: ac.reason.trim() }));
    addOrder({ fullName: fullName.trim(), location: location.trim(), phoneNumber: phoneNumber.trim(), dueDate, items, additionalCosts: costs, comment: comment.trim() });
    navigate('/orders');
  }

  return (
    <div style={{ maxWidth: 780, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>Create Order</h1>
        <p style={{ color: '#888', marginTop: 4 }}>Fill in the details to create a new stone order</p>
      </div>
      <form onSubmit={handleSubmit}>

        {/* Client Info */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Client Information</div>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter client name" required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+355 6X XXX XXXX" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Tirana, Albania" />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Materials */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Materials *</div>
            <button type="button" className="btn btn-dark" style={{ fontSize: 13 }} onClick={addMaterialItem}>+ Add Material</button>
          </div>
          {materials.length === 0 ? (
            <div style={{ padding: '10px 14px', border: '1px dashed #ddd', borderRadius: 8, fontSize: 14, color: '#888' }}>
              No materials available. Please add in <a href="/materials" style={{ color: '#1a1a2e', fontWeight: 600 }}>Materials</a> first.
            </div>
          ) : (
            materialItems.map((item, index) => {
              const mat = materials.find(m => m.id === item.materialId);
              const computed = computedItems[index];
              return (
                <div key={index} style={{ border: '1px solid #eee', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>Item {index + 1}</span>
                    {materialItems.length > 1 && (
                      <button type="button" onClick={() => removeMaterialItem(index)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>🗑</button>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Material</label>
                    <select value={item.materialId} onChange={e => updateMaterialItem(index, 'materialId', e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: '100%' }}>
                      <option value="">Select a material</option>
                      {standardMaterials.length > 0 && <optgroup label="Materials">
                        {standardMaterials.map(m => <option key={m.id} value={m.id}>[{m.code}] {m.name}</option>)}
                      </optgroup>}
                      {handcraftMaterials.length > 0 && <optgroup label="Hand Craft Materials">
                        {handcraftMaterials.map(m => <option key={m.id} value={m.id}>[{m.code}] {m.name} (Hand Craft)</option>)}
                      </optgroup>}
                    </select>
                  </div>
                  {mat && mat.type === 'standard' && (
                    <div className="form-group">
                      <label>Dimensions (meters)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <input
                          type="text" min="0" step="any"
                          placeholder="Length"
                          value={item.dimensions ? item.dimensions.split('x')[0] || '' : ''}
                          onChange={e => {
                            const width = item.dimensions ? item.dimensions.split('x')[1] || '' : '';
                            updateMaterialItem(index, 'dimensions', `${sanitizeDimension(e.target.value)}x${width}`);
                          }}
                          style={{ width: 120, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                        />
                        <span style={{ fontWeight: 700, fontSize: 18, color: '#555' }}>×</span>
                        <input
                          type="text" min="0" step="any"
                          placeholder="Width"
                          value={item.dimensions ? item.dimensions.split('x')[1] || '' : ''}
                          onChange={e => {
                            const length = item.dimensions ? item.dimensions.split('x')[0] || '' : '';
                            updateMaterialItem(index, 'dimensions', `${length}x${sanitizeDimension(e.target.value)}`);
                          }}
                          style={{ width: 120, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
                        />
                        <span style={{ whiteSpace: 'nowrap', fontSize: 13, color: '#888' }}>m²</span>
                      </div>
                      {item.dimensions && item.dimensions !== 'x' && computed?.area > 0 && (
                        <span style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          Calculated: <strong>{computed?.area.toFixed(4)} m²</strong> | Cost: <strong>{computed?.cost.toFixed(2)} EUR</strong>
                        </span>
                      )}
                    </div>
                  )}
                  {mat && mat.type === 'handcraft' && (
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="number" min="1" value={item.quantity} onChange={e => updateMaterialItem(index, 'quantity', e.target.value)} />
                      <span style={{ fontSize: 12, color: '#888' }}>Price per unit: <strong>{mat.price.toFixed(2)} EUR</strong> | Total: <strong>{computed?.cost.toFixed(2)} EUR</strong></span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Additional Costs */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Additional Costs</div>
            <button type="button" className="btn btn-dark" style={{ fontSize: 13 }} onClick={addAdditionalCost}>+ Add Cost</button>
          </div>
          {additionalCosts.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>No additional costs added.</p>}
          {additionalCosts.map((ac, index) => (
            <div key={index} style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
              <input type="number" min="0" step="0.01" placeholder="Amount (EUR)" value={ac.amount}
                onChange={e => updateAdditionalCost(index, 'amount', e.target.value)}
                style={{ width: 140, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
              <input placeholder="Reason for this cost" value={ac.reason}
                onChange={e => updateAdditionalCost(index, 'reason', e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
              <button type="button" onClick={() => removeAdditionalCost(index)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>🗑</button>
            </div>
          ))}
        </div>

        {/* Comment */}
        <div className="card">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Comment</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Any special notes or instructions..." rows={3} style={{ resize: 'vertical' }} />
          </div>
        </div>

        {/* Price Summary */}
        <div className="card">
          {computedItems.map((item, index) => {
            if (!item.material) return null;
            return (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 6 }}>
              <span>[{item.material.code}] {item.material.name}{item.material.type === 'standard' && item.dimensions ? ` (${formatDimensions(item.dimensions)})` : ''}{item.material.type === 'handcraft' ? ` x${item.quantity}` : ''}</span>
              <span style={{ fontFamily: 'monospace' }}>{item.cost.toFixed(2)} EUR</span>
              </div>
            );
          })}
          {additionalCosts.map((ac, index) => {
            const val = parseFloat(ac.amount) || 0;
            if (val <= 0) return null;
            return (
              <div key={`ac-${index}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 6 }}>
                <span>{ac.reason || 'Additional cost'}</span>
                <span style={{ fontFamily: 'monospace' }}>{val.toFixed(2)} EUR</span>
              </div>
            );
          })}
          <div style={{ borderTop: '2px solid #1a1a2e', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700 }}>
            <span>Total</span><span style={{ fontFamily: 'monospace' }}>{grandTotal.toFixed(2)} EUR</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8, marginBottom: 40 }}>
          <button type="button" className="btn btn-gray" onClick={() => navigate('/orders')}>Cancel</button>
          <button type="submit" className="btn btn-dark" disabled={!fullName.trim() || !hasValidItems}>Create Order</button>
        </div>
      </form>
    </div>
  );
}