import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, Calculator, Plus, Trash2, 
  Sparkles, Lock, ArrowRight, Info, AlertTriangle
} from 'lucide-react';
import BillingModal from '../components/BillingModal';

const Dashboard = () => {
  const { user, apiFetch } = useAuth();
  const [records, setRecords] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  // Filter Date State
  const now = new Date();
  const [filter, setFilter] = useState({
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear())
  });

  // Form State
  const [form, setForm] = useState({
    record_type: 'ingreso',
    concept: '',
    category: 'Ventas',
    quantity: '',
    unit_price: '',
    amount: '',
    date: now.toISOString().split('T')[0]
  });

  // Fetch records and report
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get transactions list
      const recRes = await apiFetch(`/records?month=${filter.month}&year=${filter.year}`);
      const recData = await recRes.json();
      setRecords(recData);

      // 2. Get monthly summary report
      const repRes = await apiFetch(`/records/report?month=${filter.month}&year=${filter.year}`);
      const repData = await repRes.json();
      setReport(repData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, user?.is_subscribed]); // Reload if date changes or subscription status updates

  // Handle Input Changes
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // Reset category when record_type changes
    if (name === 'record_type') {
      if (value === 'ingreso') {
        updatedForm.category = 'Ventas';
      } else if (value === 'costo') {
        updatedForm.category = 'Costo de Ventas';
      } else {
        updatedForm.category = 'Alquiler'; // Default gasto category
      }
    }

    setForm(updatedForm);
  };

  // Autocalculate amount when quantity/unit_price changes
  useEffect(() => {
    const q = parseFloat(form.quantity);
    const p = parseFloat(form.unit_price);
    if (!isNaN(q) && !isNaN(p)) {
      setForm(prev => ({ ...prev, amount: (q * p).toFixed(2) }));
    }
  }, [form.quantity, form.unit_price]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.concept || !form.category || !form.date) return;

    setSubmitting(true);
    try {
      const payload = { ...form };
      if (!payload.quantity) delete payload.quantity;
      if (!payload.unit_price) delete payload.unit_price;

      const response = await apiFetch('/records', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Reset form
        setForm({
          record_type: form.record_type,
          concept: '',
          category: form.record_type === 'ingreso' ? 'Ventas' : form.record_type === 'costo' ? 'Costo de Ventas' : 'Alquiler',
          quantity: '',
          unit_price: '',
          amount: '',
          date: now.toISOString().split('T')[0]
        });
        // Reload dashboard data
        fetchData();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al agregar registro.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Record Deletion
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta transacción?')) return;

    try {
      const response = await apiFetch(`/records/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchData();
      } else {
        alert('Error al eliminar registro.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión.');
    }
  };

  // Format Currencies helper
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'N/A';
    const isUsd = user?.currency === 'USD';
    return new Intl.NumberFormat(isUsd ? 'en-US' : 'es-DO', {
      style: 'currency',
      currency: isUsd ? 'USD' : 'DOP'
    }).format(value);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[parseInt(monthNumber, 10) - 1];
  };

  return (
    <div className="container animated-fade-in page-wrapper">
      
      {/* Trial Active Banner */}
      {user?.is_trial && user?.trial_ends_at && (
        <div style={{
          background: 'linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)',
          border: '1px solid #fde047',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }} className="animated-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#fef08a', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="#a16207" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontWeight: '700', color: '#854d0e', fontSize: '0.95rem' }}>Prueba Gratuita Activa</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#a16207' }}>
                Estás disfrutando de todas las funciones Premium de ContaClaridad. Te quedan{' '}
                <strong>
                  {(() => {
                    const ends = new Date(user.trial_ends_at);
                    const now = new Date();
                    const diffTime = ends - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays > 0 ? diffDays : 0;
                  })()} días de prueba gratis
                </strong>.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsBillingOpen(true)}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: '700',
              boxShadow: 'none'
            }}
          >
            Adquirir Plan Premium
          </button>
        </div>
      )}

      {/* Top Section - Welcome & Date Selector */}
      <div className="flex-between page-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Panel de Transacciones</h1>
          <p className="page-subtitle">
            Gestiona tus finanzas de <strong>{getMonthName(filter.month)} de {filter.year}</strong>.
          </p>
        </div>

        {/* Date Filters */}
        <div style={filterContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--text-muted)" />
            <select name="month" className="form-select" value={filter.month} onChange={handleFilterChange} style={selectFilterStyle}>
              <option value="1">Enero</option>
              <option value="2">Febrero</option>
              <option value="3">Marzo</option>
              <option value="4">Abril</option>
              <option value="5">Mayo</option>
              <option value="6">Junio</option>
              <option value="7">Julio</option>
              <option value="8">Agosto</option>
              <option value="9">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
            <select name="year" className="form-select" value={filter.year} onChange={handleFilterChange} style={selectFilterStyle}>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid-4" style={{ marginBottom: 'clamp(20px, 4vw, 32px)' }}>
        
        {/* Ingresos Card */}
        <div className="card" style={summaryCardStyle}>
          <div className="flex-between">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Ingresos Totales</span>
            <div style={{ ...iconBgStyle, background: 'hsla(180, 75%, 42%, 0.1)', color: 'var(--primary)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h2 style={summaryAmountStyle}>{formatCurrency(report?.ventas || 0)}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ventas facturadas</span>
        </div>

        {/* Costos Card */}
        <div className="card" style={summaryCardStyle}>
          <div className="flex-between">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Costos Totales</span>
            <div style={{ ...iconBgStyle, background: 'hsla(355, 75%, 50%, 0.1)', color: 'var(--accent-red)' }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <h2 style={summaryAmountStyle}>{formatCurrency(report?.costo_ventas || 0)}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Costo directo de ventas</span>
        </div>

        {/* Utilidad Bruta Card */}
        <div className="card" style={summaryCardStyle}>
          <div className="flex-between">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Utilidad Bruta</span>
            <div style={{ 
              ...iconBgStyle, 
              background: (report?.utilidad_bruta >= 0) ? 'hsla(145, 65%, 45%, 0.1)' : 'hsla(355, 75%, 50%, 0.1)',
              color: (report?.utilidad_bruta >= 0) ? 'var(--accent-green)' : 'var(--accent-red)'
            }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h2 style={{ 
            ...summaryAmountStyle, 
            color: (report?.utilidad_bruta >= 0) ? 'var(--accent-green)' : 'var(--accent-red)'
          }}>{formatCurrency(report?.utilidad_bruta || 0)}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ingresos menos costos</span>
        </div>

        {/* Utilidad Neta Card (Gate/Paywall) */}
        <div className="card" style={{ ...summaryCardStyle, overflow: 'hidden', position: 'relative' }}>
          <div className="flex-between">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Utilidad Neta</span>
            <div style={{ 
              ...iconBgStyle, 
              background: user?.is_subscribed ? 'hsla(22, 90%, 55%, 0.1)' : 'hsla(220, 10%, 25%, 0.15)',
              color: user?.is_subscribed ? 'var(--secondary)' : 'var(--text-muted)'
            }}>
              {user?.is_subscribed ? <Sparkles size={18} /> : <Lock size={18} />}
            </div>
          </div>
          
          {user?.is_subscribed ? (
            <>
              <h2 style={{ 
                ...summaryAmountStyle, 
                color: (report?.utilidad_neta >= 0) ? 'var(--accent-green)' : 'var(--accent-red)'
              }}>{formatCurrency(report?.utilidad_neta || 0)}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resultado neto final</span>
            </>
          ) : (
            <div style={lockedCardOverlayStyle}>
              <div style={lockedOverlayBlurStyle}>{user?.currency === 'USD' ? '$ 99,999.00' : 'RD$ 99,999.00'}</div>
              <button 
                onClick={() => setIsBillingOpen(true)} 
                style={unlockButtonStyle}
                title="Desbloquear con Premium"
              >
                <Sparkles size={12} />
                <span>Desbloquear</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Main Section Grid: Input Form & Recent Records */}
      <div className="grid-2" style={{ alignItems: 'start', gap: 'clamp(16px, 3vw, 24px)' }}>
        
        {/* Left Side: Add Record Form */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={20} color="var(--primary)" />
            <span>Registrar Operación</span>
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Record Type Selector */}
            <div className="form-group">
              <label className="form-label">Tipo de Operación</label>
              <div style={radioGroupStyle}>
                <label style={{
                  ...radioLabelStyle,
                  borderColor: form.record_type === 'ingreso' ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: form.record_type === 'ingreso' ? 'var(--primary-glow)' : 'transparent',
                  color: form.record_type === 'ingreso' ? 'var(--primary)' : 'var(--text-secondary)'
                }}>
                  <input
                    type="radio"
                    name="record_type"
                    value="ingreso"
                    checked={form.record_type === 'ingreso'}
                    onChange={handleFormChange}
                    style={{ display: 'none' }}
                  />
                  <TrendingUp size={16} />
                  <span>Ingreso</span>
                </label>

                <label style={{
                  ...radioLabelStyle,
                  borderColor: form.record_type === 'costo' ? 'var(--accent-red)' : 'var(--border-color)',
                  backgroundColor: form.record_type === 'costo' ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                  color: form.record_type === 'costo' ? 'var(--accent-red)' : 'var(--text-secondary)'
                }}>
                  <input
                    type="radio"
                    name="record_type"
                    value="costo"
                    checked={form.record_type === 'costo'}
                    onChange={handleFormChange}
                    style={{ display: 'none' }}
                  />
                  <TrendingDown size={16} />
                  <span>Costo</span>
                </label>

                <label style={{
                  ...radioLabelStyle,
                  borderColor: form.record_type === 'gasto' ? 'var(--secondary)' : 'var(--border-color)',
                  backgroundColor: form.record_type === 'gasto' ? 'var(--secondary-glow)' : 'transparent',
                  color: form.record_type === 'gasto' ? 'var(--secondary)' : 'var(--text-secondary)'
                }}>
                  <input
                    type="radio"
                    name="record_type"
                    value="gasto"
                    checked={form.record_type === 'gasto'}
                    onChange={handleFormChange}
                    style={{ display: 'none' }}
                  />
                  <TrendingDown size={16} />
                  <span>Gasto</span>
                </label>
              </div>
            </div>

            {/* Concept / Detail */}
            <div className="form-group">
              <label className="form-label">Concepto</label>
              <input
                type="text"
                name="concept"
                className="form-input"
                placeholder={
                  form.record_type === 'ingreso' ? "Ej. Venta de 100 camisetas" :
                  form.record_type === 'costo' ? "Ej. Compra de materia prima" :
                  "Ej. Pago de alquiler local"
                }
                value={form.concept}
                onChange={handleFormChange}
                required
              />
            </div>

            {/* Category selection */}
            <div className="form-group">
              <label className="form-label">Categoría</label>
              {form.record_type === 'ingreso' ? (
                <input type="text" className="form-input" value="Ventas (Ingresos)" disabled />
              ) : form.record_type === 'costo' ? (
                <input type="text" className="form-input" value="Costo de Ventas" disabled />
              ) : (
                <select name="category" className="form-select" value={form.category} onChange={handleFormChange}>
                  <option value="Alquiler">Alquiler del local</option>
                  <option value="Electricidad">Electricidad</option>
                  <option value="Publicidad">Publicidad</option>
                  <option value="Sueldos">Sueldos / Nómina</option>
                  <option value="Otros Gastos Operativos">Otros Gastos Operativos</option>
                  <option value="Intereses">Intereses Bancarios</option>
                  <option value="Impuestos">Impuestos</option>
                </select>
              )}
            </div>

            {/* Quantity and Unit Price Calculator (Optional) */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Cantidad (Opcional)</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-input"
                  placeholder="Ej. 100"
                  value={form.quantity}
                  onChange={handleFormChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Precio Unitario (Opcional)</label>
                <input
                  type="number"
                  name="unit_price"
                  className="form-input"
                  placeholder="Ej. 500"
                  value={form.unit_price}
                  onChange={handleFormChange}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-grid-2">
              {/* Amount / Total */}
              <div className="form-group">
                <label className="form-label">
                  Monto Total ({user?.currency === 'USD' ? '$' : 'RD$'})
                  {form.quantity && form.unit_price && <span style={{ color: 'var(--primary)', fontSize: '0.75rem', marginLeft: '6px' }}>(Calculado)</span>}
                </label>
                <input
                  type="number"
                  name="amount"
                  className="form-input"
                  placeholder="Ej. 50000"
                  value={form.amount}
                  onChange={handleFormChange}
                  required
                  disabled={!!(form.quantity && form.unit_price)}
                  step="0.01"
                />
              </div>

              {/* Date */}
              <div className="form-group">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  name="date"
                  className="form-input"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
            >
              {submitting ? (
                <span>Agregando operación...</span>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Agregar Registro</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Recent Transactions Table */}
        <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>
            Transacciones del Mes
          </h2>

          {loading ? (
            <div style={centeredContainerStyle}>Cargando transacciones...</div>
          ) : records.length === 0 ? (
            <div style={centeredContainerStyle}>
              <Info size={32} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No hay transacciones registradas en este mes.</p>
            </div>
          ) : (
            <div className="table-scroll" style={{ flex: 1 }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(rec => (
                    <tr key={rec.id}>
                      <td style={{ fontSize: '0.85rem' }}>
                        {new Date(rec.date + 'T00:00:00').toLocaleDateString('es-DO', { day: '2-digit', month: '2-digit' })}
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{rec.concept}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {rec.category} {rec.quantity ? `(${rec.quantity} x ${formatCurrency(rec.unit_price)})` : ''}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          ...typeBadgeStyle,
                          color: rec.record_type === 'ingreso' ? 'var(--primary)' : 
                                 rec.record_type === 'costo' ? 'var(--accent-red)' : 'var(--secondary)',
                          backgroundColor: rec.record_type === 'ingreso' ? 'var(--primary-glow)' : 
                                           rec.record_type === 'costo' ? 'rgba(239, 68, 68, 0.05)' : 'var(--secondary-glow)'
                        }}>
                          {rec.record_type}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {formatCurrency(rec.amount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDelete(rec.id)} 
                          style={deleteButtonStyle}
                          title="Eliminar Transacción"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} />
    </div>
  );
};

// Styles
const filterContainerStyle = {
  background: 'hsla(225, 25%, 6%, 0.4)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '6px 12px'
};

const selectFilterStyle = {
  padding: '6px 12px',
  background: 'transparent',
  border: 'none',
  fontSize: '0.9rem',
  fontWeight: '600',
  width: 'auto',
  cursor: 'pointer'
};

const summaryCardStyle = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '12px',
  minHeight: '120px'
};

const iconBgStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const summaryAmountStyle = {
  fontSize: '1.4rem',
  fontWeight: '800',
  letterSpacing: '-0.02em',
  margin: '4px 0'
};

const lockedCardOverlayStyle = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: '8px',
  marginTop: '4px'
};

const lockedOverlayBlurStyle = {
  fontSize: '1.4rem',
  fontWeight: '800',
  filter: 'blur(5px)',
  color: 'var(--text-secondary)',
  userSelect: 'none'
};

const unlockButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
  border: 'none',
  color: 'white',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'var(--transition-fast)'
};

const radioGroupStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: '10px'
};

const radioLabelStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  border: '1px solid var(--border-color)',
  padding: '10px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: '600',
  transition: 'var(--transition-fast)',
  textTransform: 'capitalize'
};

const centeredContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: '40px 0',
  color: 'var(--text-secondary)'
};

const typeBadgeStyle = {
  fontSize: '0.75rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  padding: '4px 8px',
  borderRadius: '4px',
  display: 'inline-block'
};

const deleteButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  padding: '6px',
  borderRadius: '4px',
  transition: 'var(--transition-fast)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default Dashboard;
