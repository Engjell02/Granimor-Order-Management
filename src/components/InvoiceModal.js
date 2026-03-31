import React, { useState, useRef, useEffect } from 'react';



const invoiceLang = {
  en: {
    offer: 'Offer', to: 'To', material: 'Material', no: 'No',
    services: 'Services', calculation: 'Calculation', total: 'Total',
    comment: 'Comment', date: 'Date prepared', regards: 'Best regards',
    materialRow: 'Material', cutting: 'Cutting & Gluing 45°',
    installation: 'Installation', installMaterials: 'Installation Materials',
    printBtn: 'Print Invoice', closeBtn: 'Close', editBtn: 'Edit',
    saveBtn: 'Save', invoiceTitle: 'Invoice', language: 'Invoice Language',
    companyInfo: 'Company Info', clientInfo: 'Client Info',
    addRow: 'Add Row', removeRow: 'Remove',
  },
  mk: {
    offer: 'Понуда', to: 'До', material: 'Материјал', no: 'бр',
    services: 'Услуги', calculation: 'Пресметка', total: 'Вкупно',
    comment: 'Коментар', date: 'Понудата е изработена на датум', regards: 'Со почит',
    materialRow: 'Материјал', cutting: 'Сечење и лепење на 45 степени',
    installation: 'Монтажа', installMaterials: 'Средства за монтажа',
    printBtn: 'Печати', closeBtn: 'Затвори', editBtn: 'Уреди',
    saveBtn: 'Зачувај', invoiceTitle: 'Фактура', language: 'Јазик на фактура',
    companyInfo: 'Информации за компанија', clientInfo: 'Информации за клиент',
    addRow: 'Додади ред', removeRow: 'Избриши',
  },
  al: {
    offer: 'Ofertë', to: 'Për', material: 'Materiali', no: 'Nr',
    services: 'Shërbimet', calculation: 'Llogaritja', total: 'Totali',
    comment: 'Koment', date: 'Oferta është përgatitur më', regards: 'Me respekt',
    materialRow: 'Materiali', cutting: 'Prerja dhe ngjitja 45°',
    installation: 'Montimi', installMaterials: 'Materiale montimi',
    printBtn: 'Printo', closeBtn: 'Mbyll', editBtn: 'Ndrysho',
    saveBtn: 'Ruaj', invoiceTitle: 'Faturë', language: 'Gjuha e faturës',
    companyInfo: 'Informacioni i kompanisë', clientInfo: 'Informacioni i klientit',
    addRow: 'Shto rresht', removeRow: 'Fshi',
  }
};

