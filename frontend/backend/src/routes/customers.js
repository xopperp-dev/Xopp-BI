const router = require('express').Router();
const { pool } = require('../db');
const auth = require('../middleware/authMiddleware');

// Search customers
router.get('/', auth(), async (req, res) => {
  try {
    const { q, nationality, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let where = [];
    let params = [];
    let i = 1;

    if (q) {
      where.push(`(c.name ILIKE $${i} OR c.phone ILIKE $${i} OR c.email ILIKE $${i} OR c.customer_id ILIKE $${i})`);
      params.push(`%${q}%`); i++;
    }
    if (nationality) {
      where.push(`c.nationality = $${i}`);
      params.push(nationality); i++;
    }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';

    const countRes = await pool.query(`SELECT COUNT(*) FROM customers c ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].count);

    params.push(parseInt(limit), offset);
    const { rows } = await pool.query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM ownership o WHERE o.customer_id = c.id AND NOT o.is_duplicate) as property_count
       FROM customers c
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${i} OFFSET $${i + 1}`,
      params
    );

    res.json({ data: rows, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get duplicates summary  ← MUST be before /:id
router.get('/duplicates/list', auth(), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, c.name as customer_name, c.customer_id, c.phone, c.email,
         sf.original_name as source_file_name
       FROM ownership o
       JOIN customers c ON o.customer_id = c.id
       LEFT JOIN source_files sf ON o.source_file_id = sf.id
       WHERE o.is_duplicate = true
       ORDER BY o.created_at DESC
       LIMIT 500`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Stats  ← MUST be before /:id
router.get('/stats/summary', auth(), async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const filesQuery = isAdmin
      ? "SELECT COUNT(*) FROM source_files WHERE status = 'completed'"
      : "SELECT COUNT(*) FROM source_files WHERE status = 'completed' AND uploaded_by = $1";

    const [customers, properties, duplicates, files] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM customers'),
      pool.query('SELECT COUNT(*) FROM ownership WHERE is_duplicate = false'),
      pool.query('SELECT COUNT(*) FROM ownership WHERE is_duplicate = true'),
      isAdmin ? pool.query(filesQuery) : pool.query(filesQuery, [req.user.id]),
    ]);

    res.json({
      totalCustomers: parseInt(customers.rows[0].count),
      totalProperties: parseInt(properties.rows[0].count),
      totalDuplicates: parseInt(duplicates.rows[0].count),
      processedFiles: parseInt(files.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get customer by ID with properties  ← MUST be after static routes
router.get('/:id', auth(), async (req, res) => {
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id);

    let customers;
    if (isUUID) {
      // FIX: Only compare against id (UUID column) — never mix UUID and string in same OR
      ({ rows: customers } = await pool.query(
        'SELECT * FROM customers WHERE id = $1',
        [req.params.id]
      ));
    } else {
      ({ rows: customers } = await pool.query(
        'SELECT * FROM customers WHERE customer_id = $1',
        [req.params.id]
      ));
    }

    if (!customers.length) return res.status(404).json({ error: 'Customer not found' });

    const customer = customers[0];

    const { rows: properties } = await pool.query(
      `SELECT o.*, sf.original_name as source_file_name 
       FROM ownership o
       LEFT JOIN source_files sf ON o.source_file_id = sf.id
       WHERE o.customer_id = $1::uuid
       ORDER BY o.created_at DESC`,
      [customer.id]
    );

    res.json({ ...customer, properties });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Clear all data (admin only) ← MUST be before /:id
router.delete('/all/clear', auth(['admin']), async (req, res) => {
  try {
    await pool.query('DELETE FROM ownership');
    await pool.query('DELETE FROM customers');
    await pool.query('DELETE FROM source_files');
    res.json({ message: 'All customers, properties, and source files have been cleared.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete single customer by ID (admin only) ← MUST be after static routes
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    await pool.query('DELETE FROM ownership WHERE customer_id = $1::uuid', [req.params.id]);
    const { rows } = await pool.query('DELETE FROM customers WHERE id = $1::uuid RETURNING *', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;