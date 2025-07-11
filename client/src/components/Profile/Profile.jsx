import { AiOutlineClose } from "react-icons/ai";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRef, useState } from "react";
import * as yup from "yup";
import { 
  useGetUserProfileQuery,
 useUpdateProfileMutation, 
} from "../../redux/profileAuthApi/profileAuthApi";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loader";
import Error from "../../components/Error/Error";
import { useSelector } from "react-redux";






const Profile = () => {

  const { data: userProfile, isLoading: Loading } = useGetUserProfileQuery();
  //Mutation for updating profile
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [showError, setShowError] = useState(false);

  // Validation schema
  const schema = yup.object().shape({
    username: yup.string().required("Username is required"),
    bio: yup.string().required("Bio is required"),
    image: yup.mixed()  .test('fileRequired', 'Image is required', (value) => !!value && value.length > 0), 
  });

  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({ resolver: yupResolver(schema) });


  const darkMode = useSelector((state) => state.theme.darkMode);

    
   
  const [image, setImage] = useState(null)
  const imageRef = useRef()

  const handleImageChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setImage(URL.createObjectURL(file))
      setValue('image', event.target.files)
    }
  }


  const handleRemoveImage = () => {
    setImage(null)
    setValue('image', null) // Clear the `image` value for validation
  }

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("bio", data.bio);
    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]) 
    }
  
    console.log("Form Data:", formData);
      
    try {
      const response = await updateProfile(formData).unwrap()
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      console.log('Token:', response.token);
      console.log("Profile Data:", data)      
      console.log("Profile Updated:", response)

      reset()  
      setImage(null)
      toast.success('Profile updated successfully')

    } catch (error) {
      console.error("Update Error:", error)
      toast.error(error?.data?.message || 'Profile update failed')
    }

  }


  
  if (Loading) return <Loader />
  if (showError)  return <Error onClose={() => setShowError(false)}/>;
   

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className={`relative w-full max-w-md md:max-w-4xl p-4 md:p-8 shadow-lg rounded-lg flex flex-col md:flex-row items-center gap-4 md:gap-8 min-h-[400px] ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>

        {/* Profile Preview */}
        <div className="flex flex-col items-center w-full md:w-1/2 p-4 rounded-lg">
        <img
           src={userProfile?.image || "/profileIconBrown.jpeg"}
          alt="Profile"
          className="w-28 h-28 md:w-40 md:h-40 object-cover rounded-full shadow-md"
        />
          <h2 className={`text-lg md:text-xl font-semibold mt-4 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            {userProfile?.username || "Username"}
          </h2>
          <p className={`text-center mt-1 text-sm md:text-base ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
            {userProfile?.bio || "Your bio"}
          </p>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`relative flex flex-col gap-3 w-full md:w-1/2 space-y-3 shadow-md p-4 rounded-lg ${darkMode ? "bg-gray-700 text-white" : "bg-white text-black"}`}
        >
          <label className="flex flex-col">
            <input
              type="text"
              placeholder="Username"
              {...register("username")}
              className={`w-full p-2 md:p-3 rounded-md border-none focus:outline-none text-sm md:text-base ${darkMode ? "bg-gray-800 text-white" : "focus:ring-2 focus:ring-blue-500 bg-gray-200 text-black"}`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs md:text-sm">
                {errors.username.message}
              </p>
            )}
          </label>

          <label className="flex flex-col">
          <textarea
              key={darkMode}
              placeholder="Bio"
              {...register("bio")}
              className={`w-full p-2 md:p-3 rounded-md border-none focus:outline-none text-sm md:text-base 
                ${darkMode ? "bg-gray-800 text-white placeholder-gray-400" : "bg-gray-200 text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-500"}`}
            />

            {errors.bio && (
              <p className="text-red-500 text-xs md:text-sm">
                {errors.bio.message}
              </p>
            )}
          </label>

          {/* Choose Image Button */}
          <label className="block w-full cursor-pointer">
            <span className="w-28 md:w-32 text-white bg-orange-700 hover:bg-orange-400 px-4 py-2 rounded-md text-xs md:text-sm text-center block transition">
              Choose File
            </span>
            <input
              type="file"
              className="hidden"
              accept=".jpg, .jpeg, .png"
              ref={imageRef}
              onChange={handleImageChange}
            />
          </label>

          {/* Image Preview (Only shows inside the form before submission) */}
          {image && (
            <div className="relative w-20 h-20 mt-2">
              <img
                src={image}
                alt="Selected"
                className="w-full h-full rounded-md border"
              />
              {/* Remove Image Icon */}
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full cursor-pointer p-1"
              >
                <AiOutlineClose size={12} />
              </button>
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded cursor-pointer text-sm md:text-base"
            disabled={ isLoading }
          >
           {isLoading ? "Loading..." : "Update Profile"}
          </button>

          {Object.keys(errors).length > 0 && (
            <p className="text-red-500 text-xs md:text-sm">
              Please fill out all required fields correctly.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
