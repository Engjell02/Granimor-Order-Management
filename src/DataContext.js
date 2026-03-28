import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const DataContext = createContext(null);

let nextId = 1;
function generateId() { return `${Date.now()}-${nextId++}`; }

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
}

function migrateOrder(o) {
  if (o.items && Array.isArray(o.items) && o.items.length > 0) {
    return { ...o, items: o.items, additionalCosts: Array.isArray(o.additionalCosts) ? o.additionalCosts : [] };
  }
  const items = [];
  if (o.materialId) {
    items.push({ materialId: o.materialId, dimensions: o.dimensions || '', area: o.area || 0, cost: o.material_cost || 0, quantity: 1 });
  }
  const additionalCosts = typeof o.additional_costs === 'number' && o.additional_costs > 0
    ? [{ amount: o.additional_costs, reason: o.additional_cost_reason || '' }]
    : Array.isArray(o.additionalCosts) ? o.additionalCosts : [];
  return {
    id: o.id, fullName: o.full_name || o.fullName, location: o.location,
    phoneNumber: o.phone || o.phoneNumber, dueDate: o.due_date || o.dueDate,
    items, additionalCosts, comment: o.comment, status: o.status,
    bilancStatus: o.bilancStatus || (o.is_paid ? 'paguar' : null),
    payments: o.payments || [], totalPaid: o.totalPaid || o.paid_amount || 0,
    createdAt: o.createdAt || o.created_at || new Date().toISOString(),
  };
}

function migrateMaterial(m) {
  return {
    id: m.id || generateId(),
    type: m.type === 'handcraft' ? 'handcraft' : 'standard',
    name: m.name || '',
    code: m.material_code || m.code || '',
    pricePerM2: m.pricePerM2 || m.price || 0,
    price: m.price || 0,
    count: String(m.count || ''),
  };
}

export function DataProvider({ children }) {
  const [materials, setMaterials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cars, setCars] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setMaterials((loadFromStorage('granimor_materials', [])).map(migrateMaterial));
    setOrders((loadFromStorage('granimor_orders', [])).map(migrateOrder));
    setCars(loadFromStorage('granimor_cars', []));
    setIsHydrated(true);
  }, []);

  useEffect(() => { if (isHydrated) localStorage.setItem('granimor_materials', JSON.stringify(materials)); }, [materials, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('granimor_orders', JSON.stringify(orders)); }, [orders, isHydrated]);
  useEffect(() => { if (isHydrated) localStorage.setItem('granimor_cars', JSON.stringify(cars)); }, [cars, isHydrated]);

  const addMaterial = useCallback((m) => setMaterials(prev => [...prev, { ...m, id: generateId() }]), []);
  const updateMaterial = useCallback((id, m) => setMaterials(prev => prev.map(mat => mat.id === id ? { ...mat, ...m } : mat)), []);
  const deleteMaterial = useCallback((id) => setMaterials(prev => prev.filter(mat => mat.id !== id)), []);

  const addOrder = useCallback((o) => {
    const orderNumber = orders.length > 0 ? Math.max(...orders.map(x => x.orderNumber || 0)) + 1 : 1;
    setOrders(prev => [...prev, { ...o, id: generateId(), orderNumber, status: 'pending', bilancStatus: null, payments: [], totalPaid: 0, createdAt: new Date().toISOString() }]);
  }, [orders]);
  const updateOrder = useCallback((id, o) => setOrders(prev => prev.map(order => order.id === id ? { ...order, ...o } : order)), []);
  const setOrderStatus = useCallback((id, status) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== id) return order;
      const updated = { ...order, status };
      if (status === 'approved' && !order.bilancStatus) updated.bilancStatus = 'borxhe';
      return updated;
    }));
  }, []);
  const setBilancStatus = useCallback((id, status) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, bilancStatus: status } : order));
  }, []);
  const addPayment = useCallback((orderId, amount, type) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      const newPayment = { amount, type, date: new Date().toISOString() };
      const newPayments = [...order.payments, newPayment];
      const totalPaid = newPayments.reduce((sum, p) => p.type === 'minus' ? sum + p.amount : sum - p.amount, 0);
      return { ...order, payments: newPayments, totalPaid: Math.max(0, totalPaid) };
    }));
  }, []);

  const deleteOrder = useCallback((id) => setOrders(prev => prev.filter(order => order.id !== id)), []);
  const addCar = useCallback((c) => setCars(prev => [...prev, { ...c, id: generateId() }]), []);
  const updateCar = useCallback((id, c) => setCars(prev => prev.map(ci => ci.id === id ? { ...ci, ...c } : ci)), []);
  const deleteCar = useCallback((id) => setCars(prev => prev.filter(ci => ci.id !== id)), []);

  return (
    <DataContext.Provider value={{
      materials, addMaterial, updateMaterial, deleteMaterial,
      orders, addOrder, updateOrder, setOrderStatus, setBilancStatus, addPayment, deleteOrder,
      cars, addCar, updateCar, deleteCar
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function getOrderTotal(order) {
  const itemsTotal = (order.items || []).reduce((s, i) => s + i.cost, 0);
  const addTotal = (order.additionalCosts || []).reduce((s, ac) => s + ac.amount, 0);
  return itemsTotal + addTotal;
}