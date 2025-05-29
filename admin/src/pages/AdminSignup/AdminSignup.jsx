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
     stateCode: yup.string().required('State is required'),
     gender: yup.string().required('Gender is required'),
     password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
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
     
              
            {/* State Code Select */}
            <select
              className={`w-full p-3 mb-3 rounded-md border-none 
                focus:ring-2 focus:ring-blue-200 focus:outline-none 
                ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
              {...register("stateCode")}
            >
              <option value="">Select State</option>
              <option value="ABI">Abia</option>
              <option value="ADA">Adamawa</option>
              <option value="AKW">Akwa Ibom</option>
              <option value="ANA">Anambra</option>
              <option value="BAU">Bauchi</option>
              <option value="BAY">Bayelsa</option>
              <option value="BEN">Benue</option>
              <option value="BOR">Borno</option>
              <option value="CRR">Cross River</option>
              <option value="DEL">Delta</option>
              <option value="EBO">Ebonyi</option>
              <option value="EDO">Edo</option>
              <option value="EKI">Ekiti</option>
              <option value="ENU">Enugu</option>
              <option value="GOM">Gombe</option>
              <option value="IMO">Imo</option>
              <option value="JIG">Jigawa</option>
              <option value="KAD">Kaduna</option>
              <option value="KAN">Kano</option>
              <option value="KAT">Katsina</option>
              <option value="KEB">Kebbi</option>
              <option value="KOG">Kogi</option>
              <option value="KWA">Kwara</option>
              <option value="LAG">Lagos</option>
              <option value="NAS">Nasarawa</option>
              <option value="NIG">Niger</option>
              <option value="OGU">Ogun</option>
              <option value="OND">Ondo</option>
              <option value="OSU">Osun</option>
              <option value="OYO">Oyo</option>
              <option value="PLA">Plateau</option>
              <option value="RIV">Rivers</option>
              <option value="SOK">Sokoto</option>
              <option value="TAR">Taraba</option>
              <option value="YOB">Yobe</option>
              <option value="ZAM">Zamfara</option>
            </select>
            {errors.stateCode && <p className="text-red-500 text-sm">{errors.stateCode.message}</p>}


            <select
              className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
              {...register("gender")}
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}
              
      
              <input 
                className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
                type="password" 
                placeholder="Password" 
                {...register("password")} 
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      
            
              <input 
                className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
                type="password" 
                placeholder="Confirm Password" 
                {...register("confirmPassword")} 
              />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
      
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