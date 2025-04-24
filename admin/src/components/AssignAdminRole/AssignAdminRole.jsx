import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useAssignAdminRoleMutation } from '../../redux/adminAuthApi/adminAuthApi';
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { useState } from 'react';
import { useSelector } from 'react-redux';





// Validation Schema
const schema = yup.object().shape({
  state: yup.string().required('State is required'),
  phcode: yup.string().required('Phone code is required'),
});





const AssignAdminRole = () => {
  const [assignAdminRole, { isLoading, isError, error, isSuccess }] = useAssignAdminRoleMutation();
  const [showError, setShowError] = useState(false);
  
   const darkMode = useSelector((state) => state.theme.darkMode);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Admin role assigned successfully!');
      reset();
    }
    if (isError) {
      toast.error(error?.data?.message || 'Failed to assign admin role');
    }
  }, [isSuccess, isError, error, reset]);

  const onSubmit = async (data) => {
        await assignAdminRole(data);
  };

  if (isLoading) {
    return <Loader />;
  }
    
    
  if (showError) {
    return <Error onClose={() => setShowError(false)} />;
  }


  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
        
        <form onSubmit={handleSubmit(onSubmit)} className={`w-full max-w-md p-8 shadow-lg rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
          
        <h2 className={`text-xl font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-black' }`}>Assign Admin Role</h2>
            <input
              type="text"
              id="state"
              placeholder="State" 
              {...register('state')}
              className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
            />
            {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
        
            <input
              type="text"
              id="phcode"
              placeholder="PH Code"
              {...register('phcode')}
              className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-amber-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
            />
            {errors.phcode && <p className="text-red-500 text-sm">{errors.phcode.message}</p>}

          <button
            type="submit"
            className="bg-amber-700 text-white p-2 rounded-lg w-full cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? 'Assigning...' : 'Assign Admin Role'}
          </button>
        </form>
    </div>
  );
};

export default AssignAdminRole;
