import React from 'react';
import { useGetAllTransactionsForStateAdminQuery } from '../../redux/flutterwaveAdminAuthApi/flutterwaveAdminAuthApi';
import { useSelector } from 'react-redux';

const Flutterwave = () => {
  const darkMode = useSelector((state) => state.theme.darkMode);

  const {
    data: transactions,
    error,
    isLoading: transactionsLoading,
  } = useGetAllTransactionsForStateAdminQuery(
  );

  if (transactionsLoading) {
    return (
      <div className={`text-center py-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Loading transactions...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-6 text-red-500 ${darkMode ? 'text-red-400' : ''}`}>
        Error loading transactions: {error.message}
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className="text-2xl font-bold mb-6 border-b pb-2 border-gray-300 dark:border-gray-700">
        Your Transactions
      </h2>

      {transactions?.length === 0 ? (
        <p className="text-center text-sm italic text-gray-500 dark:text-gray-400">No transactions found.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transactions.map((txn) => (
            <li
              key={txn.transactionId}
              className={`rounded-xl p-5 shadow transition duration-200 ${
                darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm"><span className="font-medium">Ref:</span> {txn.transactionRef}</p>
              <p className="text-sm"><span className="font-medium">Amount:</span> ₦{txn.amount}</p>
              <p
                className={`text-sm font-medium ${
                  txn.status === 'successful'
                    ? 'text-green-500'
                    : txn.status === 'pending'
                    ? 'text-yellow-500'
                    : 'text-red-500'
                }`}
              >
                Status: {txn.status}
              </p>
              <p className="text-sm"><span className="font-medium">Date:</span> {new Date(txn.paymentDate).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Flutterwave;