export default function InvoiceModal({ order, materials, open, onClose }) {
  const [lang, setLang] = useState('mk');
  const [editing, setEditing] = useState(false);
  const printRef = useRef();

  const today = new Date().toLocaleDateString('mk-MK', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');

  const getMatName = () => {
    if (!order) return '';
    return (order.items || []).map(item => {
      const mat = materials.find(m => m.id === item.materialId);
      return mat ? mat.name : (item.materialName || '');
    }).join(', ');
  };

  const [company, setCompany] = useState({
    name: '"GRANIMOR" granit & mermer',
    address: 'Veleshte, Struge',
    phone: '071241944',
    email: 'Granimor07@hotmail.com',
  });

  const [invoice, setInvoice] = useState({
    offerNumber: 'XXXX',
    offerDate: today,
    clientName: order?.fullName || '',
    clientEmail: '',
    materialName: getMatName(),
    signedBy: 'Lorik Vlashi',
    printDate: today,
    comments: [
      'Во оваа понуда е вклучено : сечење , полирање , Сечење и лепење на 45 степени, транспорт и монтажа .',
      'Во оваа понуда е вклучено и 18 % ДДВ .',
    ],
  });

    const il = invoiceLang[lang];

  const buildRows = () => {
    if (!order) return [];
    const rows = [];
    (order.items || []).forEach(item => {
      const mat = materials.find(m => m.id === item.materialId);
      const name = mat ? mat.name : (item.materialName || '');
      const price = mat ? (mat.type === 'standard' ? mat.pricePerM2 : mat.price) : 0;
      if (mat?.type === 'standard' && item.dimensions) {
        rows.push({
          service: il.materialRow,
          calculation: `${item.area?.toFixed(5)} m2 x ${price} euro/m2`,
          total: `${item.cost?.toFixed(2)} euro`,
        });
      } else {
        rows.push({
          service: name,
          calculation: `${item.quantity || 1} x ${price} euro`,
          total: `${item.cost?.toFixed(2)} euro`,
        });
      }
    });
    (order.additionalCosts || []).forEach(ac => {
      rows.push({
        service: ac.reason || 'Additional cost',
        calculation: '',
        total: `${ac.amount?.toFixed(2)} euro`,
      });
    });
    return rows;
  };

  const [rows, setRows] = useState(null);

  useEffect(() => {
    if (!order) return;
    setRows(null);
    setInvoice({
      offerNumber: 'XXXX',
      offerDate: today,
      clientName: order?.fullName || '',
      clientEmail: '',
      materialName: (order.items || []).map(item => {
        const mat = materials.find(m => m.id === item.materialId);
        return mat ? mat.name : (item.materialName || '');
      }).join(', '),
      signedBy: 'Lorik Vlashi',
      printDate: today,
      comments: [
        'Во оваа понуда е вклучено : сечење , полирање , Сечење и лепење на 45 степени, транспорт и монтажа .',
        'Во оваа понуда е вклучено и 18 % ДДВ .',
      ],
    });
    setCompany({
      name: '"GRANIMOR" granit & mermer',
      address: 'Veleshte, Struge',
      phone: '071241944',
      email: 'Granimor07@hotmail.com',
    });
    setEditing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  const activeRows = rows || buildRows();
  const total = activeRows.reduce((sum, row) => {
    const val = parseFloat(row.total?.replace(/[^0-9.]/g, '')) || 0;
    return sum + val;
  }, 0);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const clientName = invoice.clientName.replace(/\s+/g, '_') || 'client';
    const dueDate = order?.dueDate ? `${order.dueDate.split('-')[2]}/${order.dueDate.split('-')[1]}/${order.dueDate.split('-')[0]}` : today;
    const fileName = `${clientName}_${dueDate.replace(/\//g, '-')}_invoice`;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${fileName}</title>
      <style>
        @page { margin: 0; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        body { font-family: 'Times New Roman', serif; font-size: 13px; color: #000; padding: 40px; }
        .invoice-header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .company-right { text-align: right; font-size: 12px; line-height: 1.8; }
        .offer-number { font-weight: bold; font-size: 14px; text-decoration: underline; margin-bottom: 4px; }
        .client-section { text-align: right; margin-bottom: 20px; }
        .material-label { margin-bottom: 12px; font-size: 13px; }
        .material-label strong { font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { border: 1px solid #000; padding: 6px 10px; background: #f0f0f0 !important; font-weight: bold; text-align: center; }
        td { border: 1px solid #000; padding: 6px 10px; }
        td:first-child { text-align: center; width: 40px; }
        td:last-child { text-align: right; }
        .total-row td { font-weight: bold; background: #d0d0d0 !important; text-align: right; }
        .divider { border-top: 1px solid #000; margin: 20px 0; }
        .comment-section { margin-bottom: 40px; }
        .footer { text-align: right; font-size: 13px; line-height: 2; }
      </style>
      </head><body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  if (!open || !order) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 12, width: 860, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>

        {/* Modal Header */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 16 }}>{il.invoiceTitle}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['en', 'mk', 'al'].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  background: lang === l ? '#1a1a2e' : '#e5e7eb', color: lang === l ? 'white' : '#555'
                }}>{l.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={() => setEditing(!editing)} style={{
              padding: '5px 12px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: editing ? '#c9a84c' : 'white', color: editing ? 'white' : '#555'
            }}>{editing ? il.saveBtn : il.editBtn}</button>
            <button onClick={() => {
              setRows(null);
              setInvoice({
                offerNumber: 'XXXX',
                offerDate: today,
                clientName: order?.fullName || '',
                clientEmail: '',
                materialName: getMatName(),
                signedBy: 'Lorik Vlashi',
                printDate: today,
                comments: [
                  'Во оваа понуда е вклучено : сечење , полирање , Сечење и лепење на 45 степени, транспорт и монтажа .',
                  'Во оваа понуда е вклучено и 18 % ДДВ .',
                ],
              });
              setCompany({
                name: '"GRANIMOR" granit & mermer',
                address: 'Veleshte, Struge',
                phone: '071241944',
                email: 'Granimor07@hotmail.com',
              });
              setEditing(false);
            }} style={{
              padding: '5px 12px', borderRadius: 6, border: '1px solid #ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: 'white', color: '#ef4444'
            }}>↺ Reset</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handlePrint} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1a1a2e', color: 'white', fontWeight: 600, fontSize: 13 }}>🖨 {il.printBtn}</button>
            <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer', background: 'white', fontWeight: 600, fontSize: 13 }}>{il.closeBtn}</button>
          </div>
        </div>

        {/* Invoice Preview */}
        <div style={{ padding: 30 }}>
          <div ref={printRef}>

            {/* Header */}
            <div className="invoice-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
              <div>
                <div className="offer-number" style={{ fontWeight: 700, fontSize: 15, textDecoration: 'underline', marginBottom: 4 }}>
                  {editing ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span>{il.offer} :</span>
                      <input value={invoice.offerNumber} onChange={e => setInvoice(p => ({ ...p, offerNumber: e.target.value }))}
                        style={{ width: 100, border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 14 }} />
                    </div>
                  ) : `${il.offer} : ${invoice.offerNumber}`}
                </div>
                <div style={{ fontSize: 13 }}>
                  {editing ? (
                    <input value={invoice.offerDate} onChange={e => setInvoice(p => ({ ...p, offerDate: e.target.value }))}
                      style={{ width: 120, border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 13 }} />
                  ) : invoice.offerDate}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 12, lineHeight: 1.8 }}>
                {editing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    {['name', 'address', 'phone', 'email'].map(field => (
                      <input key={field} value={company[field]} onChange={e => setCompany(p => ({ ...p, [field]: e.target.value }))}
                        style={{ width: 220, border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 12, textAlign: 'right' }} />
                    ))}
                  </div>
                ) : (
                  <>
                    <div>{company.name}</div>
                    <div>{company.address}</div>
                    <div>{company.phone}</div>
                    <div>{company.email}</div>
                  </>
                )}
              </div>
            </div>

            {/* Client */}
            <div style={{ textAlign: 'right', marginBottom: 30, fontSize: 13 }}>
              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700 }}>{il.to}:</span>
                    <input value={invoice.clientName} onChange={e => setInvoice(p => ({ ...p, clientName: e.target.value }))}
                      style={{ width: 200, border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 13 }} />
                  </div>
                  <input value={invoice.clientEmail} onChange={e => setInvoice(p => ({ ...p, clientEmail: e.target.value }))}
                    placeholder="client@email.com"
                    style={{ width: 200, border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 13 }} />
                </div>
              ) : (
                <>
                  <div><strong>{il.to}: {invoice.clientName}</strong></div>
                  {invoice.clientEmail && <div style={{ textDecoration: 'underline' }}>{invoice.clientEmail}</div>}
                </>
              )}
            </div>

            {/* Material Name */}
            <div style={{ marginBottom: 14, fontSize: 13 }}>
              <strong>{il.material}: </strong>
              {editing ? (
                <input value={invoice.materialName} onChange={e => setInvoice(p => ({ ...p, materialName: e.target.value }))}
                  style={{ width: 300, border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 13, fontStyle: 'italic' }} />
              ) : <strong><em>{invoice.materialName}</em></strong>}
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '6px 10px', background: '#f0f0f0', width: 40, textAlign: 'center' }}>{il.no}</th>
                  <th style={{ border: '1px solid #000', padding: '6px 10px', background: '#f0f0f0', textAlign: 'center' }}>{il.services}</th>
                  <th style={{ border: '1px solid #000', padding: '6px 10px', background: '#f0f0f0', textAlign: 'center' }}>{il.calculation}</th>
                  <th style={{ border: '1px solid #000', padding: '6px 10px', background: '#f0f0f0', textAlign: 'center' }}>{il.total}</th>
                </tr>
              </thead>
              <tbody>
                {activeRows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      {editing ? <input value={row.service} onChange={e => { const r = [...activeRows]; r[i] = { ...r[i], service: e.target.value }; setRows(r); }} style={{ width: '100%', border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 13 }} /> : row.service}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 10px' }}>
                      {editing ? <input value={row.calculation} onChange={e => { const r = [...activeRows]; r[i] = { ...r[i], calculation: e.target.value }; setRows(r); }} style={{ width: '100%', border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 13 }} /> : row.calculation}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '6px 10px', textAlign: 'right' }}>
                      {editing ? <input value={row.total} onChange={e => { const r = [...activeRows]; r[i] = { ...r[i], total: e.target.value }; setRows(r); }} style={{ width: '100%', border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 13, textAlign: 'right' }} /> : row.total}
                    </td>
                    {editing && (
                      <td style={{ border: '1px solid #000', padding: '4px 6px', textAlign: 'center', width: 30 }}>
                        <button onClick={() => setRows(activeRows.filter((_, idx) => idx !== i))}
                          style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✕</button>
                      </td>
                    )}
                  </tr>
                ))}
                {editing && (
                  <tr>
                    <td colSpan={4} style={{ border: '1px solid #000', padding: 6, textAlign: 'center' }}>
                      <button onClick={() => setRows([...activeRows, { service: '', calculation: '', total: '' }])}
                        style={{ background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>
                        + {il.addRow}
                      </button>
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 700, textAlign: 'right', background: '#d0d0d0' }}>{il.total}</td>
                  <td style={{ border: '1px solid #000', padding: '6px 10px', fontWeight: 700, textAlign: 'right', background: '#d0d0d0' }}>{total.toFixed(2)} euro</td>
                </tr>
              </tbody>
            </table>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #000', margin: '20px 0' }} />

            {/* Comments */}
            <div style={{ marginBottom: 40 }}>
              <p style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>{il.comment} :</p>
              {invoice.comments.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 12, alignItems: 'center' }}>
                  <span>➤</span>
                  {editing ? (
                    <>
                      <input value={c} onChange={e => { const cc = [...invoice.comments]; cc[i] = e.target.value; setInvoice(p => ({ ...p, comments: cc })); }}
                        style={{ flex: 1, border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 12 }} />
                      <button onClick={() => setInvoice(p => ({ ...p, comments: p.comments.filter((_, idx) => idx !== i) }))}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✕</button>
                    </>
                  ) : <span>{c}</span>}
                </div>
              ))}
              {editing && (
                <button onClick={() => setInvoice(p => ({ ...p, comments: [...p.comments, ''] }))}
                  style={{ marginTop: 6, background: '#1a1a2e', color: 'white', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>
                  + {il.addRow}
                </button>
              )}
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'right', fontSize: 13, lineHeight: 2 }}>
              <div>
                {il.date}{' '}
                {editing ? (
                  <input value={invoice.printDate} onChange={e => setInvoice(p => ({ ...p, printDate: e.target.value }))}
                    style={{ width: 120, border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 13 }} />
                ) : invoice.printDate}
              </div>
              <div>{il.regards}</div>
              <div>
                {editing ? (
                  <input value={invoice.signedBy} onChange={e => setInvoice(p => ({ ...p, signedBy: e.target.value }))}
                    style={{ width: 150, border: '1px solid #c9a84c', borderRadius: 4, padding: '2px 6px', fontSize: 13, textAlign: 'right' }} />
                ) : invoice.signedBy}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}