import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FileSpreadsheet, Sparkles, Lock, Printer, Calendar, ArrowRight, Check,
  TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';
import BillingModal from '../components/BillingModal';

const EstadoResultados = () => {
  const { user, apiFetch } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  // Filter Date State
  const now = new Date();
  const [filter, setFilter] = useState({
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear())
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/records/report?month=${filter.month}&year=${filter.year}`);
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error('Error al obtener reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, user?.is_subscribed]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (value) => {
    const isUsd = user?.currency === 'USD';
    if (value === undefined || value === null) return isUsd ? '$ 0.00' : 'RD$ 0.00';
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
    <div className="container animated-fade-in" style={{ padding: '30px 24px 60px 24px' }}>
      
      {/* Header and Print Actions */}
      <div className="flex-between print-hide" style={{ marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={26} color="var(--primary)" />
            <span>Estado de Resultados</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Reporte financiero detallado (Pérdidas y Ganancias) para el periodo seleccionado.
          </p>
        </div>

        {/* Date Filters & Print Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={filterContainerStyle}>
            <Calendar size={16} color="var(--text-muted)" style={{ marginRight: '6px' }} />
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

          {!report?.is_locked && (
            <button onClick={handlePrint} className="btn btn-secondary" style={{ padding: '10px 16px' }}>
              <Printer size={16} />
              <span>Imprimir Reporte</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Print Layout header */}
      <div className="print-only" style={printHeaderStyle}>
        <h2>{user?.name}</h2>
        <h1>ESTADO DE RESULTADOS</h1>
        <h3>Periodo: {getMonthName(filter.month)} de {filter.year}</h3>
        <p>Valores expresados en {user?.currency === 'USD' ? 'Dólares Estadounidenses ($)' : 'Pesos Dominicanos (RD$)'}</p>
      </div>

      {loading ? (
        <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <RefreshCw className="spinner" size={24} color="var(--primary)" />
          <span style={{ marginLeft: '12px' }}>Generando estado financiero...</span>
        </div>
      ) : (
        <div className="blur-container card" style={{ padding: '32px', border: '1px solid var(--border-color)' }}>
          
          {/* Detailed Financial Sheet Table */}
          <div className={report.is_locked ? 'blurred' : ''} style={sheetStyle}>
            
            {/* Ventas */}
            <div style={rowStyle}>
              <span style={labelStyle}>Ventas (Ingresos por ventas)</span>
              <span style={valueStyle}>{formatCurrency(report?.ventas)}</span>
            </div>

            {/* Costo de Ventas */}
            <div style={rowStyle}>
              <span style={labelStyle}>(-) Costo de ventas</span>
              <span style={{ ...valueStyle, color: 'var(--accent-red)' }}>
                {report?.costo_ventas > 0 ? `(${formatCurrency(report?.costo_ventas)})` : formatCurrency(0)}
              </span>
            </div>

            {/* Utilidad Bruta */}
            <div style={{ ...rowStyle, ...summaryRowStyle, borderBottom: '2px double var(--border-color)' }}>
              <span style={{ ...labelStyle, fontWeight: '700', color: 'var(--text-primary)' }}>Utilidad bruta</span>
              <span style={{ ...valueStyle, fontWeight: '700', color: report?.utilidad_bruta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {formatCurrency(report?.utilidad_bruta)}
              </span>
            </div>

            {/* Gastos Operativos Section */}
            <div style={sectionHeaderRowStyle}>
              <span>(-) Gastos operativos</span>
              <span style={{ color: 'var(--accent-red)' }}>
                {report?.gastos_operativos > 0 ? `(${formatCurrency(report?.gastos_operativos)})` : formatCurrency(0)}
              </span>
            </div>

            {/* Breakdown of operational expenses */}
            <div style={subRowStyle}>
              <span>Alquiler de local</span>
              <span>{formatCurrency(report?.gastos_operativos_detail?.alquiler)}</span>
            </div>
            <div style={subRowStyle}>
              <span>Electricidad</span>
              <span>{formatCurrency(report?.gastos_operativos_detail?.electricidad)}</span>
            </div>
            <div style={subRowStyle}>
              <span>Publicidad</span>
              <span>{formatCurrency(report?.gastos_operativos_detail?.publicidad)}</span>
            </div>
            <div style={subRowStyle}>
              <span>Sueldos / Nómina</span>
              <span>{formatCurrency(report?.gastos_operativos_detail?.sueldos)}</span>
            </div>
            <div style={subRowStyle}>
              <span>Otros gastos administrativos</span>
              <span>{formatCurrency(report?.gastos_operativos_detail?.otros)}</span>
            </div>

            {/* Utilidad Operativa */}
            <div style={{ ...rowStyle, ...summaryRowStyle }}>
              <span style={{ ...labelStyle, fontWeight: '700', color: 'var(--text-primary)' }}>Utilidad operativa</span>
              <span style={{ ...valueStyle, fontWeight: '700', color: report?.utilidad_operativa >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {formatCurrency(report?.utilidad_operativa)}
              </span>
            </div>

            {/* Intereses */}
            <div style={rowStyle}>
              <span style={labelStyle}>(-) Gastos por intereses</span>
              <span style={{ ...valueStyle, color: 'var(--accent-red)' }}>
                {report?.intereses > 0 ? `(${formatCurrency(report?.intereses)})` : formatCurrency(0)}
              </span>
            </div>

            {/* Utilidad antes de Impuestos */}
            <div style={{ ...rowStyle, ...summaryRowStyle }}>
              <span style={{ ...labelStyle, fontWeight: '700', color: 'var(--text-primary)' }}>Utilidad antes de impuestos</span>
              <span style={{ ...valueStyle, fontWeight: '700', color: report?.utilidad_antes_impuestos >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {formatCurrency(report?.utilidad_antes_impuestos)}
              </span>
            </div>

            {/* Impuestos */}
            <div style={rowStyle}>
              <span style={labelStyle}>(-) Impuestos</span>
              <span style={{ ...valueStyle, color: 'var(--accent-red)' }}>
                {report?.impuestos > 0 ? `(${formatCurrency(report?.impuestos)})` : formatCurrency(0)}
              </span>
            </div>

            {/* Utilidad Neta */}
            <div style={{ ...rowStyle, ...finalSummaryRowStyle }}>
              <span style={{ ...labelStyle, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>Utilidad neta</span>
              <span style={{ ...valueStyle, fontSize: '1.2rem', fontWeight: '800', color: report?.utilidad_neta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {formatCurrency(report?.utilidad_neta)}
              </span>
            </div>

          </div>

          {/* Paywall Overlay for Free Tier Users */}
          {report.is_locked && (
            <div className="paywall-overlay print-hide">
              <div className="card paywall-card animated-fade-in">
                <div style={paywallBadgeStyle}>
                  <Sparkles size={16} />
                  <span>ContaClaridad Premium</span>
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>¿Cuál es tu Utilidad de cada mes?</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  El Estado de Resultados te permite ver la ganancia real que obtiene tu negocio tras descontar costos, gastos operativos, intereses e impuestos. <strong>Se requiere suscripción para acceder a esta información.</strong>
                </p>
                <div style={perksStyle}>
                  <div style={perkItemStyle}><Check size={14} color="var(--accent-green)" /> <span>Utilidad Operativa y Neta detalladas</span></div>
                  <div style={perkItemStyle}><Check size={14} color="var(--accent-green)" /> <span>Desglose completo de gastos de operación</span></div>
                  <div style={perkItemStyle}><Check size={14} color="var(--accent-green)" /> <span>Exportación e impresión de reportes contables</span></div>
                </div>
                <button onClick={() => setIsBillingOpen(true)} className="btn btn-premium" style={{ width: '100%', padding: '12px 24px', fontWeight: '700' }}>
                  Desbloquear Reporte Completo
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Print styles styletag */}
      <style>{`
        .print-only { display: none; }
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print-hide { display: none !important; }
          .print-only { display: block !important; }
          .card {
            border: none !important;
            box-shadow: none !important;
            background: none !important;
            padding: 0 !important;
          }
          .blur-container {
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} />
    </div>
  );
};

