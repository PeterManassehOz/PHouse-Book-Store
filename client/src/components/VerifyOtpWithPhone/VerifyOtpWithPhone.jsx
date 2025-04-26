import { useForm } from 'react-hook-form';
import { useVerifyPhoneOtpMutation, useResendPhoneOtpMutation } from '../../redux/userAuthApi/userAuthApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useEffect, useState } from 'react';

const VerifyOtpWithPhone = () => {
  const schema = yup.object().shape({
    phoneOtp: yup.string().required("OTP is required"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const [verifyPhoneOtp, { isLoading }] = useVerifyPhoneOtpMutation();
  const [resendPhoneOtp, { isLoading: resendLoading }] = useResendPhoneOtpMutation();
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const darkMode = useSelector((state) => state.theme.darkMode);
  const phonenumber = localStorage.getItem('phonenumber');

  useEffect(() => {
    let interval;
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const onSubmit = async (data) => {
    const phcode = localStorage.getItem('phcode'); // ✅ Required
     if (!phcode) {
      toast.error('PH code not found');
      return;
    }
    const email = localStorage.getItem('email');
    const phonenumber = localStorage.getItem('phonenumber');
    try {
      const response = await verifyPhoneOtp({
        phonenumber,
        email,
        phoneOtp: data.phoneOtp,
        phcode, // optional if you want to store it
      }).unwrap();
  
      // ✅ Store token if it exists
      if (response.token) {
        localStorage.setItem('token', response.token);
        console.log('Token:', response.token);
      }
  
      // ✅ Optionally store phcode if you want to reuse it later
      if (phcode) {
        localStorage.setItem('phcode', phcode);
      }
  
      // ✅ Store email
      const userEmail = response.user?.email || email;
      if (userEmail) {
        localStorage.setItem('email', userEmail);
      }
  
      toast.success('OTP verified successfully');
  
      if (!response.user.profileCompleted) {
        navigate('/user-dashboard');
      } else {
        navigate('/');
      }
  
    } catch (error) {
      toast.error(error?.data?.message || 'OTP verification failed');
    }
  };
  

  const handleResendOtp = async () => {
    try {
      await resendPhoneOtp({ phonenumber }).unwrap();
      toast.success("OTP resent successfully");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`w-full max-w-md p-8 shadow-md rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
      >
        <h2 className={`text-2xl font-semibold text-center mb-6 ${darkMode ? "text-white" : "text-black" }`}>Verify Phone OTP</h2>

        <input
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
          type="text"
          placeholder="Enter OTP"
          {...register("phoneOtp")}
        />
        {errors.otp && <p className="text-red-500 text-sm">{errors.otp.message}</p>}

        <button
          type="submit"
          className="w-full bg-amber-700 text-white py-2 rounded-md hover:bg-amber-600 transition duration-200"
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || resendLoading}
            className={`mt-2 text-sm ${canResend ? 'text-amber-700 hover:underline' : 'text-gray-500 cursor-not-allowed'}`}
          >
            {resendLoading ? 'Resending...' : 'Resend OTP'}
          </button>
          {!canResend && <p className="text-sm mt-1 text-gray-500">Wait {timer}s to resend</p>}
        </div>
      </form>
    </div>
  );
};

export default VerifyOtpWithPhone;
