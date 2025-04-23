import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useCreateOrderMutation } from '../../redux/orderAuthApi/orderAuthApi';
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { toast } from 'react-toastify';
import { emptyCartAfterOrder } from "../../redux/cartSlice/cartSlice";
import Flutterwave from '../Flutterwave/Flutterwave'; // Import the Flutterwave component







const schema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup.string().matches(/^\d+$/, 'Invalid phone number').required('Phone number is required'),
  street: yup.string().required('Street is required'),
  city: yup.string().required('City is required'),

  zipcode: yup.string().matches(/^\d{5}$/, 'Invalid zipcode').required('Zipcode is required'),
});


const CheckOut = () => {
  const darkMode = useSelector((state) => state.theme.darkMode);
  const [isChecked, setIsChecked] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState(null); // to hold form data


  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const dispatch = useDispatch();

  const cartItems = useSelector(state => state.cart.cartItems);
  const totalCartItems = cartItems.reduce((acc, item) => acc + item.cartQuantity, 0);
  const totalPrice = cartItems
    .reduce((acc, item) => acc + item.price * item.cartQuantity, 0)
    .toFixed(2);

    console.log('Total Cart Items:', totalCartItems);
    console.log('Cart Items:', cartItems);

    const {
      register,
      handleSubmit,
      reset,
      formState: { errors }
    } = useForm({
      resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
      setOrderData(data); // Save form data temporarily
      setShowPaymentModal(true); // Open Flutterwave payment
    };
    
    const handlePaymentSuccess = async (paymentData) => {
      console.log('Payment successful:', paymentData);
    
      setShowPaymentModal(false); // Close the payment modal

      if (!orderData) return;
    
      const newOrder = {
        name: orderData.name,
        email: orderData.email,
        street: orderData.street,
        city: orderData.city,
        zipcode: orderData.zipcode,
        phone: orderData.phone,
        state: orderData.state,
        productIds: cartItems.map(item => item._id),
        totalPrice: totalPrice,
      };
    
      try {
        const response = await createOrder(newOrder).unwrap();
        toast.success('Payment Successful! Order created successfully.');
        console.log('Order created:', response);
    
        dispatch(emptyCartAfterOrder());
        setOrderData(null);
        reset();
      } catch (error) {
        console.log("Error creating order:", error);
        toast.error(error.data?.message || "Error creating order after payment");
      }
    };
    

  

  if (isLoading)  return <Loader />;

  if (showError)  return <Error onClose={() => setShowError(false)}/>;
   


  return (
    <>
       <section>
        <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
          <div className="container max-w-screen-lg mx-auto">
            
            {/* Row for Price and Cart Items */}
            <div className="flex justify-center">
              <div className={`w-[500px] flex justify-between items-center mb-4 p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                <h2 className="font-semibold text-lg">Delivery Details</h2>
                <div className="flex space-x-6">
                  <p className="font-semibold">Total Price: <span className="text-amber-600">₦{totalPrice}</span></p>
                  <p className="font-semibold">Items: <span className="text-amber-600">{totalCartItems}</span></p>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="flex items-center justify-center">
              <form onSubmit={handleSubmit(onSubmit)} className={`w-full max-w-md p-8 shadow-md rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                
                {/* Form Fields */}
                <div className="grid gap-4 text-sm">
                  
                  <div>
                    <label>Full name</label>
                    <input
                      {...register('name')}
                      type="text"
                      className={`w-full p-3 mb-3 rounded-md focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                      placeholder="Name Surname"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label>Email Address</label>
                    <input
                      {...register('email')}
                      type="email"
                      className={`w-full p-3 mb-3 rounded-md focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                      placeholder="email@domain.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label>Phone Number</label>
                    <input
                      {...register('phone')}
                      type="text"
                      className={`w-full p-3 mb-3 rounded-md focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                      placeholder="+123 456 7890"
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label>Street Address</label>
                    <input
                      {...register('street')}
                      type="text"
                      className={`w-full p-3 mb-3 rounded-md focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    />
                    {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
                  </div>

                  <div>
                    <label>City</label>
                    <input
                      {...register('city')}
                      type="text"
                      className={`w-full p-3 mb-3 rounded-md focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label>Zipcode</label>
                    <input
                      {...register('zipcode')}
                      type="text"
                      className={`w-full p-3 mb-3 rounded-md focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600'}`}
                    />
                    {errors.zipcode && <p className="text-red-500 text-sm">{errors.zipcode.message}</p>}
                  </div>

                  <div className="mt-3">
                    <div className="inline-flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        onChange={() => setIsChecked(!isChecked)}
                        className="form-checkbox"
                      />
                      <label htmlFor="terms" className="ml-2">
                        I agree to the <Link className={`${darkMode ? 'text-white' : 'text-amber-700'}`}>Terms & Conditions</Link> and <Link className={`${darkMode ? 'text-white' : 'text-amber-700'}`}>Shopping Policy</Link>.
                      </label>
                    </div>
                  </div>
 
                  <div className="text-right">
                    <button
                      type="submit"
                      disabled={!isChecked}
                      className={`bg-amber-700 text-white py-2 px-4 rounded-md font-bold hover:bg-amber-600 ${!isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Make Payment
                    </button>
                  </div>

                </div>
              </form>
            </div>

              
            {showPaymentModal && orderData && (
              <Flutterwave 
                amount={totalPrice}
                email={orderData.email}
                phone_number={orderData.phone}
                name={orderData.name}
                onSuccess={handlePaymentSuccess}
              />
            )}
          </div>
        </div>
      </section>
    </>
  )
}

export default CheckOut;
