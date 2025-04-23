import React from 'react'
import { IoWarning, IoClose } from "react-icons/io5"; // Import close and warning icons



const Error = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-md bg-opacity-30 z-20">
     <div className="relative bg-white w-96 p-6 rounded-lg shadow-lg text-center">

        {/* Warning Icon */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-500 w-16 h-16 flex items-center justify-center rounded-full shadow-md">
            <IoWarning className="text-white text-4xl" />
        </div>

        {/* Error Message */}
        <h2 className="text-lg font-semibold text-gray-700 mt-8">
            We encountered an error while processing your request.
        </h2>


         {/* Cancel (Close) Button */}
         <button
          onClick={onClose} // Call the function to dismiss the error
          className="absolute top-3 right-3 text-gray-500 hover:text-white hover:bg-red-600 hover:rounded-full cursor-pointer"
        >
          <IoClose className="text-2xl" />
        </button>
      </div>
    </div>
  )
}

export default Error