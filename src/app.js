const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const saleRoutes = require('./routes/sale.routes');

const { notFound, errorHandler } =
  require('./middleware/error.middleware');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// HTTP request logging
app.use(morgan('combined'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory API is running',
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;