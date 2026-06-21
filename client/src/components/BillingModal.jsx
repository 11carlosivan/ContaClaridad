import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle, ShieldAlert, Sparkles, X } from 'lucide-react';

const BillingModal = ({ isOpen, onClose }) => {
  const { apiFetch, updateSubscription } = useAuth();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [planPrice, setPlanPrice] = useState(27);

  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setLoading(true);

    const loadPayPalScript = async () => {
      try {
        const response = await apiFetch('/billing/public-config');
        if (!response.ok) throw new Error('Error al obtener la configuración de pagos.');
        const { paypalClientId, planPrice: price } = await response.json();
        
        setPlanPrice(price || 27);
        const clientId = paypalClientId || 'sb';

        if (window.paypal) {
          renderPayPalButtons(price || 27);
          return;
        }

        // Check if script is already injected in document to avoid duplicates
        let script = document.querySelector('script[src*="paypal.com/sdk/js"]');
        if (script) {
          // If script tag exists but paypal isn't loaded yet
          script.onload = () => renderPayPalButtons(price || 27);
          // If script tag exists and paypal is already loaded
          if (window.paypal) {
            renderPayPalButtons(price || 27);
          }
          return;
        }

        script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
          renderPayPalButtons(price || 27);
        };
        script.onerror = () => {
          setError('Error al cargar la pasarela de PayPal. Revisa tu conexión.');
          setLoading(false);
        };
        document.body.appendChild(script);
      } catch (err) {
        setError(err.message || 'Error al obtener la configuración de PayPal.');
        setLoading(false);
      }
    };

    const renderPayPalButtons = (priceVal) => {
      if (!window.paypal) return;

      const container = document.getElementById('paypal-button-container');
      if (!container) {
        // Retry rendering shortly if container not yet in DOM
        setTimeout(() => renderPayPalButtons(priceVal), 100);
        return;
      }

      container.innerHTML = '';
      setLoading(false);

      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: 'USD',
                value: String(priceVal)
              },
              description: 'ContaClaridad Premium - Suscripción Mensual'
            }]
          });
        },
        onApprove: async (data, actions) => {
          setLoading(true);
          try {
            const details = await actions.order.capture();
            
            // Call backend to update user subscription status with payments logging
            const response = await apiFetch('/billing/subscribe', {
              method: 'POST',
              body: JSON.stringify({
                paypalOrderId: data.orderID,
                amount: priceVal,
                currency: 'USD'
              })
            });

            if (response.ok) {
              setSuccess(true);
              updateSubscription(true);
              setTimeout(() => {
                onClose();
                setSuccess(false);
              }, 2500);
            } else {
              const errData = await response.json();
              setError(errData.message || 'Error al guardar la suscripción en el sistema.');
            }
          } catch (err) {
            setError('Error al procesar la captura de pago con PayPal.');
            console.error(err);
          } finally {
            setLoading(false);
          }
        },
        onError: (err) => {
          setError('Ocurrió un error en la pasarela de pagos de PayPal.');
          console.error(err);
        }
      }).render('#paypal-button-container');
    };

    loadPayPalScript();

  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={modalOverlayStyle}>
      <div className="card animated-fade-in" style={modalContentStyle}>
        <button onClick={onClose} style={closeButtonStyle}>
          <X size={20} />
        </button>

        {!success ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <div style={badgeContainerStyle}>
                <Sparkles size={16} color="var(--secondary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase' }}>
                  ContaClaridad Premium
                </span>
              </div>
              <h2 style={{ fontSize: '1.6rem', marginTop: '10px' }}>Desbloquea tus Resultados</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Obtén acceso ilimitado al Estado de Resultados mensual, análisis de gastos, utilidad operativa y utilidad neta por solo <strong style={{ color: 'var(--text-primary)' }}>${planPrice}.00 USD/mes</strong>.
              </p>
            </div>

            {error && (
              <div style={errorBannerStyle}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            {loading && (
              <div style={spinnerContainerStyle}>
                <Loader2 className="spinner" size={32} color="var(--primary)" />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Cargando pasarela de pago...</span>
              </div>
            )}

            {/* Container where PayPal SDK renders buttons */}
            <div 
              id="paypal-button-container" 
              style={{ 
                minHeight: '150px', 
                marginTop: '8px', 
                display: loading ? 'none' : 'block' 
              }}
            ></div>

            <p style={secureFooterStyle}>
              🔒 Compra simulada en entorno de pruebas PayPal Sandbox.
            </p>
          </div>
        ) : (
          <div style={successContainerStyle}>
            <CheckCircle size={60} color="var(--accent-green)" />
            <h2 style={{ fontSize: '1.5rem', marginTop: '16px' }}>¡Suscripción Exitosa!</h2>
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '8px' }}>
              Tu cuenta ha sido actualizada a Premium. Ya puedes ver todos tus reportes contables.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline styles for modal layout
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(18, 44, 48, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(8px)',
  padding: '16px'
};

const modalContentStyle = {
  position: 'relative',
  width: '100%',
  maxWidth: '440px',
  background: '#FFFDF2',
  border: '1px solid var(--border-color)',
  boxShadow: 'var(--shadow-lg), 0 0 30px rgba(1, 128, 129, 0.05)',
  padding: '32px'
};

const closeButtonStyle = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'var(--transition-fast)'
};

const badgeContainerStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  backgroundColor: 'rgba(255, 165, 3, 0.12)',
  padding: '6px 12px',
  borderRadius: '20px',
  border: '1px solid rgba(255, 165, 3, 0.25)'
};

const errorBannerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: 'rgba(189, 33, 48, 0.05)',
  border: '1px solid rgba(189, 33, 48, 0.15)',
  color: 'var(--accent-red)',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '0.9rem'
};

const successContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 10px',
  animation: 'fadeIn 0.3s ease-out'
};

const secureFooterStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  textAlign: 'center',
  marginTop: '8px'
};

const spinnerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  padding: '40px 0'
};

export default BillingModal;
