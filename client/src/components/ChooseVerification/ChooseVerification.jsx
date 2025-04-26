// src/components/Verify/ChooseVerification.jsx
import React from 'react'
import { useResendEmailOtpMutation, useResendPhoneOtpMutation } from '../../redux/userAuthApi/userAuthApi'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const ChooseVerification = () => {
  const [resendEmailOtp, { isLoading: emailLoading }] = useResendEmailOtpMutation()
  const [resendPhoneOtp, { isLoading: phoneLoading }] = useResendPhoneOtpMutation()
  const navigate = useNavigate()
  const darkMode = useSelector(state => state.theme.darkMode)

  const handleEmail = async () => {
    const email = localStorage.getItem('email')
    if (!email) return toast.error('No email found in storage')
    try {
      await resendEmailOtp({ email }).unwrap()
      toast.success('OTP sent to your email')
      navigate('/verify-email-otp')
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Failed to send email OTP')
    }
  }

  // Uncomment for production mode
 /* const handlePhone = async () => {
    const phonenumber = localStorage.getItem('phonenumber')
    if (!phonenumber) return toast.error('No phone number found in storage')
    try {
      await resendPhoneOtp({ phonenumber }).unwrap()
      toast.success('OTP sent to your phone')
      navigate('/verify-phone-otp')
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Failed to send SMS OTP')
    }
  }
  */

  // Dev only
  const handlePhone = async () => {
    const phonenumber = localStorage.getItem('phonenumber');
    if (!phonenumber) return toast.error('No phone number found in storage');
    try {
      const response = await resendPhoneOtp({ phonenumber }).unwrap();
  
      // 👇 Add this to show OTP (if your backend returns it)
      if (response.phoneOtp) {
        toast.info(`Test OTP: ${response.phoneOtp}`);
      }
  
      toast.success('OTP sent to your phone');
      navigate('/verify-phone-otp');
    } catch (err) {
      toast.error(err?.data?.message || err.message || 'Failed to send SMS OTP');
    }
  };

  
  return (

    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
         <div
        className={`w-full max-w-md p-8 shadow-md rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
         >
        <h2 className={`text-2xl font-semibold text-center mb-6 ${darkMode ? "text-white" : "text-black" }`}>
          Choose Verification Method
        </h2>

        <button
          onClick={handleEmail}
          disabled={emailLoading}
          className="w-full py-3 mb-4 text-white bg-amber-700 rounded-md hover:bg-amber-600 hover:text-white transition cursor-pointer"
        >
          {emailLoading ? 'Sending to Email…' : 'Verify via Email'}
        </button>

        <button
          onClick={handlePhone}
          disabled={phoneLoading}
          className="w-full py-3  text-white bg-amber-700 rounded-md hover:bg-amber-600 hover:text-white transition cursor-pointer"
        >
          {phoneLoading ? 'Sending SMS…' : 'Verify via SMS'}
        </button>
      </div>
    </div>
     
  )
}

export default ChooseVerification
