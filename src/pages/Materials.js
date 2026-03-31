import React, { useState, useMemo } from 'react';
import { useData } from '../DataContext';
import { useLang } from '../LanguageContext';

export default function Materials() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useData();
  const { t } = useLang();
  const [tab, setTab] = useState('standard');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [matType, setMatType] = useState('standard');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [pricePerM2, setPricePerM2] = useState('');
  const [price, setPrice] = useState('');
  const [count, setCount] = useState('');

  const standardMaterials = useMemo(() => {
    const filtered = materials.filter(m => m.type === 'standard');
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || String(m.count).toLowerCase().includes(q));
  }, [materials, search]);

  const handcraftMaterials = useMemo(() => {
    const filtered = materials.filter(m => m.type === 'handcraft');
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(m => m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || String(m.count).toLowerCase().includes(q));
  }, [materials, search]);

  const openCreate = () => {
    setEditingMaterial(null);
    setMatType(tab);
    setName(''); setCode(''); setPricePerM2(''); setPrice(''); setCount('');
    setDialogOpen(true);
  };

  const openEdit = (m) => {
    setEditingMaterial(m);
    setMatType(m.type);
    setName(m.name); setCode(m.code);
    setPricePerM2(String(m.pricePerM2 || '')); setPrice(String(m.price || '')); setCount(String(m.count || ''));
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !code.trim()) return;
    if (matType === 'standard') {
      const pVal = parseFloat(pricePerM2);
      if (isNaN(pVal) || pVal < 0) return;
      const data = { type: 'standard', name: name.trim(), code: code.trim(), pricePerM2: pVal, price: 0, count: count.trim() };
      editingMaterial ? updateMaterial(editingMaterial.id, data) : addMaterial(data);
    } else {
      const pVal = parseFloat(price);
      if (isNaN(pVal) || pVal < 0) return;
      const data = { type: 'handcraft', name: name.trim(), code: code.trim(), pricePerM2: 0, price: pVal, count: count.trim() };
      editingMaterial ? updateMaterial(editingMaterial.id, data) : addMaterial(data);
    }
    setDialogOpen(false);
  };

  const tabStyle = (tabName) => ({
    padding: '8px 20px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer',
    fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
    background: tab === tabName ? '#1a1a2e' : 'white', color: tab === tabName ? 'white' : '#555',
  });

  const currentList = tab === 'standard' ? standardMaterials : handcraftMaterials;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>{t.materialsTitle}</h1>
          <p style={{ color: '#888', marginTop: 4 }}>{t.materialsSub}</p>
        </div>
        <button className="btn btn-dark" onClick={openCreate}>+ {t.addMaterialBtn}</button>
      </div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔍</span>
        <input className="search-bar" style={{ paddingLeft: 36, marginBottom: 0 }} placeholder={t.searchMaterials}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={tabStyle('standard')} onClick={() => setTab('standard')}>
          🪨 {t.standardMaterials}
          {standardMaterials.length > 0 && <span style={{ background: '#e5e7eb', color: '#374151', borderRadius: 6, padding: '1px 6px', fontSize: 11 }}>{standardMaterials.length}</span>}
        </button>
        <button style={tabStyle('handcraft')} onClick={() => setTab('handcraft')}>
          🔨 {t.handcraftMaterials}
          {handcraftMaterials.length > 0 && <span style={{ background: '#e5e7eb', color: '#374151', borderRadius: 6, padding: '1px 6px', fontSize: 11 }}>{handcraftMaterials.length}</span>}
        </button>
      </div>

      {currentList.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 10, padding: '60px 20px', textAlign: 'center', border: '1px dashed #ddd' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{tab === 'standard' ? '🪨' : '🔨'}</div>
          <div style={{ fontWeight: 600, color: '#555' }}>{tab === 'standard' ? t.noMaterialsYet : t.noHandcraftYet}</div>
          <div style={{ color: '#aaa', fontSize: 14, marginTop: 4 }}>{t.addMaterialBtn}</div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{t.code}</th>
              <th>{t.materialName}</th>
              <th style={{ textAlign: 'right' }}>{tab === 'standard' ? t.pricePerM2 : t.price}</th>
              <th style={{ textAlign: 'right' }}>{t.count}</th>
              <th style={{ textAlign: 'right' }}>{t.actionsCol}</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map(m => (
              <tr key={m.id}>
                <td style={{ fontFamily: 'monospace', color: '#888' }}>{m.code || '-'}</td>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  {tab === 'standard' ? `${Number(m.pricePerM2).toFixed(2)} EUR` : `${Number(m.price).toFixed(2)} EUR`}
                </td>
                <td style={{ textAlign: 'right' }}>{m.count || '-'}</td>
                <td>
                  <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn" style={{ background: '#f3f4f6', color: '#374151' }} onClick={() => openEdit(m)}>✏️</button>
                    <button className="btn" style={{ background: '#fee2e2', color: '#ef4444' }} onClick={() => setDeleteConfirmId(m.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {dialogOpen && (
        <div className="modal-overlay" onClick={() => setDialogOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 500 }}>
            <div className="modal-title">{editingMaterial ? t.editMaterial : t.addMaterialTitle}</div>
            <div className="form-group">
              <label>{t.materialType}</label>
              <select value={matType} onChange={e => setMatType(e.target.value)} disabled={!!editingMaterial}
                style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                <option value="standard">{t.standardMaterials}</option>
                <option value="handcraft">{t.handcraftMaterials}</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>{t.materialName} *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Granite Nero" />
              </div>
              <div className="form-group">
                <label>{t.materialCode} *</label>
                <input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. GNA-001" />
              </div>
            </div>
            <div className="form-row">
              {matType === 'standard' ? (
                <div className="form-group">
                  <label>{t.pricePerM2} *</label>
                  <input type="number" min="0" step="0.01" value={pricePerM2} onChange={e => setPricePerM2(e.target.value)} placeholder="e.g. 45.00" />
                </div>
              ) : (
                <div className="form-group">
                  <label>{t.price} *</label>
                  <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 25.00" />
                </div>
              )}
              <div className="form-group">
                <label>{t.count}</label>
                <input value={count} onChange={e => setCount(e.target.value)} placeholder={matType === 'standard' ? 'e.g. 4 pieces of 12x12x0.1' : 'e.g. 50'} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setDialogOpen(false)}>{t.cancel}</button>
              <button className="btn btn-dark" onClick={handleSubmit}>{editingMaterial ? t.saveChanges : t.addMaterialBtn}</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 400 }}>
            <div className="modal-title">{t.deleteMaterial}</div>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 20 }}>{t.deleteMaterialConfirm}</p>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setDeleteConfirmId(null)}>{t.cancel}</button>
              <button className="btn btn-red" onClick={() => { deleteMaterial(deleteConfirmId); setDeleteConfirmId(null); }}>{t.delete}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}