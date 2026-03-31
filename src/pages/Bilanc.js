import React, { useState, useMemo, useCallback } from 'react';
import { useData, getOrderTotal } from '../DataContext';
import { useLang } from '../LanguageContext';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

export default function Bilanc() {
  const { orders, materials, setBilancStatus, addPayment } = useData();
  const { t } = useLang();
  const [tab, setTab] = useState('borxhe');
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState(null);
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('minus');

  const allBorxhe = useMemo(() => orders.filter(o => o.status === 'approved' && o.bilancStatus === 'borxhe'), [orders]);
  const allPaguar = useMemo(() => orders.filter(o => o.status === 'approved' && o.bilancStatus === 'paguar'), [orders]);

  const debtSummary = useMemo(() => {
    let totaliBorxheve = 0;
    let pjeserishtTePaguara = 0;
    for (const order of allBorxhe) {
      const total = getOrderTotal(order);
      totaliBorxheve += total - order.totalPaid;
      if (order.totalPaid > 0) pjeserishtTePaguara += order.totalPaid;
    }
    return { totaliBorxheve, pjeserishtTePaguara };
  }, [allBorxhe]);

  const totalPaguara = useMemo(() => allPaguar.reduce((sum, o) => sum + getOrderTotal(o), 0), [allPaguar]);

  const filterOrders = useCallback((list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(o => {
      const matNames = (o.items || []).map(item => {
        const mat = materials.find(m => m.id === item.materialId);
        return mat ? `${mat.code} ${mat.name}` : '';
      }).join(' ');
      return o.fullName?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q) ||
        o.phoneNumber?.toLowerCase().includes(q) ||
        matNames.toLowerCase().includes(q);
    });
  }, [search, materials]);

  const filteredBorxhe = useMemo(() => filterOrders(allBorxhe), [allBorxhe, filterOrders]);
  const filteredPaguar = useMemo(() => filterOrders(allPaguar), [allPaguar, filterOrders]);
  const filtered = tab === 'borxhe' ? filteredBorxhe : filteredPaguar;

  const getMatNames = (order) => (order.items || []).map(item => {
    const mat = materials.find(m => m.id === item.materialId);
    const name = mat ? mat.name : (item.materialName || 'Deleted Material');
    const code = mat ? mat.code : (item.materialCode || '?');
    return `[${code}] ${name}`;
  }).join(', ');

  const handleTogglePaid = (order) => {
    setBilancStatus(order.id, order.bilancStatus === 'borxhe' ? 'paguar' : 'borxhe');
  };

  const handlePaymentSubmit = () => {
    const val = parseFloat(payAmount);
    if (isNaN(val) || val <= 0) return;
    addPayment(paymentOrder.id, val, payMode);
    setPayAmount('');
  };

  const tabStyle = (tabName) => ({
    padding: '8px 20px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer',
    fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
    background: tab === tabName ? '#1a1a2e' : 'white', color: tab === tabName ? 'white' : '#555',
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e' }}>{t.bilancTitle}</h1>
        <p style={{ color: '#888', marginTop: 4 }}>{t.bilancSub}</p>
      </div>

      {tab === 'borxhe' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 4 }}>{t.totaliBorxheve}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{debtSummary.totaliBorxheve.toFixed(2)} <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>EUR</span></div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{t.totalRemainingUnpaid}</div>
          </div>
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 4 }}>{t.pjeserishtTePaguara}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{debtSummary.pjeserishtTePaguara.toFixed(2)} <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>EUR</span></div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{t.totalPartialPayments}</div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <div className="card" style={{ marginBottom: 0, maxWidth: 300 }}>
            <div style={{ fontSize: 13, color: '#888', fontWeight: 600, marginBottom: 4 }}>{t.totalPaguara}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'monospace' }}>{totalPaguara.toFixed(2)} <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>EUR</span></div>
          </div>
        </div>
      )}

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}>🔍</span>
        <input className="search-bar" style={{ paddingLeft: 36, marginBottom: 0 }} placeholder={t.searchBilanc}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button style={tabStyle('borxhe')} onClick={() => setTab('borxhe')}>
          {t.borxhe}
          {filteredBorxhe.length > 0 && <span style={{ background: '#ef4444', color: 'white', borderRadius: 6, padding: '1px 6px', fontSize: 11 }}>{filteredBorxhe.length}</span>}
        </button>
        <button style={tabStyle('paguara')} onClick={() => setTab('paguara')}>
          {t.tePaguara}
          {filteredPaguar.length > 0 && <span style={{ background: '#22c55e', color: 'white', borderRadius: 6, padding: '1px 6px', fontSize: 11 }}>{filteredPaguar.length}</span>}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 10, padding: '60px 20px', textAlign: 'center', border: '1px dashed #ddd' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontWeight: 600, color: '#555' }}>{tab === 'borxhe' ? t.noOutstandingDebts : t.noPaidOrders}</div>
          <div style={{ color: '#aaa', fontSize: 14, marginTop: 4 }}>
            {tab === 'borxhe' ? t.approvedOrdersAppear : t.paidOrdersAppear}
          </div>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{t.fullNameCol}</th>
              <th>{t.materialCol}</th>
              <th style={{ textAlign: 'right' }}>{t.totalCol}</th>
              <th style={{ textAlign: 'right' }}>{t.paidCol}</th>
              <th style={{ textAlign: 'right' }}>{t.remainingCol}</th>
              <th style={{ textAlign: 'right' }}>{t.actionsCol}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => {
              const total = getOrderTotal(order);
              const remaining = total - order.totalPaid;
              return (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.fullName}</td>
                  <td style={{ color: '#555', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getMatNames(order)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{total.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#22c55e' }}>{order.totalPaid.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{remaining.toFixed(2)}</td>
                  <td>
                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn" style={{ background: '#f3f4f6', color: '#374151' }} onClick={() => setDetailOrder(order)}>👁</button>
                      {tab === 'borxhe' && <button className="btn" style={{ background: '#f3f4f6', color: '#374151' }} onClick={() => { setPaymentOrder(order); setPayAmount(''); }}>✏️</button>}
                      <button className="btn" style={{ background: tab === 'borxhe' ? '#dcfce7' : '#fef3c7', color: tab === 'borxhe' ? '#16a34a' : '#d97706', fontSize: 12, fontWeight: 700 }}
                        onClick={() => handleTogglePaid(order)}>
                        {tab === 'borxhe' ? `✓ ${t.ePaguar}` : `↩ ${t.kthejeNeBorxhe}`}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{t.orderDetails} — {detailOrder.fullName}</div>
            <div style={{ fontSize: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div><strong>{t.phone}:</strong> {detailOrder.phoneNumber}</div>
              <div><strong>{t.location}:</strong> {detailOrder.location || '—'}</div>
              <div><strong>{t.dueDate}:</strong> {formatDate(detailOrder.dueDate)}</div>
              <hr />
              <strong>{t.materialsLabel}:</strong>
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
                {detailOrder.additionalCosts.map((ac, i) => (
                  <div key={i} style={{ paddingLeft: 12, color: '#555' }}>{ac.reason || t.additionalCosts}: {ac.amount.toFixed(2)} EUR</div>
                ))}
              </>}
              <hr />
              <div style={{ fontWeight: 700 }}>{t.total}: {getOrderTotal(detailOrder).toFixed(2)} EUR</div>
              {detailOrder.totalPaid > 0 && <div style={{ color: '#22c55e' }}>{t.paid}: {detailOrder.totalPaid.toFixed(2)} EUR</div>}
              <div style={{ color: '#ef4444', fontWeight: 700 }}>{t.remaining}: {(getOrderTotal(detailOrder) - detailOrder.totalPaid).toFixed(2)} EUR</div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setDetailOrder(null)}>{t.close}</button>
              <button className="btn btn-dark" onClick={() => {
                const original = document.title;
                document.title = `${detailOrder.fullName}_Info`;
                window.print();
                document.title = original;
              }}>🖨 {t.print}</button>
            </div>
          </div>
        </div>
      )}

      {paymentOrder && (
        <div className="modal-overlay" onClick={() => setPaymentOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ width: 460 }}>
            <div className="modal-title">{t.paymentTitle} — {paymentOrder.fullName}</div>
            <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#888' }}>{t.total}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{getOrderTotal(paymentOrder).toFixed(2)}</span>
              </div>
              {(paymentOrder.payments || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ color: '#888' }}>{p.type === 'minus' ? `- ${t.payment}` : `+ ${t.correction}`} <span style={{ fontSize: 11 }}>({new Date(p.date).toLocaleDateString()})</span></span>
                  <span style={{ fontFamily: 'monospace', color: p.type === 'minus' ? '#22c55e' : '#ef4444' }}>{p.type === 'minus' ? '-' : '+'} {p.amount.toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #eee', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>{t.toBePaid}</span>
                <span style={{ fontFamily: 'monospace', fontSize: 18 }}>{(getOrderTotal(paymentOrder) - paymentOrder.totalPaid).toFixed(2)}</span>
              </div>
            </div>
            <div className="form-group">
              <label>{t.addTransaction}</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #ddd' }}>
                  <button type="button" onClick={() => setPayMode('minus')}
                    style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', background: payMode === 'minus' ? '#22c55e' : '#f3f4f6', color: payMode === 'minus' ? 'white' : '#555', fontWeight: 700, fontSize: 16 }}>−</button>
                  <button type="button" onClick={() => setPayMode('plus')}
                    style={{ width: 40, height: 40, border: 'none', cursor: 'pointer', background: payMode === 'plus' ? '#ef4444' : '#f3f4f6', color: payMode === 'plus' ? 'white' : '#555', fontWeight: 700, fontSize: 16 }}>+</button>
                </div>
                <input type="number" min="0" step="0.01" placeholder="Amount" value={payAmount}
                  onChange={e => setPayAmount(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
                <button className="btn btn-dark" onClick={handlePaymentSubmit}>{t.apply}</button>
              </div>
              <span style={{ fontSize: 12, color: '#888' }}>
                {payMode === 'minus' ? t.subtractPayment : t.addCorrection}
              </span>
            </div>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setPaymentOrder(null)}>{t.close}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}