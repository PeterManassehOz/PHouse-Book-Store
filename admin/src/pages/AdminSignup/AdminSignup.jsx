import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useSignupAdminMutation } from '../../redux/adminAuthApi/adminAuthApi';
import { useSelector } from 'react-redux';




const AdminSignup = () => {
 const schema = yup.object().shape({
     name: yup.string().required('Name is required'),
     email: yup.string().email('Invalid email').required('Email is required'),
     state: yup.string().required('State is required'),
     phcode: yup.string().required('PH code is required'),
     password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
   });
 
   const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
 
   
   const darkMode = useSelector((state) => state.theme.darkMode);


   const [registerAdmin, { isLoading }] = useSignupAdminMutation();
   const navigate = useNavigate();
 
 
   const onSubmit = async (data) => {
     try {
       const response = await registerAdmin(data).unwrap();
       localStorage.setItem('token', response.token);
       localStorage.setItem('email', data.email); // Store email in localStorage

       toast.success('Registration successful');
       navigate('/admin-dashboard'); 
     } catch (error) {
       console.error(error);
       toast.error(error?.data?.message || "Registration failed");
     }
   };
 
   return (
     <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
            <form 
              className={`w-full max-w-md p-8 shadow-lg rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
              onSubmit={handleSubmit(onSubmit)}
            >
              <h2 className={`text-2xl font-semibold text-center mb-6 ${darkMode ? "text-white" : "text-black" }`}>Admin Sign Up</h2>
      
              <input 
                className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
                type="text" 
                placeholder="Name" 
                {...register("name")} 
              />
              {errors.firstname && <p className="text-red-500 text-sm">{errors.name.message}</p>}
     
      
              <input 
                className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
                type="email" 
                placeholder="Email" 
                {...register("email")} 
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
     
      
              <input 
                className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
                type="text" 
                placeholder="PH code" 
                {...register("phcode")} 
              />
              {errors.phcode && <p className="text-red-500 text-sm">{errors.phcode.message}</p>}
      
              <input 
                className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
                type="text" 
                placeholder="State" 
                {...register("state")} 
              />
              {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
      
              <input 
                className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
                type="password" 
                placeholder="Password" 
                {...register("password")} 
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      
            
      
              <button 
                className="w-full bg-amber-700 text-white py-2 rounded-md hover:bg-amber-600 transition duration-200 cursor-pointer" 
                type="submit"
              >
                {isLoading ? 'Loading...' : 'Sign Up'}
              </button>
      
              <div className={`text-center mt-4 ${darkMode ? "text-white" : "text-gray-600" }`}>
                Have an account? <Link to="/admin-login" className={`${darkMode ? "text-amber-500" : "text-amber-700" }`}>Log in</Link>
              </div>

              <div className={`text-center mt-4 ${darkMode ? "text-white" : "text-gray-600" }`}>
                Wish to create a Chief Admin? <Link to="/"  className={`${darkMode ? "text-amber-500" : "text-amber-700" }`}>Click Here</Link>
            </div>
            </form>
          </div>
   );
}

export default AdminSignup