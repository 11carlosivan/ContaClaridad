import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Sparkles, UserCheck, UserX, Search, Trash2, ShieldAlert,
  Loader2, RefreshCw, Star, StarOff, Filter, BarChart3, Receipt, 
  Settings, DollarSign
} from 'lucide-react';

const AdminDashboard = () => {
  const { apiFetch, user: loggedUser } = useAuth();
  
  // Navigation tabs state: 'users' | 'payments' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState('users');

  // Core Data States
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [paypalClientId, setPaypalClientId] = useState('');
  const [planPrice, setPlanPrice] = useState('27');

  // Loading & Message States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, premium, free, admin
  const [paymentSearch, setPaymentSearch] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch users list
      const userRes = await apiFetch('/admin/users');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData.users);
        setStats(userData.stats);
      }

      // 2. Fetch settings
      const settingsRes = await apiFetch('/admin/settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setPaypalClientId(settingsData.paypal_client_id || 'sb');
        setPlanPrice(settingsData.plan_price || '27');
      }

      // 3. Fetch payments
      const paymentsRes = await apiFetch('/admin/payments');
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
      }

      // 4. Fetch analytics
      const analyticsRes = await apiFetch('/admin/analytics');
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

    } catch (err) {
      console.error(err);
      alert('Error de conexión al cargar datos administrativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleSubscription = async (userId, currentStatus) => {
    setActionLoading(userId);
    try {
      const response = await apiFetch(`/admin/users/${userId}/subscription`, {
        method: 'PUT',
        body: JSON.stringify({ is_subscribed: !currentStatus })
      });

      if (response.ok) {
        await fetchAdminData();
      } else {
        const data = await response.json();
        alert(data.message || 'Error al actualizar suscripción.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de comunicación con el servidor.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (userId === loggedUser.id) {
      alert('No puedes eliminar tu propia cuenta administrativa.');
      return;
    }

    if (!window.confirm(`¿Estás completamente seguro de que deseas eliminar permanentemente al usuario ${userEmail}? Se borrarán todos sus registros contables.`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const response = await apiFetch(`/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchAdminData();
      } else {
        const data = await response.json();
        alert(data.message || 'Error al eliminar usuario.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de comunicación.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage('');
    try {
      const response = await apiFetch('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({ 
          paypal_client_id: paypalClientId,
          plan_price: planPrice
        })
      });
      if (response.ok) {
        setSettingsMessage('Configuraciones guardadas correctamente.');
        setTimeout(() => setSettingsMessage(''), 3000);
      } else {
        const data = await response.json();
        alert(data.message || 'Error al guardar las configuraciones.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filter and Search logic for users
  const filteredUsers = users.filter(u => {
    const text = search.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(text) || u.email.toLowerCase().includes(text);

    if (filterType === 'premium') return matchesSearch && u.is_subscribed && !u.is_admin;
    if (filterType === 'free') return matchesSearch && !u.is_subscribed && !u.is_admin;
    if (filterType === 'admin') return matchesSearch && u.is_admin;
    return matchesSearch;
  });

  // Filter and Search logic for payments
  const filteredPayments = payments.filter(p => {
    const text = paymentSearch.toLowerCase();
    return (
      p.user_name.toLowerCase().includes(text) || 
      p.user_email.toLowerCase().includes(text) || 
      p.paypal_order_id.toLowerCase().includes(text)
    );
  });

  // Custom SVG Area Chart for monthly revenue
  const renderRevenueChart = () => {
    if (!analytics || !analytics.revenue || analytics.revenue.length === 0) {
      return <div style={emptyChartStyle}>No hay suficientes datos de facturación en el historial.</div>;
    }
    
    const data = analytics.revenue;
    const width = 600;
    const height = 220;
    const padding = 35;
    
    const maxVal = Math.max(...data.map(d => d.total), 50); // avoid division by zero or too small height
    
    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - (d.total / maxVal) * (height - padding * 2);
      return { x, y, label: d.month, value: d.total };
    });
    
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = padding + r * (height - padding * 2);
          const val = maxVal * (1 - r);
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
              <text x={padding - 8} y={y + 3} textAnchor="end" fontSize="10" fontWeight="600" fill="var(--text-muted)">
                ${val.toFixed(0)}
              </text>
            </g>
          );
        })}
        
        {/* Area fill */}
        <path d={areaPath} fill="url(#revenueGrad)" />
        
        {/* Stroke Line */}
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" />
        
        {/* Points & Values */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--primary)" stroke="white" strokeWidth="2" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-primary)">
              ${p.value.toFixed(0)}
            </text>
            <text x={p.x} y={height - 10} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-muted)">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Custom SVG Bar Chart for user registrations
  const renderRegistrationsChart = () => {
    if (!analytics || !analytics.registrations || analytics.registrations.length === 0) {
      return <div style={emptyChartStyle}>No hay suficientes datos de registro en el historial.</div>;
    }
    
    const data = analytics.registrations;
    const width = 600;
    const height = 220;
    const padding = 35;
    
    const maxVal = Math.max(...data.map(d => d.count), 5);
    const barWidth = 36;
    
    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = padding + r * (height - padding * 2);
          const val = Math.round(maxVal * (1 - r));
          return (
            <g key={i}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(0,0,0,0.05)" />
              <text x={padding - 8} y={y + 3} textAnchor="end" fontSize="10" fontWeight="600" fill="var(--text-muted)">
                {val}
              </text>
            </g>
          );
        })}
        
        {/* Bars */}
        {data.map((d, index) => {
          // Map x coordinate
          const x = padding + (index / (data.length - 1)) * (width - padding * 2 - barWidth * 2) + barWidth / 2;
          const barHeight = (d.count / maxVal) * (height - padding * 2);
          const y = height - padding - barHeight;
          
          return (
            <g key={index}>
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                fill="var(--secondary)" 
                rx="4" 
                ry="4"
              />
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text-primary)">
                {d.count}
              </text>
              <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-muted)">
                {d.month}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="container animated-fade-in" style={{ padding: '30px 24px 60px 24px' }}>
      
      {/* Top Header */}
      <div className="flex-between" style={{ marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={26} color="var(--primary)" />
            <span>Panel de Administración</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Módulo administrativo para gestionar clientes de ContaClaridad, controlar accesos premium y revisar estadísticas.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn btn-secondary" style={{ padding: '10px 16px' }} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spinner' : ''} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      {stats && (
        <div className="grid-4" style={{ marginBottom: '32px' }}>
          <div className="card" style={statCardStyle}>
            <span style={statLabelStyle}>Usuarios Registrados</span>
            <div style={statFlexStyle}>
              <h2 style={statNumberStyle}>{stats.totalUsers}</h2>
              <Users size={24} color="var(--primary)" style={{ opacity: 0.7 }} />
            </div>
          </div>

          <div className="card" style={statCardStyle}>
            <span style={statLabelStyle}>Suscripciones Premium</span>
            <div style={statFlexStyle}>
              <h2 style={statNumberStyle}>{stats.premiumUsers}</h2>
              <Sparkles size={24} color="var(--secondary)" style={{ opacity: 0.7 }} />
            </div>
          </div>

          <div className="card" style={statCardStyle}>
            <span style={statLabelStyle}>Clientes Gratuitos</span>
            <div style={statFlexStyle}>
              <h2 style={statNumberStyle}>{stats.freeUsers}</h2>
              <UserX size={24} color="var(--text-muted)" style={{ opacity: 0.7 }} />
            </div>
          </div>

          <div className="card" style={statCardStyle}>
            <span style={statLabelStyle}>Tasa de Conversión</span>
            <div style={statFlexStyle}>
              <h2 style={statNumberStyle}>{stats.conversionRate}%</h2>
              <UserCheck size={24} color="var(--accent-green)" style={{ opacity: 0.7 }} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div style={tabsContainerStyle}>
        <button 
          onClick={() => setActiveTab('users')} 
          style={{ ...tabButtonStyle, ...(activeTab === 'users' ? activeTabActiveStyle : {}) }}
        >
          <Users size={16} />
          <span>Gestión de Clientes</span>
        </button>
        <button 
          onClick={() => setActiveTab('payments')} 
          style={{ ...tabButtonStyle, ...(activeTab === 'payments' ? activeTabActiveStyle : {}) }}
        >
          <Receipt size={16} />
          <span>Historial de Pagos</span>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          style={{ ...tabButtonStyle, ...(activeTab === 'analytics' ? activeTabActiveStyle : {}) }}
        >
          <BarChart3 size={16} />
          <span>Analíticas</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')} 
          style={{ ...tabButtonStyle, ...(activeTab === 'settings' ? activeTabActiveStyle : {}) }}
        >
          <Settings size={16} />
          <span>Configuraciones</span>
        </button>
      </div>

      {/* Tab 1: Users/Clients Management */}
      {activeTab === 'users' && (
        <div className="animated-fade-in">
          {/* Search and Filters Bar */}
          <div className="card" style={filterBarStyle}>
            <div style={searchWrapperStyle}>
              <Search size={18} color="var(--text-muted)" style={searchIconStyle} />
              <input
                type="text"
                className="form-input"
                placeholder="Buscar por nombre o correo electrónico..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '45px', background: '#FFFDF2' }}
              />
            </div>

            <div style={filterSelectWrapperStyle}>
              <Filter size={16} color="var(--text-muted)" />
              <select 
                className="form-select" 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                style={{ width: 'auto', padding: '8px 12px', cursor: 'pointer', background: '#FFFDF2' }}
              >
                <option value="all">Todos los Usuarios</option>
                <option value="premium">Solo Clientes Premium</option>
                <option value="free">Solo Clientes Gratuitos</option>
                <option value="admin">Solo Administradores</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <div style={centeredContainerStyle}>
                <Loader2 className="spinner" size={32} color="var(--primary)" />
                <span style={{ marginTop: '12px' }}>Cargando listado de usuarios...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div style={centeredContainerStyle}>
                <ShieldAlert size={32} color="var(--text-muted)" />
                <span style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>No se encontraron usuarios con los filtros aplicados.</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Usuario / Empresa</th>
                      <th>Correo Electrónico</th>
                      <th>Registro</th>
                      <th>Rol</th>
                      <th>Estado Plan</th>
                      <th style={{ textAlign: 'right' }}>Acciones Administrativas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const isSelf = u.id === loggedUser.id;
                      const isActionLoading = actionLoading === u.id;
                      
                      return (
                        <tr key={u.id}>
                          <td>
                            <strong style={{ fontSize: '0.95rem' }}>{u.name}</strong>
                            {isSelf && <span style={selfBadgeStyle}>Tú</span>}
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {new Date(u.created_at).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: '2-digit' })}
                          </td>
                          <td>
                            {u.is_admin ? (
                              <span style={adminRoleBadgeStyle}>Administrador</span>
                            ) : (
                              <span style={clientRoleBadgeStyle}>Cliente</span>
                            )}
                          </td>
                          <td>
                            {u.is_subscribed ? (
                              <span className="badge badge-premium">
                                <Sparkles size={10} style={{ marginRight: '2px' }} />
                                Premium
                              </span>
                            ) : (
                              <span className="badge badge-free">
                                Gratuito
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={actionsGroupStyle}>
                              {!u.is_admin && (
                                <button
                                  onClick={() => handleToggleSubscription(u.id, u.is_subscribed)}
                                  className="btn btn-secondary"
                                  style={{ 
                                    padding: '6px 12px', 
                                    fontSize: '0.78rem',
                                    opacity: isActionLoading ? 0.5 : 1 
                                  }}
                                  disabled={isActionLoading}
                                >
                                  {u.is_subscribed ? (
                                    <>
                                      <StarOff size={12} color="var(--text-muted)" />
                                      <span>Hacer Gratis</span>
                                    </>
                                  ) : (
                                    <>
                                      <Star size={12} color="var(--secondary)" />
                                      <span style={{ color: 'var(--secondary)' }}>Hacer Premium</span>
                                    </>
                                  )}
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="btn btn-danger"
                                style={{ 
                                  padding: '6px 10px', 
                                  opacity: (isSelf || isActionLoading) ? 0.4 : 1,
                                  cursor: isSelf ? 'not-allowed' : 'pointer'
                                }}
                                disabled={isSelf || isActionLoading}
                                title={isSelf ? 'No puedes eliminarte a ti mismo' : 'Eliminar Usuario'}
                              >
                                {isActionLoading ? (
                                  <Loader2 className="spinner" size={14} />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Payments History Logs */}
      {activeTab === 'payments' && (
        <div className="animated-fade-in">
          {/* Search bar for payments */}
          <div className="card" style={filterBarStyle}>
            <div style={searchWrapperStyle}>
              <Search size={18} color="var(--text-muted)" style={searchIconStyle} />
              <input
                type="text"
                className="form-input"
                placeholder="Buscar pagos por cliente, correo o ID de transacción..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                style={{ paddingLeft: '45px', background: '#FFFDF2' }}
              />
            </div>
          </div>

          {/* Payments Table */}
          <div className="card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            {loading ? (
              <div style={centeredContainerStyle}>
                <Loader2 className="spinner" size={32} color="var(--primary)" />
                <span style={{ marginTop: '12px' }}>Cargando transacciones de cobro...</span>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div style={centeredContainerStyle}>
                <Receipt size={32} color="var(--text-muted)" />
                <span style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>No se encontraron transacciones en el historial.</span>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Correo Electrónico</th>
                      <th>PayPal Order ID</th>
                      <th>Monto Cobrado</th>
                      <th>Estado Pago</th>
                      <th>Fecha de Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.user_name}</strong></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{p.user_email}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary-dark)' }}>{p.paypal_order_id}</td>
                        <td style={{ fontWeight: '700' }}>
                          ${parseFloat(p.amount).toFixed(2)} {p.currency}
                        </td>
                        <td>
                          <span style={paymentSuccessBadgeStyle}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {new Date(p.created_at).toLocaleString('es-DO', { 
                            year: 'numeric', month: 'short', day: '2-digit', 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Interactive SVG Analytics */}
      {activeTab === 'analytics' && (
        <div className="animated-fade-in">
          {loading ? (
            <div className="card" style={{ ...centeredContainerStyle, minHeight: '400px' }}>
              <Loader2 className="spinner" size={32} color="var(--primary)" />
              <span style={{ marginTop: '12px' }}>Analizando métricas del servidor...</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Row 1: Line Chart & Bar Chart */}
              <div className="grid-2">
                
                {/* Monthly Revenue Chart */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: '700' }}>Ingresos Mensuales Recurrentes (MRR)</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Facturación total acumulada por mes (USD) de suscripciones capturadas en PayPal.
                  </p>
                  <div style={chartWrapperStyle}>
                    {renderRevenueChart()}
                  </div>
                </div>

                {/* Monthly Registrations Chart */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', fontWeight: '700' }}>Nuevos Usuarios Registrados</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Tasa de altas mensuales de cuentas de clientes creadas en el sistema.
                  </p>
                  <div style={chartWrapperStyle}>
                    {renderRegistrationsChart()}
                  </div>
                </div>

              </div>

              {/* Row 2: Currency Preferences Progress Card */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: '700' }}>Preferencia de Moneda de Trabajo</h3>
                {analytics && analytics.currencies ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {analytics.currencies.map((c, i) => {
                      const total = analytics.currencies.reduce((sum, curr) => sum + curr.count, 0);
                      const percent = total > 0 ? ((c.count / total) * 100).toFixed(1) : 0;
                      
                      return (
                        <div key={i}>
                          <div className="flex-between" style={{ marginBottom: '6px', fontSize: '0.9rem' }}>
                            <strong style={{ color: 'var(--text-primary)' }}>
                              {c.currency === 'USD' ? 'Dólar Estadounidense ($ - USD)' : 'Peso Dominicano (RD$ - DOP)'}
                            </strong>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                              {c.count} usuarios ({percent}%)
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '12px', background: 'var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${percent}%`, 
                              height: '100%', 
                              background: c.currency === 'USD' ? 'var(--primary)' : 'var(--secondary)',
                              borderRadius: '6px',
                              transition: 'width 0.8s ease'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Cargando datos de monedas...</div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Tab 4: System Configurations Settings */}
      {activeTab === 'settings' && (
        <div className="animated-fade-in card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={20} color="var(--primary)" />
            <span>Configuración de Negocio e Integración</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Edita los parámetros globales del sistema. Estos cambios aplican inmediatamente para todos los visitantes y clientes.
          </p>

          <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px' }}>
            {/* PayPal Client ID */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700' }}>PayPal Client ID (Credenciales Developer)</label>
              <input
                type="text"
                className="form-input"
                value={paypalClientId}
                onChange={(e) => setPaypalClientId(e.target.value)}
                placeholder="Ej. sb (Sandbox) o tu Client ID de PayPal Developer"
                required
                style={{ background: '#FFFDF2' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Utiliza "sb" para transacciones ficticias en Sandbox. Cambia al Client ID de producción para recibir pagos reales.
              </span>
            </div>

            {/* Plan Price */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '700' }}>Precio del Plan Premium (USD)</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={inputPrefixStyle}>$</span>
                <input
                  type="number"
                  className="form-input"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                  placeholder="27"
                  required
                  min="0.01"
                  step="0.01"
                  style={{ borderRadius: '0 6px 6px 0', background: '#FFFDF2' }}
                />
                <span style={{ marginLeft: '12px', fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)' }}>USD / mes</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                El precio ingresado se cobrará en dólares estadounidenses y actualizará automáticamente la Landing Page y el modal de checkout.
              </span>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '12px 24px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
              disabled={savingSettings}
            >
              <span>{savingSettings ? 'Guardando...' : 'Guardar Configuraciones'}</span>
            </button>
          </form>

          {settingsMessage && (
            <div style={settingsSuccessStyle}>
              ✓ {settingsMessage}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

// Inline Styles
const statCardStyle = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '8px',
  minHeight: '110px'
};

const statLabelStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  fontWeight: '700',
  textTransform: 'uppercase'
};

const statFlexStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline'
};

const statNumberStyle = {
  fontSize: '1.8rem',
  fontWeight: '800',
  letterSpacing: '-0.02em'
};

const filterBarStyle = {
  padding: '16px',
  marginBottom: '24px',
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap',
  alignItems: 'center',
  background: 'rgba(254, 237, 179, 0.25)'
};

const searchWrapperStyle = {
  flex: 1,
  minWidth: '280px',
  position: 'relative'
};

const searchIconStyle = {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)'
};

const filterSelectWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const centeredContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 0',
  flex: 1
};

const selfBadgeStyle = {
  marginLeft: '8px',
  fontSize: '0.7rem',
  background: 'var(--primary)',
  color: 'white',
  padding: '2px 6px',
  borderRadius: '4px',
  fontWeight: '700',
  textTransform: 'uppercase'
};

const adminRoleBadgeStyle = {
  fontSize: '0.75rem',
  fontWeight: '700',
  color: 'var(--primary)',
  background: 'var(--primary-glow)',
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)'
};

const clientRoleBadgeStyle = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--text-secondary)'
};

const actionsGroupStyle = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end',
  alignItems: 'center'
};

/* Tabs Styles */
const tabsContainerStyle = {
  display: 'flex',
  gap: '8px',
  borderBottom: '1px solid var(--border-color)',
  marginBottom: '24px',
  flexWrap: 'wrap'
};

const tabButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'none',
  border: 'none',
  padding: '12px 18px',
  fontWeight: '600',
  fontSize: '0.9rem',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  borderBottom: '2px solid transparent',
  transition: 'var(--transition-fast)'
};

const tabActiveStyle = {
  borderBottom: '2px solid var(--primary)',
  color: 'var(--primary)',
  background: 'var(--primary-glow)'
};

// Reusable tab active style extension
const tabActiveStyleCombined = {
  borderBottom: '2px solid var(--primary)',
  color: 'var(--primary)'
};

const activeTabActiveStyle = {
  borderBottom: '2px solid var(--primary)',
  color: 'var(--primary)',
  background: 'rgba(1, 128, 129, 0.05)'
};

const paymentSuccessBadgeStyle = {
  background: 'rgba(40, 167, 69, 0.1)',
  color: 'var(--accent-green)',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.8rem',
  fontWeight: '700',
  textTransform: 'capitalize',
  display: 'inline-block'
};

const inputPrefixStyle = {
  background: 'rgba(0, 0, 0, 0.05)',
  border: '1px solid var(--border-color)',
  borderRight: 'none',
  padding: '10px 14px',
  fontSize: '1rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  borderRadius: '6px 0 0 6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '42px'
};

const settingsSuccessStyle = {
  color: 'var(--accent-green)',
  fontSize: '0.9rem',
  fontWeight: '700',
  marginTop: '16px'
};

const chartWrapperStyle = {
  minHeight: '220px',
  position: 'relative',
  width: '100%',
  padding: '8px 0'
};

const emptyChartStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '200px',
  color: 'var(--text-secondary)',
  fontSize: '0.9rem',
  border: '1px dashed var(--border-color)',
  borderRadius: '8px',
  width: '100%'
};

export default AdminDashboard;
