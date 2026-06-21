const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  try {
    // Check if user exists
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, is_subscribed) VALUES (?, ?, ?, false)',
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    // Create token
    const token = jwt.sign(
      { id: userId, email, name, is_subscribed: false, is_admin: false },
      process.env.JWT_SECRET || 'supersecret_key_contaclaridad_2026_xYz',
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      token,
      user: { id: userId, name, email, is_subscribed: false, is_admin: false, currency: 'DOP' }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al registrar el usuario.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'El correo y la contraseña son requeridos.' });
  }

  try {
    // Find user
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Credenciales incorrectas.' });
    }

    const user = users[0];

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciales incorrectas.' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, is_subscribed: !!user.is_subscribed, is_admin: !!user.is_admin },
      process.env.JWT_SECRET || 'supersecret_key_contaclaridad_2026_xYz',
      { expiresIn: '30d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_subscribed: !!user.is_subscribed,
        is_admin: !!user.is_admin,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al iniciar sesión.' });
  }
};

exports.verify = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, is_subscribed, is_admin, currency FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const user = users[0];
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_subscribed: !!user.is_subscribed,
        is_admin: !!user.is_admin,
        currency: user.currency
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al verificar usuario.' });
  }
};

exports.updateCurrency = async (req, res) => {
  const user_id = req.user.id;
  const { currency } = req.body;

  if (!currency || (currency !== 'DOP' && currency !== 'USD')) {
    return res.status(400).json({ message: 'La moneda debe ser DOP o USD.' });
  }

  try {
    await db.query('UPDATE users SET currency = ? WHERE id = ?', [currency, user_id]);
    return res.json({
      message: 'Preferencia de moneda actualizada con éxito.',
      currency
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al actualizar la moneda.' });
  }
};
