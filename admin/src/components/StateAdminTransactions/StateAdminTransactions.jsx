// src/components/StateAdminTransactions/StateAdminTransactions.jsx
import React, { useState, useEffect } from 'react';
import {
  useGetAllStatesTransactionsForChiefAdminQuery,
  useGetTransactionsByStateForChiefAdminQuery,
} from '../../redux/flutterwaveAdminAuthApi/flutterwaveAdminAuthApi';
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { useSelector } from 'react-redux';
import { IoIosArrowBack } from 'react-icons/io';

const StateAdminTransactions = ({ onSubPage }) => {
  const darkMode = useSelector((s) => s.theme.darkMode);
  const [selectedState, setSelectedState] = useState(null);

  // 🔹 Hide the dashboard back button on mount
  useEffect(() => {
    onSubPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch grouped counts
  const {
    data: byState,
    isLoading: loadingStates,
    isError: errorStates,
  } = useGetAllStatesTransactionsForChiefAdminQuery();

  // Fetch a single state’s txns
  const {
    data: txns,
    isLoading: loadingTxns,
    isError: errorTxns,
  } = useGetTransactionsByStateForChiefAdminQuery(selectedState, {
    skip: !selectedState,
  });

  if (loadingStates) return <Loader />;
  if (errorStates) return <p className="text-red-500 text-center">Unauthorized! Chief Admin only.</p>;
  if (loadingTxns) return <Loader />;
  if (errorTxns) return <p className="text-red-500 text-center">Unauthorized! Chief Admin only.</p>;

  const handleStateClick = (st) => {
    setSelectedState(st);
    onSubPage(true);
  };
  const handleBack = () => {
    setSelectedState(null);
    onSubPage(false);
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {!selectedState ? (
        <>
          <h2 className="text-2xl font-bold mb-4">All State Transactions</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(byState).map(([st, arr]) => (
              <li key={st}>
                <button
                  onClick={() => handleStateClick(st)}
                  className="w-full py-4 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-500 transition cursor-pointer"
                >
                  {st} ({arr.length})
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <button
            onClick={handleBack}
            className={`mb-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer
              ${darkMode ? "bg-amber-600 text-white hover:bg-amber-400" : "bg-amber-700 text-white hover:bg-amber-500"} 
              rounded-full shadow-transition duration-200 z-10`}
          >
            <IoIosArrowBack className="mr-2" />
          </button>

          <h2 className="text-2xl font-bold mb-4 text-center">Transactions in {selectedState}</h2>

          {loadingTxns ? (
            <Loader />
          ) : errorTxns ? (
            <Error />
          ) : txns.length === 0 ? (
            <p className="italic">No transactions found for {selectedState}.</p>
          ) : (
            <ul className="flex flex-wrap gap-4">
              {txns.map((tx) => (
                <li
                  key={tx._id}
                  className={`w-full sm:w-[48%] md:w-[31%] rounded-xl p-5 shadow transition duration-200 ${
                    darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                  }`}
                >
                  <p><span className="font-medium">Ref:</span> {tx.transactionRef}</p>
                  <p><span className="font-medium">User:</span> {tx.customer.name}</p>
                  <p><span className="font-medium">Amount:</span> ₦{tx.amount}</p>
                  <p><span className="font-medium">Status:</span> {tx.status}</p>
                  <p><span className="font-medium">Date:</span> {new Date(tx.paymentDate).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default StateAdminTransactions;
