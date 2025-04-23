import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useCreateBookMutation } from "../../redux/adminBookAuthApi/adminBookAuthApi";
import { toast } from "react-toastify";
import { useSelector } from 'react-redux';
import { AiOutlineClose } from "react-icons/ai";





// 📌 Validation schema
const bookSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  date: yup.string().required("Date is required"),
  category: yup.string().required("Category is required"),
  quantity: yup.number().required("Quantity is required").min(1),
  price: yup.number().required("Price is required").min(0),
  authorName: yup.string().required("Author name is required"),
  authorBio: yup.string().required("Author bio is required"),
  image: yup.mixed().required("Book image is required"),
  authorImage: yup.mixed(), // optional
});

const CreateBook = () => {
  const [createBook, { isLoading }] = useCreateBookMutation();

  
     const darkMode = useSelector((state) => state.theme.darkMode);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bookSchema),
  });


    const [image, setImage] = useState(null)

    const [authorImage, setAuthorImage] = useState(null)
  
    const handleImageChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        setImage(URL.createObjectURL(file))
        setValue('image', event.target.files)
      }
    }

    const handleAuthorImageChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        setAuthorImage(URL.createObjectURL(file))
        setValue('authorImage', event.target.files)
      }
    }
  
  
    const handleRemoveImage = () => {
      setImage(null)
      setValue('image', null) // Clear the `image` value for validation
    }

    const handleRemoveAuthorImage = () => {
      setAuthorImage(null)
      setValue('authorImage', null) // Clear the `image` value for validation
    }

  const onSubmit = async (data) => {
    const formData = new FormData();

    // Append fields
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("date", data.date);
    formData.append("price", data.price);
    formData.append("category", data.category);
    formData.append("quantity", data.quantity);
    formData.append("isPopular", data.isPopular || false);
    formData.append("isRecommended", data.isRecommended || false);
    formData.append("isYearBook", data.isYearBook || false);

    const author = {
      name: data.authorName,
      bio: data.authorBio,
    };
    formData.append("author", JSON.stringify(author));

    if (data.image?.[0]) formData.append("image", data.image[0]);
    if (data.authorImage?.[0]) formData.append("authorImage", data.authorImage[0]);

    
      reset()  
      setImage(null)
      setAuthorImage(null)
    try {
      const response = await createBook(formData).unwrap();
      if (response) toast.success("Book created successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to create book.");
    }
  };

  return (
    <div className={`max-w-3xl mx-auto p-6 shadow-md rounded-lg mt-20 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <h2 className={`text-2xl font-semibold mb-6 text-center  ${darkMode ? "text-white" : "text-gray-800"}`}>Create New Book</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 rounded-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          {...register("title")}
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

        {/* Description */}
        <textarea
          placeholder="Description"
          {...register("description")}
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${
            darkMode ? "bg-gray-700 text-white placeholder-gray-400" : "bg-gray-100 text-gray-600 placeholder-gray-400"
          }`}
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}

        {/* Date */}
        <input
          type="date"
          {...register("date")}
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}

        {/* Category */}
        <input
          placeholder="Category"
          {...register("category")}
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
        />
        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}

        {/* Quantity */}
        <input
          type="number"
          placeholder="Quantity"
          {...register("quantity")}
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
        />
        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}

        {/* Price */}
        <input
          type="number"
          placeholder="Price"
          {...register("price")}
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
        />
        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}

        {/* Author Name */}
        <input
          placeholder="Author Name"
          {...register("authorName")}
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
        />
        {errors.authorName && <p className="text-red-500 text-sm">{errors.authorName.message}</p>}

        {/* Author Bio */}
        <textarea
          key={darkMode}
          placeholder="Author Bio"
          {...register("authorBio")}
          className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
        />
        {errors.authorBio && <p className="text-red-500 text-sm">{errors.authorBio.message}</p>}

       {/* Book Image */}
        <div className="relative">
          <label className="block font-medium text-gray-700 mb-1 cursor-pointer">
            <span className="w-24 sm:w-28 md:w-32 text-white bg-orange-700 hover:bg-orange-600 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-center block transition">
              Book Image
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleImageChange(e);
                register("image").onChange(e);
              }}
            />
          </label>

          {image && (
            <div
              className="
                absolute 
                top-4 right-4 
                sm:top-6 sm:right-5 
                md:top-2 md:right-6 
              "
            >
              <div
                className="
                  relative 
                  w-12 h-12            
                  sm:w-16 sm:h-16      
                  md:w-20 md:h-20     
                  mt-2
                "
              >
                <img
                  src={image}
                  alt="Selected"
                  className="w-full h-full rounded-md border object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <AiOutlineClose size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Author Image */}
        <div className="relative">
          <label className="block font-medium text-gray-700 mb-1 cursor-pointer">
            <span className="w-30 sm:w-28 md:w-32 text-white bg-orange-700 hover:bg-orange-600 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-center block transition">
              Author Image
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleAuthorImageChange(e);
                register("authorImage").onChange(e);
              }}
            />
          </label>

          {authorImage && (
            <div
              className="
                absolute 
                -top-8 right-20        
                sm:top-6 sm:right-20   
                md:-top-11 md:right-30   
              "
            >
              <div
                className="
                  relative 
                  w-12 h-12            
                  sm:w-16 sm:h-16 
                  md:w-20 md:h-20 
                  mt-2
                "
              >
                <img
                  src={authorImage}
                  alt="Selected"
                  className="w-full h-full rounded-md border object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveAuthorImage}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"
                >
                  <AiOutlineClose size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

          


        {/* Toggle checkboxes */}
        <div className="flex flex-wrap gap-6 mt-4">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register("isPopular")} className="mr-2 active:accent-amber-800 accent-amber-200 cursor-pointer" />
            <span className={`${darkMode ? "text-white" : "text-gray-700"}`}>Popular</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register("isRecommended")} className="mr-2 active:accent-amber-800 accent-amber-200 cursor-pointer" />
            <span className={`${darkMode ? "text-white" : "text-gray-700"}`}>Recommended</span>
          </label>

          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register("isYearBook")} className="mr-2 active:accent-amber-800 accent-amber-200 cursor-pointer" />
            <span className={`${darkMode ? "text-white" : "text-gray-700"}`}>Year Book</span>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Book"}
        </button>
      </form>
    </div>
  );
};

export default CreateBook;
