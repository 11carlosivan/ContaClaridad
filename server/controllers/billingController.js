const db = require('../config/db');

// Get public settings (PayPal Client ID & Plan Price) for landing page & billing modal
exports.getPublicConfig = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT key_name, key_value FROM settings WHERE key_name IN ('paypal_client_id', 'plan_price')"
    );
    
    const config = { paypalClientId: 'sb', planPrice: 27 };
    rows.forEach(r => {
      if (r.key_name === 'paypal_client_id') {
        config.paypalClientId = r.key_value;
      } else if (r.key_name === 'plan_price') {
        config.planPrice = parseFloat(r.key_value) || 27;
      }
    });
    
    return res.json(config);
  } catch (error) {
    console.error('Error al obtener configuración pública:', error);
    return res.status(500).json({ message: 'Error al obtener la configuración pública.' });
  }
};

// Simulate subscribing to Premium (now saving logs to payments table)
exports.subscribe = async (req, res) => {
  const user_id = req.user.id;
  const { paypalOrderId, amount, currency, cardNumber } = req.body;

  // Support both direct PayPal order object payload and backwards-compatible mock card formats
  let orderId = paypalOrderId;
  let payAmount = amount;
  let payCurrency = currency || 'USD';

  if (!orderId && cardNumber) {
    if (cardNumber.startsWith('PAYPAL_')) {
      orderId = cardNumber.replace('PAYPAL_', '');
    } else {
      orderId = 'CARD_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    }
  }

  if (!orderId) {
    return res.status(400).json({ message: 'Datos de pago e ID de orden de PayPal requeridos.' });
  }

  try {
    // If amount is not passed, fetch it from current DB settings
    if (!payAmount) {
      const [rows] = await db.query("SELECT key_value FROM settings WHERE key_name = 'plan_price'");
      payAmount = rows.length > 0 ? parseFloat(rows[0].key_value) : 27.00;
    }

    // 1. Insert transaction record into payments table
    await db.query(
      'INSERT INTO payments (user_id, paypal_order_id, amount, currency, status) VALUES (?, ?, ?, ?, ?)',
      [user_id, orderId, payAmount, payCurrency, 'completed']
    );

    // 2. Update user subscription status in users table
    await db.query('UPDATE users SET is_subscribed = true WHERE id = ?', [user_id]);

    return res.json({
      message: '¡Pago procesado con éxito! Ahora eres usuario Premium.',
      is_subscribed: true
    });
  } catch (error) {
    console.error('Error al procesar suscripción:', error);
    return res.status(500).json({ message: 'Error en el servidor al procesar la suscripción.' });
  }
};

// Cancel subscription
exports.unsubscribe = async (req, res) => {
  const user_id = req.user.id;

  try {
    await db.query('UPDATE users SET is_subscribed = false WHERE id = ?', [user_id]);

    return res.json({
      message: 'Suscripción cancelada con éxito.',
      is_subscribed: false
    });
  } catch (error) {
    console.error('Error al cancelar la suscripción:', error);
    return res.status(500).json({ message: 'Error en el servidor al cancelar la suscripción.' });
  }
};

// Get PayPal client ID config (authenticated version)
exports.getPayPalConfig = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT key_value FROM settings WHERE key_name = 'paypal_client_id'");
    const clientId = rows.length > 0 ? rows[0].key_value : 'sb';
    return res.json({ clientId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al obtener la configuración de PayPal.' });
  }
};