// Styles
const filterContainerStyle = {
  background: 'hsla(225, 25%, 6%, 0.4)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '6px 12px',
  display: 'flex',
  alignItems: 'center'
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

const sheetStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '680px',
  margin: '0 auto',
  gap: '0'
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '14px 10px',
  borderBottom: '1px solid var(--border-color)'
};

const subRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 10px 8px 30px',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  borderBottom: '1px dashed var(--border-color)'
};

const sectionHeaderRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '14px 10px 8px 10px',
  fontWeight: '600',
  color: 'var(--text-primary)',
  borderBottom: '1px solid var(--border-color)'
};

const summaryRowStyle = {
  background: 'hsla(223, 20%, 20%, 0.2)',
  padding: '14px 10px',
  fontWeight: '600',
  borderBottom: '1px solid var(--text-secondary)'
};

const finalSummaryRowStyle = {
  background: 'hsla(180, 75%, 42%, 0.05)',
  borderTop: '2px solid var(--primary)',
  borderBottom: '3px double var(--primary)',
  padding: '18px 10px',
  marginTop: '12px'
};

const labelStyle = {
  color: 'var(--text-secondary)'
};

const valueStyle = {
  fontWeight: '600'
};

const paywallBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'hsla(22, 90%, 55%, 0.12)',
  color: 'var(--secondary)',
  padding: '6px 12px',
  borderRadius: '20px',
  border: '1px solid hsla(22, 90%, 55%, 0.25)',
  fontSize: '0.75rem',
  fontWeight: '700',
  textTransform: 'uppercase'
};

const perksStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '8px',
  width: '100%',
  margin: '10px 0',
  padding: '12px',
  background: 'hsla(223, 25%, 8%, 0.5)',
  borderRadius: '8px',
  border: '1px solid var(--border-color)'
};

const perkItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.85rem',
  color: 'var(--text-primary)'
};

const printHeaderStyle = {
  textAlign: 'center',
  marginBottom: '40px',
  color: 'black',
  borderBottom: '2px solid black',
  paddingBottom: '16px'
};

export default EstadoResultados;
