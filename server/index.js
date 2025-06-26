// index.js
const cron = require('node-cron');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Models for cron jobs
const Book = require('./src/models/books.model');
const FailedTransaction = require('./src/models/failedTransaction.model');

// ——————————————————————————————————————————————
// 1) BODY PARSERS
// ——————————————————————————————————————————————
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ——————————————————————————————————————————————
// 2) CORS
// ——————————————————————————————————————————————
// Define exactly which origins you want to allow:
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://p-house-book-store.vercel.app',
  'https://p-house-book-store-admin.vercel.app'
];

// “app.use(cors())” runs on all requests (GET/POST/PUT/DELETE/OPTIONS…),
// but we explicitly include OPTIONS in our allowed methods.
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// This ensures that *every* OPTIONS (preflight) request
// also gets the CORS headers before hitting any route.
app.options('*', cors({
  origin: allowedOrigins,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ——————————————————————————————————————————————
// 3) LOGGING
// ——————————————————————————————————————————————
const morgan = require('morgan');
app.use(morgan('dev'));
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));

// ——————————————————————————————————————————————
// 4) STATIC FILES
// ——————————————————————————————————————————————
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ——————————————————————————————————————————————
// 5) ROUTES
// ——————————————————————————————————————————————
const authRoutes         = require('./src/routes/auth.route');
const userRoutes         = require('./src/routes/users.route');
const orderRoutes        = require('./src/routes/orders.route');
const bookRoutes         = require('./src/routes/books.route');
const adminRoutes        = require('./src/routes/admin.route');
const newsletterRoutes   = require('./src/routes/newsletter.route');
const flutterwaveRoutes  = require('./src/routes/flutterwave.route');
const adminOrdersRoutes  = require('./src/routes/adminOrders.route');

app.use('/auth',         authRoutes);
app.use('/users',        userRoutes);
app.use('/orders',       orderRoutes);
app.use('/books',        bookRoutes);
app.use('/admin',        adminRoutes);
app.use('/newsletter',   newsletterRoutes);
app.use('/flutterwave',  flutterwaveRoutes);
app.use('/adminorders',  adminOrdersRoutes);

// Log any request that didn’t match one of your defined routes
app.use((req, res, next) => {
  console.log(`❓ Unmatched route: ${req.method} ${req.originalUrl}`);
  next();
});

app.use((req, res, next) => {
  console.log(`⚠️  Incoming request path: ${req.method} ${req.originalUrl}`);
  next();
});

// after all your app.use('/XXX', ...) calls
function listEndpoints(app) {
  console.log('🔍 Registered routes:');
  app._router.stack.forEach(mw => {
    if (mw.route) {
      // routes registered directly on the app
      const path = mw.route?.path;
      const methods = Object.keys(mw.route.methods).join(', ').toUpperCase();
      console.log(`  ${methods} ${path}`);
    } else if (mw.name === 'router') {
      // router middleware 
      mw.handle.stack.forEach(handler => {
        const path = handler.route?.path;
        const methods = handler.route
          ? Object.keys(handler.route.methods).join(', ').toUpperCase()
          : '';
        console.log(`  ${methods} ${mw.regexp} -> ${path}`);
      });
    }
  });
}
listEndpoints(app);


// A simple root health check
app.get('/', (req, res) => {
  res.send('PHouse BookStore server is running!');
});

// ——————————————————————————————————————————————
// 6) DB & CRON SETUP
// ——————————————————————————————————————————————
async function main() {
  await mongoose.connect(process.env.DB_URL);
  console.log('Connected to DB');

  // Yearly book update: Jan 1 at 00:00
  cron.schedule('0 0 1 1 *', async () => {
    console.log('Running yearly book update...');
    try {
      await Book.updateYearlyBooks();
      console.log('Yearly books updated successfully!');
    } catch (err) {
      console.error('Error updating yearly books:', err);
    }
  });

  // Retry failed transactions every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('Retrying failed webhook transactions...');
    try {
      const failed = await FailedTransaction.find({ status: 'failed' });
      console.log(`Found ${failed.length} failed transactions`);
      for (let tx of failed) {
        try {
          const resp = await flw.Transaction.verify({ id: tx.transaction_id });
          console.log(`Verification response: ${JSON.stringify(resp)}`);
          if (resp.status === 'successful') {
            await FailedTransaction.findByIdAndUpdate(tx._id, { status: 'successful' });
            console.log(`Transaction ${tx.transaction_id} marked successful`);
          }
        } catch (err) {
          console.error(`Error retrying ${tx.transaction_id}:`, err);
        }
      }
    } catch (err) {
      console.error('Error during cron retry:', err);
    }
  });
}

// Catch-all unhandled errors
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.stack || err);
});

// Start everything
main()
  .then(() => console.log('Setup complete'))
  .catch(err => console.error('Setup error:', err));

const port = process.env.PORT || 5000;




app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
