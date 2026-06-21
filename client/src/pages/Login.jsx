import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ShieldAlert, Loader2 } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authWrapperStyle}>
      <div className="card animated-fade-in" style={authCardStyle}>
        
        {/* Branding Area */}
        <div style={brandHeaderStyle}>
          <div style={logoContainerStyle}>
            <img src="/logo.jpeg" alt="ContaClaridad Mascot" style={logoImgStyle} />
          </div>
          <h1 style={titleStyle}>Conta<span style={{ color: 'var(--secondary)' }}>Claridad</span></h1>
          <p style={subtitleStyle}>La herramienta financiera para pymes y emprendedores</p>
        </div>

        {error && (
          <div style={errorBannerStyle}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="correo@empresa.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ paddingLeft: '45px' }}
              />
              <Mail size={18} style={inputIconStyle} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                style={{ paddingLeft: '45px' }}
              />
              <Lock size={18} style={inputIconStyle} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', marginTop: '10px' }}
          >
            {loading ? (
              <>
                <Loader2 className="spinner" size={20} />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Ingresar al Sistema</span>
            )}
          </button>
        </form>

        <div style={footerLinkStyle}>
          ¿No tienes una cuenta? <Link to="/register" style={{ fontWeight: '600' }}>Regístrate gratis</Link>
        </div>

      </div>
    </div>
  );
};

// Styles for Auth UI
const authWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '24px',
  background: 'radial-gradient(circle at center, hsla(215, 80%, 55%, 0.08) 0%, transparent 60%)'
};

const authCardStyle = {
  width: '100%',
  maxWidth: '420px',
  padding: '40px 32px'
};

const brandHeaderStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  marginBottom: '28px'
};

const logoContainerStyle = {
  width: '110px',
  height: '110px',
  borderRadius: '50%',
  overflow: 'hidden',
  border: '3px solid var(--primary)',
  boxShadow: '0 0 20px var(--primary-glow)',
  marginBottom: '16px'
};

const logoImgStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover'
};

const titleStyle = {
  fontSize: '2rem',
  fontWeight: '800',
  letterSpacing: '-0.04em',
  marginBottom: '4px'
};

const subtitleStyle = {
  color: 'var(--text-secondary)',
  fontSize: '0.85rem',
  maxWidth: '280px',
  lineHeight: '1.4'
};

const inputIconStyle = {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)'
};

const errorBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: 'var(--accent-red)',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '0.85rem',
  marginBottom: '20px'
};

const footerLinkStyle = {
  textAlign: 'center',
  marginTop: '24px',
  fontSize: '0.9rem',
  color: 'var(--text-secondary)'
};

export default Login;
