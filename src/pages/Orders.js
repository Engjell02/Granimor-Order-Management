import React, { useState, useMemo } from 'react';
import { useData, getOrderTotal } from '../DataContext';
import { useLang } from '../LanguageContext';
import InvoiceModal from '../components/InvoiceModal';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

export default function Orders() {
  const { orders, materials, setOrderStatus, updateOrder, deleteOrder } = useData();
  const { t } = useLang();
  const [tab, setTab] = useState('pending');
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [editOrder, setEditOrder] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      if (o.status !== tab) return false;
      if (!q) return true;
      const matNames = (o.items || []).map(item => {
        const mat = materials.find(m => m.id === item.materialId);
        return mat ? `${mat.code} ${mat.name}` : '';
      }).join(' ');
      return o.fullName?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q) ||
        o.phoneNumber?.toLowerCase().includes(q) ||
        o.comment?.toLowerCase().includes(q) ||
        String(o.orderNumber || '').includes(q) ||
        matNames.toLowerCase().includes(q);
    });
  }, [orders, materials, tab, search]);

  const counts = useMemo(() => ({
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved').length,
    declined: orders.filter(o => o.status === 'declined').length,
  }), [orders]);

  const getMatNames = (order) => (order.items || []).map(item => {
    const mat = materials.find(m => m.id === item.materialId);
    const name = mat ? mat.name : (item.materialName || 'Deleted Material');
    const code = mat ? mat.code : (item.materialCode || '?');
    return `[${code}] ${name}`;
  }).join(', ');

  const openEdit = (order) => {
    setEditOrder(order);
    setEditForm({ fullName: order.fullName, location: order.location, phoneNumber: order.phoneNumber, dueDate: order.dueDate, comment: order.comment || '' });
  };

  const handleEditSave = () => {
    updateOrder(editOrder.id, editForm);
    setEditOrder(null);
  };

  const tabStyle = (status) => ({
    padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', fontSize: 14,
    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
    background: tab === status ? '#1a1a2e' : 'white', color: tab === status ? 'white' : '#555',
    transition: 'all 0.2s'
  });


  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>{t.ordersTitle}</h1>
        <p style={{ color: '#888', marginTop: 4 }}>{t.ordersSub}</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔍</span>
        <input className="search-bar" style={{ paddingLeft: 36, marginBottom: 0 }} placeholder={t.searchOrders}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['pending', 'approved', 'declined'].map(status => (
          <button key={status} style={tabStyle(status)} onClick={() => setTab(status)}>
            {status === 'pending' ? '🕐' : status === 'approved' ? '✓' : '✕'}
            {status === 'pending' ? t.pending : status === 'approved' ? t.approved : t.declined}
            {counts[status] > 0 && <span style={{ background: status === 'pending' ? '#ef4444' : '#e5e7eb', color: status === 'pending' ? 'white' : '#374151', borderRadius: 6, padding: '1px 6px', fontSize: 11 }}>{counts[status]}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 10, padding: '60px 20px', textAlign: 'center', border: '1px dashed #ddd' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, color: '#555' }}>{t.noOrders}</div>
          <div style={{ color: '#aaa', fontSize: 14, marginTop: 4 }}>{t.noPendingOrders}</div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t.fullNameCol}</th>
              <th>{t.materialCol}</th>
              <th style={{ textAlign: 'right' }}>{t.priceCol}</th>
              <th style={{ textAlign: 'right' }}>{t.actionsCol}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => {
              const total = getOrderTotal(order);
              return (
                <tr key={order.id}>
                  <td style={{ color: '#888', fontFamily: 'monospace', fontSize: 13 }}>#{order.orderNumber || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{order.fullName}</td>
                  <td style={{ color: '#555', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getMatNames(order)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{total.toFixed(2)}</td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn" style={{ background: '#f3f4f6', color: '#374151' }} onClick={() => setDetailOrder(order)} title="View details">👁</button>
                      <button className="btn" style={{ background: '#f3f4f6', color: '#374151' }} onClick={() => openEdit(order)} title="Edit">✏️</button>
                      {tab !== 'pending' && <button className="btn btn-yellow" onClick={() => setOrderStatus(order.id, 'pending')} title="Move to pending">🕐</button>}
                      {tab !== 'declined' && <button className="btn btn-red" onClick={() => setOrderStatus(order.id, 'declined')} title="Decline">✕</button>}
                      {tab !== 'approved' && <button className="btn btn-green" onClick={() => setOrderStatus(order.id, 'approved')} title="Approve">✓</button>}
                      {tab === 'declined' && <button className="btn" style={{ background: '#fee2e2', color: '#ef4444' }} onClick={() => { if(window.confirm(t.deleteOrderConfirm)) deleteOrder(order.id); }} title="Delete">🗑</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Details Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{t.orderDetails}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div><strong>Full Name:</strong> {detailOrder.fullName}</div>
              <div><strong>Phone:</strong> {detailOrder.phoneNumber}</div>
              <div><strong>Location:</strong> {detailOrder.location || '—'}</div>
              <div><strong>Due Date:</strong> {formatDate(detailOrder.dueDate)}</div>
              <div><strong>Comment:</strong> {detailOrder.comment || '—'}</div>
              <hr />
              <strong>Materials:</strong>
              {(detailOrder.items || []).map((item, i) => {
                const mat = materials.find(m => m.id === item.materialId);
                const name = mat ? mat.name : (item.materialName || 'Deleted Material');
                const code = mat ? mat.code : (item.materialCode || '?');
                return <div key={i} style={{ paddingLeft: 12, color: '#555' }}>
                  [{code}] {name} {item.dimensions ? `— ${item.dimensions}` : ''}{item.quantity > 1 ? ` x${item.quantity}` : ''} — {item.cost.toFixed(2)} EUR
                </div>;
              })}
              {(detailOrder.additionalCosts || []).length > 0 && <>
                <hr />
                <strong>Additional Costs:</strong>
                {detailOrder.additionalCosts.map((ac, i) => (
                  <div key={i} style={{ paddingLeft: 12, color: '#555' }}>{ac.reason || 'Additional cost'}: {ac.amount.toFixed(2)} EUR</div>
                ))}
              </>}
              <hr />
              <div style={{ fontWeight: 700, fontSize: 16 }}>Total: {getOrderTotal(detailOrder).toFixed(2)} EUR</div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setDetailOrder(null)}>{t.close}</button>
              <button className="btn btn-dark" onClick={() => { setInvoiceOrder(detailOrder); setDetailOrder(null); }}>🖨 {t.print}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editOrder && (
        <div className="modal-overlay" onClick={() => setEditOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{t.editOrder}</div>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input value={editForm.fullName || ''} onChange={e => setEditForm(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={editForm.phoneNumber || ''} onChange={e => setEditForm(p => ({ ...p, phoneNumber: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input value={editForm.location || ''} onChange={e => setEditForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={editForm.dueDate || ''} onChange={e => setEditForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Comment</label>
              <textarea value={editForm.comment || ''} onChange={e => setEditForm(p => ({ ...p, comment: e.target.value }))} rows={3} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setEditOrder(null)}>{t.cancel}</button>
              <button className="btn btn-dark" onClick={handleEditSave}>{t.saveChanges}</button>
            </div>
          </div>
        </div>
      )}
      <InvoiceModal
        order={invoiceOrder}
        materials={materials}
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
    </div>
  );
}