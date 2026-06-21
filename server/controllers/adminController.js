const db = require('../config/db');

// Get all users and statistics
exports.getUsersList = async (req, res) => {
  try {
    // 1. Fetch users list
    const [users] = await db.query(
      'SELECT id, name, email, is_subscribed, is_admin, created_at FROM users ORDER BY created_at DESC'
    );

    // 2. Calculate statistics
    let totalUsers = users.length;
    let premiumUsers = 0;
    let freeUsers = 0;
    let adminUsers = 0;

    users.forEach(u => {
      if (u.is_admin) adminUsers++;
      if (u.is_subscribed) {
        premiumUsers++;
      } else {
        freeUsers++;
      }
    });

    const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0;

    return res.json({
      stats: {
        totalUsers,
        premiumUsers,
        freeUsers,
        adminUsers,
        conversionRate
      },
      users
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al obtener lista de usuarios.' });
  }
};

// Toggle user subscription status manually
exports.toggleUserSubscription = async (req, res) => {
  const { id } = req.params;
  const { is_subscribed } = req.body;

  if (is_subscribed === undefined) {
    return res.status(400).json({ message: 'El estado de suscripción es requerido.' });
  }

  try {
    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Update subscription
    await db.query('UPDATE users SET is_subscribed = ? WHERE id = ?', [!!is_subscribed, id]);

    return res.json({
      message: `Suscripción ${is_subscribed ? 'activada' : 'desactivada'} con éxito para el usuario.`,
      is_subscribed: !!is_subscribed
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al actualizar la suscripción.' });
  }
};

// Delete user account
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  if (parseInt(id, 10) === parseInt(adminId, 10)) {
    return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador.' });
  }

  try {
    // Check if user exists
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Delete user
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    return res.json({ message: 'Usuario y sus transacciones eliminados con éxito.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al eliminar el usuario.' });
  }
};

// Get admin settings (updated to include plan_price)
exports.getSettings = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT key_name, key_value FROM settings");
    const settings = {};
    rows.forEach(r => {
      settings[r.key_name] = r.key_value;
    });
    
    // Set defaults
    if (!settings.paypal_client_id) settings.paypal_client_id = 'sb';
    if (!settings.plan_price) settings.plan_price = '27';
    
    return res.json(settings);
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    return res.status(500).json({ message: 'Error en el servidor al obtener configuraciones.' });
  }
};

// Update admin settings (supports both paypal_client_id and plan_price)
exports.updateSettings = async (req, res) => {
  const { paypal_client_id, plan_price } = req.body;

  try {
    if (paypal_client_id !== undefined) {
      await db.query(
        'INSERT INTO settings (key_name, key_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_value = ?',
        ['paypal_client_id', paypal_client_id, paypal_client_id]
      );
    }
    
    if (plan_price !== undefined) {
      await db.query(
        'INSERT INTO settings (key_name, key_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_value = ?',
        ['plan_price', String(plan_price), String(plan_price)]
      );
    }

    return res.json({
      message: 'Configuraciones del sistema actualizadas con éxito.',
      paypal_client_id,
      plan_price
    });
  } catch (error) {
    console.error('Error al actualizar configuraciones:', error);
    return res.status(500).json({ message: 'Error en el servidor al actualizar configuraciones.' });
  }
};

// Get all billing payments list
exports.getPaymentsList = async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT p.id, p.paypal_order_id, p.amount, p.currency, p.status, p.created_at, u.name as user_name, u.email as user_email
      FROM payments p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    return res.json(payments);
  } catch (error) {
    console.error('Error al obtener lista de pagos:', error);
    return res.status(500).json({ message: 'Error en el servidor al obtener historial de pagos.' });
  }
};

// Get monthly statistics for registrations and payments revenue (last 6 months)
exports.getAnalyticsStats = async (req, res) => {
  try {
    // 1. Fetch user registrations grouped by month (last 6 months)
    const [registrations] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // 2. Fetch payments revenue grouped by month (last 6 months)
    const [revenue] = await db.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as total
      FROM payments
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `);

    // 3. Fetch user distribution by currency preference
    const [currencies] = await db.query(`
      SELECT currency, COUNT(*) as count
      FROM users
      GROUP BY currency
    `);

    // Generate list of last 6 months to ensure months with 0 stats are populated
    const data = [];
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).replace('.', '');
      const key = d.toISOString().substring(0, 7); // YYYY-MM
      months.push({ key, label });
    }

    const registrationData = months.map(m => {
      const found = registrations.find(r => r.month === m.key);
      return {
        month: m.label,
        count: found ? found.count : 0
      };
    });

    const revenueData = months.map(m => {
      const found = revenue.find(r => r.month === m.key);
      return {
        month: m.label,
        total: found ? parseFloat(found.total) : 0
      };
    });

    return res.json({
      registrations: registrationData,
      revenue: revenueData,
      currencies
    });
  } catch (error) {
    console.error('Error al generar analíticas:', error);
    return res.status(500).json({ message: 'Error en el servidor al generar analíticas.' });
  }
};
