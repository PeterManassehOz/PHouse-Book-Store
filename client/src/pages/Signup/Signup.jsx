import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRegisterUserMutation } from '../../redux/userAuthApi/userAuthApi';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const Signup = () => {
  const schema = yup.object().shape({
    firstname: yup.string().required('First name is required'),
    lastname: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    stateCode: yup.string().required('State code is required'),
    gender: yup.string().required('Gender is required'),
    phonenumber: yup.string().required('Phone number is required')
    .matches(/^\+?\d{7,15}$/, 'Enter a valid phone number'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
    terms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  
  const darkMode = useSelector((state) => state.theme.darkMode);
  
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const navigate = useNavigate();


  const onSubmit = async (data) => {
    data.phonenumber = "+15005550006"; // for testing purposes, remove this line in production

    // 1) Format the phone into E.164
    let phone = data.phonenumber.trim();
    if (!phone.startsWith('+')) {
      // assume local Nigerian number starting with '0'
      if (phone.startsWith('0')) {
        phone = '+234' + phone.slice(1);
      } else {
        // fallback: just prefix '+'
        phone = '+' + phone;
      }
    }

    // 2) Build the payload with formatted phone
    const payload = {
      ...data,
      phonenumber: phone,
    };

    try {
      const response = await registerUser(payload).unwrap();
      localStorage.setItem('token', response.token);
      localStorage.setItem('phcode', data.phcode);
      localStorage.setItem('email', data.email);
      localStorage.setItem('phonenumber', data.phonenumber);
      console.log(data);
      
      toast.success('Signup successful! Now choose how to verify.');

      setTimeout(() => {
      toast.info(`Your PHCode is: ${response.phcode}`, {
        position: "top-right",
        autoClose: 5000,
        theme: darkMode ? "dark" : "light",
      });
      }, 30000);

      navigate('/choose-verification');
    } catch (error) {
      console.error(error);
      toast.error(error?.data?.message || "Registration failed");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <form 
         className={`w-full max-w-md p-8 shadow-md rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2  className={`text-2xl font-semibold text-center mb-6 ${darkMode ? "text-white" : "text-black" }`}>Sign Up</h2>

        <input 
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
          type="text" 
          placeholder="First Name" 
          {...register("firstname")} 
        />
        {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname.message}</p>}

        <input 
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
          type="text" 
          placeholder="Last Name" 
          {...register("lastname")} 
        />
        {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname.message}</p>}

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
          type="number" 
          placeholder="+234 1234567890 or 0123456789" 
          {...register("phonenumber")} 
        />
        {errors.phonenumber && <p className="text-red-500 text-sm">{errors.phonenumber.message}</p>}


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



        <div className="flex items-center mb-4">
          <input className="mr-2 active:accent-amber-800 accent-amber-200 cursor-pointer" type="checkbox" {...register("terms")} />
          <span className={`text-sm ${darkMode ? "text-white" : "text-gray-600" }`}>Agree to terms and conditions</span>
        </div>
        {errors.terms && <p className="text-red-500 text-sm">{errors.terms.message}</p>}

        <button 
          className="w-full bg-amber-700 text-white py-2 rounded-md hover:bg-amber-600 transition duration-200 cursor-pointer" 
          type="submit"
        >
          {isLoading ? 'Loading...' : 'Sign Up'} 
        </button>

        <div className={`text-center mt-4 ${darkMode ? "text-white" : "text-gray-600" }`}>
          Have an account? <Link to="/login" className={`${darkMode ? "text-amber-500" : "text-amber-700" }`}>Log in</Link>
        </div>
      </form>
    </div>
  );
};

export default Signup;
