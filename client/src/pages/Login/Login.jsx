import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { useLoginUserMutation } from '../../redux/userAuthApi/userAuthApi'

const Login = () => {
  const schema = yup.object().shape({
    phcode: yup.string().required("PH code is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    term: yup.boolean().oneOf([true], "You must agree to the terms"),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  
  const darkMode = useSelector((state) => state.theme.darkMode);
  
  const [loginUser, { isLoading }] = useLoginUserMutation();

  
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await loginUser(data).unwrap();
  
      // Store token only if available
      if (response.token) {
        localStorage.setItem('token', response.token);
        console.log('token', response.token);
      }
  
      localStorage.setItem('phcode', data.phcode);
  
      // Store email from the correct place (either from user or direct email)
      const userEmail = response.user?.email || response.email;
      if (userEmail) {
        localStorage.setItem('email', userEmail);
      }
  
      if (response.requireOtpVerification || response.needsVerification) {
        toast.info("Please verify OTP");
        navigate('/verify-otp'); 
      } else if (!response.user?.profileCompleted) {
        navigate('/user-dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Login failed");
    }
  };
  

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className={`w-full max-w-md p-8 shadow-md rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
      >
        <h2 className={`text-2xl font-semibold text-center mb-6 ${darkMode ? "text-white" : "text-black" }`}>Log in</h2>
        
        <input 
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`} 
          type="text" 
          placeholder="PH code" 
          {...register("phcode")}
        />
        {errors.phcode && <p className="text-red-500 text-sm">{errors.phcode.message}</p>}

        <input 
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}  
          type="password" 
          placeholder="Password" 
          {...register("password")} 
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <div className="flex items-center mb-4">
          <input className="mr-2 active:accent-amber-800 accent-amber-200 cursor-pointer" type="checkbox" {...register("term")} />
          <span className={`text-sm ${darkMode ? "text-white" : "text-gray-600" }`}>Agree to terms and conditions</span>
        </div>
        {errors.term && <p className="text-red-500 text-sm">{errors.term.message}</p>}

        <button className="w-full bg-amber-700 text-white py-2 rounded-md hover:bg-amber-600 transition duration-200 cursor-pointer" type="submit">
            {isLoading ? "Logging in..." : "Log in"} 
        </button>

        <div className={`text-center mt-4 ${darkMode ? "text-white" : "text-gray-600" }`}>
          <p>Don&apos;t have an account? <Link to="/signup" className={`${darkMode ? "text-amber-500" : "text-amber-700" }`}>Sign up</Link></p>
          <p>Forgot password? <Link to="/forgot-password" className={`${darkMode ? "text-amber-500" : "text-amber-700" }`}>Reset</Link></p>
        </div>
      </form>
    </div>
  )
}

export default Login;
