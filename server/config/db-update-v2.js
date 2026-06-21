const db = require('./db');

const updateDatabaseV2 = async () => {
  try {
    console.log('Iniciando actualización de la base de datos (Fase v2)...');

    // 1. Crear tabla 'payments'
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        paypal_order_id VARCHAR(100) UNIQUE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Tabla 'payments' verificada/creada con éxito.");

    // 2. Inicializar 'plan_price' en settings
    await db.query(`
      INSERT IGNORE INTO settings (key_name, key_value) 
      VALUES ('plan_price', '27')
    `);
    console.log("Configuración inicial del precio del plan establecida en 27 USD.");

    console.log('Fase v2 de actualización de base de datos finalizada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error durante la actualización de la base de datos (Fase v2):', error);
    process.exit(1);
  }
};

updateDatabaseV2();
