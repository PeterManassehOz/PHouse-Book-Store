const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// -------------------- CORS Configuration --------------------

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://p-house-book-store.vercel.app',
  'https://p-house-book-store-admin.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow requests with no origin (e.g., mobile apps, curl)
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Allow preflight requests
app.options('*', cors());

// -------------------- Body Parsing --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- Morgan Logging --------------------
app.use(morgan('dev'));
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// -------------------- Static Files --------------------
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- Routes --------------------
const Book = require('./src/models/books.model');
const FailedTransaction = require('./src/models/failedTransaction.model');

const authRoutes = require('./src/routes/auth.route');
const userRoutes = require('./src/routes/users.route');
const orderRoutes = require('./src/routes/orders.route');
const bookRoutes = require('./src/routes/books.route');
const adminRoutes = require('./src/routes/admin.route');
const newsletterRoutes = require("./src/routes/newsletter.route");
const flutterwaveRoutes = require('./src/routes/flutterwave.route');
const adminOrdersRoutes = require('./src/routes/adminOrders.route');

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
app.use('/books', bookRoutes);
app.use('/admin', adminRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/flutterwave', flutterwaveRoutes);
app.use('/adminorders', adminOrdersRoutes);

// -------------------- Home Route --------------------
app.get('/', (req, res) => {
  res.send('PHouse BookStore server is running!');
});

// -------------------- Cron Jobs --------------------
cron.schedule('0 0 1 1 *', async () => {
  console.log('Running yearly book update...');
  try {
    await Book.updateYearlyBooks();
    console.log('Yearly books updated successfully!');
  } catch (error) {
    console.error('Error updating yearly books:', error);
  }
});

cron.schedule('*/5 * * * *', async () => {
  console.log('Retrying failed webhook transactions...');
  try {
    const failedTransactions = await FailedTransaction.find({ status: 'failed' });
    console.log(`Found ${failedTransactions.length} failed transactions`);

    for (let transaction of failedTransactions) {
      try {
        const response = await flw.Transaction.verify({ id: transaction.transaction_id });

        if (response.status === 'successful') {
          await FailedTransaction.findByIdAndUpdate(transaction._id, { status: 'successful' });
          console.log(`Transaction ${transaction.transaction_id} retried successfully.`);
        } else {
          console.log(`Transaction ${transaction.transaction_id} verification failed.`);
        }
      } catch (error) {
        console.error(`Retry failed for transaction ${transaction.transaction_id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error during retry cron job:', error);
  }
});

// -------------------- Error Handling --------------------
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(err.status || 500).json({ error: err.message });
});

// -------------------- DB + Server Init --------------------
async function main() {
  await mongoose.connect(process.env.DB_URL);
  console.log('Connected to DB');
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.stack || err);
});

main()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch(err => console.log(err));
