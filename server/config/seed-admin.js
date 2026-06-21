const db = require('./db');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    console.log('Iniciando migración y seeding de administrador...');

    // 1. Alter table to add is_admin if not exists
    try {
      await db.query('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE');
      console.log('Columna is_admin agregada con éxito a la tabla users.');
    } catch (err) {
      if (err.code === 'ER_DUP_COLUMN_NAME') {
        console.log('La columna is_admin ya existe en la tabla users.');
      } else {
        throw err;
      }
    }

    // 2. Encrypt admin password
    const adminEmail = 'admin@contaclaridad.com';
    const adminPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // 3. Check if admin exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [adminEmail]);

    if (existing.length === 0) {
      // Insert new admin
      await db.query(
        'INSERT INTO users (name, email, password, is_subscribed, is_admin) VALUES (?, ?, ?, true, true)',
        ['Administrador', adminEmail, hashedPassword]
      );
      console.log('Usuario administrador creado con éxito: admin@contaclaridad.com / admin123');
    } else {
      // Update existing user to admin and set password
      await db.query(
        'UPDATE users SET password = ?, is_admin = true, is_subscribed = true WHERE email = ?',
        [hashedPassword, adminEmail]
      );
      console.log('Usuario existente actualizado a administrador y contraseña restablecida.');
    }

    console.log('Seeding completado con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante el seeding:', error);
    process.exit(1);
  }
};

seedAdmin();
