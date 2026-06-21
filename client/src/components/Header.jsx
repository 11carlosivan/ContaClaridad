import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, FileSpreadsheet, Sparkles, Users, Menu, X } from 'lucide-react';
import BillingModal from './BillingModal';

const Header = () => {
  const { user, logout, apiFetch, updateSubscription, updateUserCurrency } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar tu suscripción Premium?')) return;
    setCancelling(true);
    try {
      const response = await apiFetch('/billing/unsubscribe', { method: 'POST' });
      if (response.ok) {
        updateSubscription(false);
        alert('Suscripción cancelada con éxito.');
      } else {
        alert('Error al cancelar la suscripción.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor.');
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { to: '/dashboard', label: 'Transacciones', icon: <LayoutDashboard size={18} /> },
    { to: '/report', label: 'Estado de Resultados', icon: <FileSpreadsheet size={18} /> },
    ...(user.is_admin ? [{ to: '/admin', label: 'Panel Admin', icon: <Users size={18} /> }] : [])
  ];

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
              <div style={logoSubStyle}>Tu Utilidad al Instante</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="header-desktop-nav" style={navStyle}>
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) => ({
                  ...navLinkStyle,
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent'
                })}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Desktop User Actions */}
          <div className="header-desktop-actions" style={userActionsStyle}>
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
              <span style={{ fontWeight: '600', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
              {user.is_subscribed ? (
                <span className="badge badge-premium"><Sparkles size={10} /> Premium</span>
              ) : (
                <span className="badge badge-free">Gratuito</span>
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
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              >
                <Sparkles size={14} />
                <span>Premium</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ padding: '8px 10px' }}
              title="Cerrar Sesión"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Hamburger Button (Mobile) */}
          <button
            className={`hamburger-btn ${mobileMenuOpen ? 'open' : ''}`}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Abrir menú"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Mobile Full-Screen Menu */}
      <div className={`header-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          style={mobileCloseStyle}
          aria-label="Cerrar menú"
        >
          <X size={22} />
        </button>

        {/* User Info Block */}
        <div style={mobileUserBlockStyle}>
          <div style={logoWrapperStyle}>
            <img src="/logo.jpeg" alt="Logo" style={logoImgStyle} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{user.name}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
          {user.is_subscribed ? (
            <span className="badge badge-premium"><Sparkles size={10} /> Premium</span>
          ) : (
            <span className="badge badge-free">Gratuito</span>
          )}
        </div>

        <div className="header-mobile-divider"></div>

        {/* Nav Links */}
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `header-mobile-nav-link${isActive ? ' active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}

        <div className="header-mobile-divider"></div>

        {/* Currency & Billing */}
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '4px' }}>
            Moneda de trabajo
          </div>
          <select
            value={user.currency || 'DOP'}
            onChange={handleCurrencyChange}
            style={{ ...currencySelectStyle, width: '100%', padding: '11px 14px', fontSize: '0.95rem' }}
          >
            <option value="DOP">DOP – Peso Dominicano (RD$)</option>
            <option value="USD">USD – Dólar Americano ($)</option>
          </select>
        </div>

        {!user.is_subscribed && (
          <button
            onClick={() => { setIsBillingOpen(true); setMobileMenuOpen(false); }}
            className="btn btn-premium"
            style={{ width: '100%', padding: '14px' }}
          >
            <Sparkles size={16} />
            <span>Subir a Premium</span>
          </button>
        )}

        {user.is_subscribed && (
          <button
            onClick={handleCancelSubscription}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
            disabled={cancelling}
          >
            {cancelling ? 'Cancelando...' : 'Cancelar Suscripción Premium'}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="btn btn-danger"
          style={{ width: '100%', padding: '12px', fontSize: '0.9rem', marginTop: '4px' }}
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} />
    </>
  );
};

const headerStyle = {
  background: 'rgba(255, 253, 242, 0.92)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid var(--border-color)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  padding: '10px 0'
};

const headerContainerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px'
};

const brandStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  flexShrink: 0
};

const logoWrapperStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  overflow: 'hidden',
  border: '2px solid var(--primary)',
  boxShadow: '0 0 10px var(--primary-glow)',
  flexShrink: 0
};

const logoImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const logoTextStyle = {
  fontFamily: 'var(--font-heading)',
  fontSize: '1.2rem',
  fontWeight: '800',
  color: 'var(--text-primary)',
  letterSpacing: '-0.03em',
  display: 'block',
  lineHeight: 1
};

const logoSubStyle = {
  fontSize: '0.6rem',
  color: 'var(--text-muted)',
  marginTop: '2px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase'
};

const navStyle = {
  display: 'flex',
  gap: '4px',
  flex: 1,
  justifyContent: 'center'
};

const navLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  padding: '8px 12px 6px 12px',
  fontWeight: '600',
  fontSize: '0.88rem',
  transition: 'color 0.2s ease',
  borderRadius: '6px 6px 0 0'
};

const userActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexShrink: 0
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
  fontSize: '0.83rem',
  cursor: 'pointer',
  outline: 'none',
  transition: 'var(--transition-fast)',
  WebkitAppearance: 'none',
  appearance: 'none'
};

const mobileCloseStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'none',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '8px',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const mobileUserBlockStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '4px 0',
  flexWrap: 'wrap'
};

export default Header;
