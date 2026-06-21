const db = require('./db');

const updateDatabase = async () => {
  try {
    console.log('Iniciando actualización de la base de datos...');

    // 1. Agregar columna 'currency' a la tabla 'users'
    try {
      await db.query("ALTER TABLE users ADD COLUMN currency VARCHAR(10) DEFAULT 'DOP'");
      console.log("Columna 'currency' agregada a la tabla users.");
    } catch (err) {
      if (err.code === 'ER_DUP_COLUMN_NAME') {
        console.log("La columna 'currency' ya existe en la tabla users.");
      } else {
        throw err;
      }
    }

    // 2. Crear tabla 'settings'
    await db.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key_name VARCHAR(100) PRIMARY KEY,
        key_value TEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Tabla 'settings' verificada/creada con éxito.");

    // 3. Inicializar 'paypal_client_id' con 'sb' por defecto
    await db.query(`
      INSERT IGNORE INTO settings (key_name, key_value) 
      VALUES ('paypal_client_id', 'sb')
    `);
    console.log("Configuración inicial de PayPal configurada en 'sb'.");

    console.log('Actualización de base de datos finalizada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la actualización de la base de datos:', error);
    process.exit(1);
  }
};

updateDatabase();
