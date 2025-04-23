import React, { useEffect } from 'react';
import { closePaymentModal, useFlutterwave } from 'flutterwave-react-v3';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useSaveTransactionMutation } from '../../redux/flutterwaveAuthApi/flutterwaveAuthApi';





const Flutterwave = ({ amount, onSuccess, email, phone_number, name }) => {
  const [saveTransaction, { isLoading: isSaving, error: saveError}] = useSaveTransactionMutation();
  const navigate = useNavigate();

  const config = {
    public_key: 'FLWPUBK_TEST-9ddd190e1023b44f84603222bdf9c1be-X',
    tx_ref: `${Date.now()}-${uuidv4()}`, // fixed the template string
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email,
      phone_number,
      name,
    },
    customizations: {
      title: 'LivingSeed BookStore',
      description: 'Payment for items in cart',
      logo: '/LSeed-Logo-1.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  useEffect(() => {
    handleFlutterPayment({
      callback: async (response) => {
        console.log('⚠️ Full Flutterwave response:', response);
        
        // Check for successful payment
        const isPaymentSuccessful =
          response?.status === 'successful' ||
          response?.status === 'completed' ||
          response?.charge_response_code === '00';
      
        if (isPaymentSuccessful) {
          try {
            // Close modal only after toast + brief timeout
            toast.success('Payment successful! 🎉');
      
            const transactionData = {
              transactionId: response.transaction_id,
              tx_ref: response.tx_ref,
              amount: response.amount,
              currency: response.currency,
              paymentType: response.payment_type ?? 'unknown',
              customer: {
                email: response.customer.email,
                phone_number: response.customer.phone_number,
                name: response.customer.name,
              },
              paymentDate: response.created_at,
              status: response.status || 'successful',
            };
      
            console.log('🚀 Transaction being sent:', transactionData);
      
            await saveTransaction(transactionData).unwrap();

            console.log('✅ Transaction saved successfully!');
      
            onSuccess(response); // Notify parent first
      
            // Delay to let user see Flutterwave confirmation + toast
            setTimeout(() => {
              closePaymentModal(); // Ensure modal is closed
              navigate(`/status/${response.transaction_id}`); // Redirect
            }, 2000); // 2-second delay
          } catch (err) {
            console.error('Error saving transaction:', err);
            toast.error('Payment was successful, but failed to save transaction.');
          }
        } else {
          console.log('❌ Payment was not successful');
          toast.error('Payment was not successful');
          closePaymentModal();
        }
      },      
      onClose: () => {},
    });
  }, [handleFlutterPayment, onSuccess, navigate, saveTransaction]);

  return (
    <div>
       {isSaving && <p>Saving your transaction...</p>}
       {saveError && <p className="error">Error: {saveError.message}</p>}
    </div>
  );
};

export default Flutterwave;
