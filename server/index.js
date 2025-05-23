const cron = require('node-cron');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const port = process.env.PORT;
const path = require("path");
const Book = require('./src/models/books.model');
const FailedTransaction = require('./src/models/failedTransaction.model');
const fs = require('fs');






// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For form data (text fields)
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Corrected the protocol
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));


const morgan = require('morgan');
app.use(morgan('dev'));


const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

  
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));




  
const authRoutes = require('./src/routes/auth.route');
const userRoutes = require('./src/routes/users.route');
const orderRoutes = require('./src/routes/orders.route');
const bookRoutes = require('./src/routes/books.route');
const adminRoutes = require('./src/routes/admin.route');
const newsletterRoutes = require("./src/routes/newsletter.route");
const flutterwaveRoutes = require('./src/routes/flutterwave.route');
const adminOrdersRoutes = require('./src/routes/adminOrders.route');





app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/orders', orderRoutes);
app.use('/books', bookRoutes);
app.use('/admin', adminRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/flutterwave', flutterwaveRoutes);
app.use('/adminorders', adminOrdersRoutes);





async function main() {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to DB');
    
      // Schedule the cron job to run on January 1st at midnight
      cron.schedule('0 0 1 1 *', async () => {
        console.log('Running yearly book update...');
        try {
            await Book.updateYearlyBooks();
            console.log('Yearly books updated successfully!');
        } catch (error) {
            console.error('Error updating yearly books:', error);
        }
    });

      // Cron job to retry failed transactions
      cron.schedule('*/5 * * * *', async () => {
        console.log('Retrying failed webhook transactions...');
        try {
          // Fetch failed transactions from DB
          const failedTransactions = await FailedTransaction.find({ status: 'failed' });
          console.log(`Found ${failedTransactions.length} failed transactions`);
      
          for (let transaction of failedTransactions) {
            try {
              console.log(`Retrying transaction with ID: ${transaction.transaction_id}`);
      
              // Retry the verification of the failed transaction
              const response = await flw.Transaction.verify({ id: transaction.transaction_id });
              console.log(`Verification response: ${JSON.stringify(response)}`);
      
              if (response.status === 'successful') {
                console.log(`Successfully retried transaction: ${transaction.transaction_id}`);
                // Update transaction status to successful
                await FailedTransaction.findByIdAndUpdate(transaction._id, { status: 'successful' });
              } else {
                console.log(`Transaction verification failed: ${transaction.transaction_id} with status: ${response.status}`);
              }
            } catch (error) {
              console.error(`Error retrying transaction: ${transaction.transaction_id}`, error);
            }
          }
        } catch (error) {
          console.error('Error during cron job:', error);
        }
      });
      

    app.get('/', (req, res) => {
        res.send('PHouse BookStore server is running!');
    });
}


process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.stack || err);
});



main().then(() => console.log('Connected to DB')).catch(err => console.log(err));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});