import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVerifyTransactionQuery } from '../../redux/flutterwaveAuthApi/flutterwaveAuthApi';
import { toast } from 'react-toastify';
import Loader from '../Loader/Loader';
import { useSelector } from 'react-redux';

const Status = () => {
  const { tx_id } = useParams();
  const navigate = useNavigate();
  const { data, error, isLoading } = useVerifyTransactionQuery(tx_id);
  const darkMode = useSelector((state) => state.theme.darkMode);

  useEffect(() => {
    if (error) {
      toast.error('Error verifying transaction!');
    }
  }, [error]);

  if (isLoading) return <Loader />;

  const getStatusStyles = () => {
    if (data.status === 'successful') return darkMode ? 'text-green-400 bg-green-900' : 'text-green-500 bg-green-100';
    if (data.status === 'pending') return darkMode ? 'text-yellow-300 bg-yellow-900' : 'text-yellow-600 bg-yellow-100';
    return darkMode ? 'text-red-400 bg-red-900' : 'text-red-500 bg-red-100';
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-tr from-purple-200 via-pink-100 to-yellow-100 text-gray-800'} p-4 relative`}>
      <div className={`max-w-2xl w-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-2xl shadow-xl p-8 animate-fade-in relative`}>
        
        {/* Cancel Icon */}
        <button
          onClick={() => navigate('/')}
          className={`absolute top-4 right-4 ${darkMode ? 'text-gray-300 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition cursor-pointer`}
          title="Go back home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className={`text-4xl font-bold mb-4 text-center ${darkMode ? 'text-indigo-300' : 'text-indigo-700'}`}>
          Transaction Status
        </h2>

        {data?.status === 'error' ? (
          <div className={`text-center ${darkMode ? 'text-red-400' : 'text-red-600'} text-lg font-semibold`}>
            {data.message}
          </div>
        ) : data ? (
          <>
            <div
              className={`text-center text-2xl font-semibold py-3 rounded-lg mb-6 ${getStatusStyles()}`}
            >
              {data.status === 'successful'
                ? '✅ Payment Successful!'
                : data.status === 'pending'
                ? '⏳ Payment Pending...'
                : '❌ Payment Failed'}
            </div>

            <div className={`space-y-4 text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Detail label="Transaction ID" value={data.id} darkMode={darkMode} />
              <Detail label="Transaction Reference" value={data.tx_ref} darkMode={darkMode} />
              <Detail label="Amount" value={`${data.currency} ${data.amount}`} darkMode={darkMode} />
              <Detail label="Email" value={data.customer?.email} darkMode={darkMode} />
              <Detail label="Phone Number" value={data.customer?.phone_number} darkMode={darkMode} />
              <Detail label="Payment Type" value={data.payment_type} darkMode={darkMode} />
              <Detail label="Payment Date" value={new Date(data.created_at).toLocaleString()} darkMode={darkMode} />
            </div>
          </>
        ) : (
          <div className={`text-center mt-10 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No data found for this transaction.
          </div>
        )}
      </div>
    </div>
  );
};

const Detail = ({ label, value, darkMode }) => (
  <p>
    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{label}:</span> {value}
  </p>
);

export default Status;
