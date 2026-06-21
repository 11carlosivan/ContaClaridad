import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileSpreadsheet, Sparkles, AlertCircle, Users } from 'lucide-react';
import BillingModal from './BillingModal';

const Header = () => {
  const { user, logout, apiFetch, updateSubscription, updateUserCurrency } = useAuth();
  const navigate = useNavigate();
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar tu suscripción Premium? Perderás el acceso al Estado de Resultados y cálculos de Utilidad Neta.')) {
      return;
    }

    setCancelling(true);
    try {
      const response = await apiFetch('/billing/unsubscribe', { method: 'POST' });
      if (response.ok) {
        updateSubscription(false);
        alert('Suscripción cancelada con éxito. Has vuelto al plan gratuito.');
      } else {
        alert('Error al cancelar la suscripción.');
      }
    } catch (err) {
      console.error(err);
      alert('Error en la comunicación con el servidor.');
    } finally {
      setCancelling(false);
    }
  };

  const handleCurrencyChange = async (e) => {
    const newCurrency = e.target.value;
    try {
      const response = await apiFetch('/auth/currency', {
        method: 'PUT',
        body: JSON.stringify({ currency: newCurrency })
      });
      if (response.ok) {
        updateUserCurrency(newCurrency);
      } else {
        alert('Error al actualizar la moneda.');
      }
    } catch (err) {
      console.error(err);
      alert('Error en la comunicación con el servidor.');
    }
  };

  return (
    <>
      <header style={headerStyle}>
        <div className="container" style={headerContainerStyle}>
          {/* Logo & Brand */}
          <div style={brandStyle} onClick={() => navigate('/dashboard')}>
            <div style={logoWrapperStyle}>
              <img src="/logo.jpeg" alt="ContaClaridad Logo" style={logoImgStyle} />
            </div>
            <div>
              <span style={logoTextStyle}>Conta<span style={{ color: 'var(--secondary)' }}>Claridad</span></span>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '-2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Tu Utilidad al Instante
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={navStyle}>
            <NavLink 
              to="/dashboard" 
              style={({ isActive }) => ({
                ...navLinkStyle,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent'
              })}
            >
              <LayoutDashboard size={18} />
              <span>Transacciones</span>
            </NavLink>
            <NavLink 
              to="/report" 
              style={({ isActive }) => ({
                ...navLinkStyle,
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent'
              })}
            >
              <FileSpreadsheet size={18} />
              <span>Estado de Resultados</span>
            </NavLink>
            {user.is_admin && (
              <NavLink 
                to="/admin" 
                style={({ isActive }) => ({
                  ...navLinkStyle,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent'
                })}
              >
                <Users size={18} />
                <span>Panel Admin</span>
              </NavLink>
            )}
          </nav>

          {/* User Info & Subscription Action */}
          <div style={userActionsStyle}>
            <select 
              value={user.currency || 'DOP'} 
              onChange={handleCurrencyChange}
              style={currencySelectStyle}
              title="Seleccionar moneda de trabajo"
            >
              <option value="DOP">DOP (RD$)</option>
              <option value="USD">USD ($)</option>
            </select>

            <div style={userInfoStyle}>
              <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</span>
              {user.is_subscribed ? (
                <span className="badge badge-premium">
                  <Sparkles size={10} style={{ marginRight: '2px' }} />
                  Premium
                </span>
              ) : (
                <span className="badge badge-free">
                  Gratuito
                </span>
              )}
            </div>

            {user.is_subscribed ? (
              <button 
                onClick={handleCancelSubscription} 
                className="btn btn-secondary" 
                style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelando...' : 'Cancelar Premium'}
              </button>
            ) : (
              <button 
                onClick={() => setIsBillingOpen(true)} 
                className="btn btn-premium" 
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              >
                <Sparkles size={14} />
                <span>Subir a Premium</span>
              </button>
            )}

            <button 
              onClick={handleLogout} 
              className="btn btn-danger" 
              style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} />
    </>
  );
};

// Styles for Header
const headerStyle = {
  background: 'rgba(255, 253, 242, 0.9)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid var(--border-color)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  padding: '12px 0'
};

const headerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  flexWrap: 'wrap'
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer'
};

const logoWrapperStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  overflow: 'hidden',
  border: '2px solid var(--primary)',
  boxShadow: '0 0 10px var(--primary-glow)'
};

const logoImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const logoTextStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '1.25rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  letterSpacing: '-0.03em'
};

const navStyle = {
  display: 'flex',
  gap: '24px'
};

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 4px 6px 4px',
  fontWeight: '600',
  fontSize: '0.9rem',
  transition: 'var(--transition-fast)'
};

const userActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const userInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '2px'
};

const currencySelectStyle = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  background: '#FFFDF2',
  color: 'var(--text-primary)',
  fontWeight: '600',
  fontSize: '0.85rem',
  cursor: 'pointer',
  outline: 'none',
  transition: 'var(--transition-fast)'
};

export default Header;
