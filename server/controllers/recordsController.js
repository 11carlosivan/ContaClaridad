const db = require('../config/db');

// Add a new record
exports.addRecord = async (req, res) => {
  const { record_type, concept, category, quantity, unit_price, amount, date } = req.body;
  const user_id = req.user.id;

  if (!record_type || !concept || !category || !date) {
    return res.status(400).json({ message: 'Los campos tipo, concepto, categoría y fecha son obligatorios.' });
  }

  // Calculate amount automatically if quantity and unit_price are provided
  let finalAmount = amount;
  const qty = quantity ? parseInt(quantity, 10) : null;
  const price = unit_price ? parseFloat(unit_price) : null;

  if (qty !== null && price !== null && !isNaN(qty) && !isNaN(price)) {
    finalAmount = qty * price;
  } else if (finalAmount === undefined || finalAmount === null || isNaN(parseFloat(finalAmount))) {
    return res.status(400).json({ message: 'Debe ingresar un monto válido o cantidad y precio unitario.' });
  } else {
    finalAmount = parseFloat(finalAmount);
  }

  try {
    const [result] = await db.query(
      'INSERT INTO records (user_id, record_type, concept, category, quantity, unit_price, amount, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, record_type, concept, category, qty, price, finalAmount, date]
    );

    return res.status(201).json({
      message: 'Registro creado con éxito.',
      record: {
        id: result.insertId,
        user_id,
        record_type,
        concept,
        category,
        quantity: qty,
        unit_price: price,
        amount: finalAmount,
        date
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al agregar registro.' });
  }
};

// Get records for a specific month/year
exports.getRecords = async (req, res) => {
  const user_id = req.user.id;
  const month = req.query.month ? parseInt(req.query.month, 10) : new Date().getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return res.status(400).json({ message: 'Mes o año inválido.' });
  }

  try {
    const [records] = await db.query(
      'SELECT * FROM records WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ? ORDER BY date DESC, id DESC',
      [user_id, month, year]
    );

    return res.json(records);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al obtener registros.' });
  }
};

// Update record
exports.updateRecord = async (req, res) => {
  const { id } = req.params;
  const { record_type, concept, category, quantity, unit_price, amount, date } = req.body;
  const user_id = req.user.id;

  if (!record_type || !concept || !category || !date) {
    return res.status(400).json({ message: 'Los campos tipo, concepto, categoría y fecha son obligatorios.' });
  }

  let finalAmount = amount;
  const qty = quantity ? parseInt(quantity, 10) : null;
  const price = unit_price ? parseFloat(unit_price) : null;

  if (qty !== null && price !== null && !isNaN(qty) && !isNaN(price)) {
    finalAmount = qty * price;
  } else if (finalAmount === undefined || finalAmount === null || isNaN(parseFloat(finalAmount))) {
    return res.status(400).json({ message: 'Debe ingresar un monto válido.' });
  } else {
    finalAmount = parseFloat(finalAmount);
  }

  try {
    // Check ownership
    const [existing] = await db.query('SELECT id FROM records WHERE id = ? AND user_id = ?', [id, user_id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Registro no encontrado o no autorizado.' });
    }

    await db.query(
      'UPDATE records SET record_type = ?, concept = ?, category = ?, quantity = ?, unit_price = ?, amount = ?, date = ? WHERE id = ?',
      [record_type, concept, category, qty, price, finalAmount, date, id]
    );

    return res.json({
      message: 'Registro actualizado con éxito.',
      record: {
        id,
        user_id,
        record_type,
        concept,
        category,
        quantity: qty,
        unit_price: price,
        amount: finalAmount,
        date
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al actualizar el registro.' });
  }
};

// Delete record
exports.deleteRecord = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Check ownership
    const [existing] = await db.query('SELECT id FROM records WHERE id = ? AND user_id = ?', [id, user_id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Registro no encontrado o no autorizado.' });
    }

    await db.query('DELETE FROM records WHERE id = ?', [id]);
    return res.json({ message: 'Registro eliminado con éxito.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al eliminar el registro.' });
  }
};

// Get monthly accounting report (Estado de Resultados)
exports.getReport = async (req, res) => {
  const user_id = req.user.id;
  const month = req.query.month ? parseInt(req.query.month, 10) : new Date().getMonth() + 1;
  const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

  if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
    return res.status(400).json({ message: 'Mes o año inválido.' });
  }

  try {
    // 1. Check user subscription status directly from db
    const [users] = await db.query('SELECT is_subscribed, is_admin, trial_ends_at FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    const isTrialActive = users[0].trial_ends_at && new Date(users[0].trial_ends_at) > new Date();
    const isSubscribed = !!users[0].is_subscribed || !!users[0].is_admin || !!isTrialActive;

    // 2. Fetch all records for the month to do the calculations
    const [records] = await db.query(
      'SELECT record_type, category, amount FROM records WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?',
      [user_id, month, year]
    );

    // 3. Perform calculations
    let totalVentas = 0;
    let totalCostoVentas = 0;
    let totalGastosOperativos = 0;
    let totalIntereses = 0;
    let totalImpuestos = 0;

    // Detail dictionary for operational expenses
    const detailGastosOperativos = {
      'Alquiler': 0,
      'Electricidad': 0,
      'Publicidad': 0,
      'Sueldos': 0,
      'Otros Gastos Operativos': 0
    };

    records.forEach(rec => {
      const amt = parseFloat(rec.amount);
      if (rec.record_type === 'ingreso') {
        totalVentas += amt;
      } else if (rec.record_type === 'costo') {
        totalCostoVentas += amt;
      } else if (rec.record_type === 'gasto') {
        if (rec.category === 'Intereses') {
          totalIntereses += amt;
        } else if (rec.category === 'Impuestos') {
          totalImpuestos += amt;
        } else {
          // Operating expense
          totalGastosOperativos += amt;
          if (detailGastosOperativos[rec.category] !== undefined) {
            detailGastosOperativos[rec.category] += amt;
          } else {
            detailGastosOperativos['Otros Gastos Operativos'] += amt;
          }
        }
      }
    });

    const utilidadBruta = totalVentas - totalCostoVentas;
    const utilidadOperativa = utilidadBruta - totalGastosOperativos;
    const utilidadAntesImpuestos = utilidadOperativa - totalIntereses;
    const utilidadNeta = utilidadAntesImpuestos - totalImpuestos;

    // Format numbers
    const format = (val) => parseFloat(val.toFixed(2));

    // Base report (Free tier)
    const report = {
      month,
      year,
      ventas: format(totalVentas),
      costo_ventas: format(totalCostoVentas),
      utilidad_bruta: format(utilidadBruta),
      is_locked: !isSubscribed
    };

    // If subscribed, append the rest of the details
    if (isSubscribed) {
      report.gastos_operativos = format(totalGastosOperativos);
      report.gastos_operativos_detail = {
        alquiler: format(detailGastosOperativos['Alquiler']),
        electricidad: format(detailGastosOperativos['Electricidad']),
        publicidad: format(detailGastosOperativos['Publicidad']),
        sueldos: format(detailGastosOperativos['Sueldos']),
        otros: format(detailGastosOperativos['Otros Gastos Operativos'])
      };
      report.utilidad_operativa = format(utilidadOperativa);
      report.intereses = format(totalIntereses);
      report.utilidad_antes_impuestos = format(utilidadAntesImpuestos);
      report.impuestos = format(totalImpuestos);
      report.utilidad_neta = format(utilidadNeta);
    }

    return res.json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error en el servidor al generar reporte.' });
  }
};
