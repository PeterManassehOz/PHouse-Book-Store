import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useSelector } from "react-redux";
import { AiOutlineClose } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { toast } from "react-toastify";

import {
  useGetBookByIdQuery,
  useUpdateBookMutation,
} from "../../redux/adminBookAuthApi/adminBookAuthApi";
import Loader from "../Loader/Loader";

// 📌 Validation schema (same as CreateBook)
const bookSchema = yup.object().shape({
  title:       yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  date:        yup.string().required("Date is required"),
  category:    yup.string().required("Category is required"),
  quantity:    yup.number().required("Quantity is required").min(1),
  price:       yup.number().required("Price is required").min(0),
  authorName:  yup.string().required("Author name is required"),
  authorBio:   yup.string().required("Author bio is required"),
  image:       yup.mixed(), // optional on edit
  authorImage: yup.mixed(), // optional
});

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const darkMode = useSelector((state) => state.theme.darkMode);

  // Fetch existing book
  const { data: book, isLoading, isError, refetch } = useGetBookByIdQuery(id);
  const [updateBook, { isLoading: isUpdating }] = useUpdateBookMutation();

  // Preview URLs
  const [image, setImage] = useState(null);
  const [authorImage, setAuthorImage] = useState(null);

  // For file-input reset
  const imageRef       = useRef();
  const authorImageRef = useRef();

  // React-Hook-Form setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bookSchema),
    defaultValues: {
      // will be overwritten in useEffect
      title:         "",
      description:   "",
      date:          "",
      category:      "",
      quantity:      "",
      price:         "",
      authorName:    "",
      authorBio:     "",
      isPopular:     false,
      isRecommended: false,
      isYearBook:    false,
    },
  });

  // When book loads, populate form and previews
  useEffect(() => {
    if (!book) return;
    const {
      title,
      description,
      date,
      category,
      quantity,
      price,
      isPopular,
      isRecommended,
      isYearBook,
      image: imgPath,
      author,
    } = book;

    // reset form fields
    reset({
      title,
      description,
      date: date?.split("T")[0] || "",
      category,
      quantity,
      price,
      authorName: author[0]?.name  || "",
      authorBio:  author[0]?.bio   || "",
      isPopular,
      isRecommended,
      isYearBook,
    });

    // set preview URLs
    setImage(imgPath ? `http://localhost:5000/${imgPath}` : null);
    setAuthorImage(
      author[0]?.authorImage
        ? `http://localhost:5000/${author[0].authorImage}`
        : null
    );
  }, [book, reset]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setValue("image", e.target.files);
    }
  };
  const handleAuthorImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAuthorImage(URL.createObjectURL(file));
      setValue("authorImage", e.target.files);
    }
  };
  const handleRemoveImage = () => {
    setImage(null);
    setValue("image", null);
    if (imageRef.current) imageRef.current.value = "";
  };
  const handleRemoveAuthorImage = () => {
    setAuthorImage(null);
    setValue("authorImage", null);
    if (authorImageRef.current) authorImageRef.current.value = "";
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title",        data.title);
    formData.append("description",  data.description);
    formData.append("date",         data.date);
    formData.append("price",        data.price);
    formData.append("category",     data.category);
    formData.append("quantity",     data.quantity);
    formData.append("isPopular",    data.isPopular || false);
    formData.append("isRecommended",data.isRecommended || false);
    formData.append("isYearBook",   data.isYearBook || false);

    // author as JSON string
    formData.append(
      "author",
      JSON.stringify({
        name: data.authorName,
        bio:  data.authorBio,
      })
    );

    if (data.image?.[0])       formData.append("image",       data.image[0]);
    if (data.authorImage?.[0]) formData.append("authorImage", data.authorImage[0]);

    try {
      await updateBook({ id, studyData: formData }).unwrap();
      toast.success("Book updated successfully!");
      refetch();
      navigate("/admin-dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to update book");
    }
  };

  if (isLoading) return <Loader />;
  if (isError)   return <p className="text-center text-red-500">Failed to load book.</p>;

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-gray-100"}`}>
      <div
     className={`w-full max-w-3xl p-6 shadow-md rounded-lg ${
        darkMode ? "bg-gray-800" : "bg-white"
       }`}
      >
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white bg-amber-700 hover:bg-amber-400 rounded-full shadow-md cursor-pointer"
      >
        <IoIosArrowBack className="text-xl sm:text-2xl" />
      </button>
      <h2
        className={`text-2xl font-semibold mb-6 text-center ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Edit Book
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-4 rounded-lg ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}
      >
        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          {...register("title")}
          className={`w-full p-3 mb-1 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}

        {/* Description */}
        <textarea
          placeholder="Description"
          {...register("description")}
          className={`w-full p-3 mb-1 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${
            darkMode
              ? "bg-gray-700 text-white placeholder-gray-400"
              : "bg-gray-100 text-gray-600 placeholder-gray-400"
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description.message}</p>
        )}

        {/* Date */}
        <input
          type="date"
          {...register("date")}
          className={`w-full p-3 mb-1 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"
          }`}
        />
        {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}

        {/* Category */}
        <input
          placeholder="Category"
          {...register("category")}
          className={`w-full p-3 mb-1 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"
          }`}
        />
        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}

        {/* Quantity */}
        <input
          type="number"
          placeholder="Quantity"
          {...register("quantity")}
          className={`w-full p-3 mb-1 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"
          }`}
        />
        {errors.quantity && <p className="text-red-500 text-sm">{errors.quantity.message}</p>}

        {/* Price */}
        <input
          type="number"
          placeholder="Price"
          {...register("price")}
          className={`w-full p-3 mb-1 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"
          }`}
        />
        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}

        {/* Author Name */}
        <input
          placeholder="Author Name"
          {...register("authorName")}
          className={`w-full p-3 mb-1 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"
          }`}
        />
        {errors.authorName && (
          <p className="text-red-500 text-sm">{errors.authorName.message}</p>
        )}

        {/* Author Bio */}
        <textarea
          key={darkMode} // force re-render if theme changes
          placeholder="Author Bio"
          {...register("authorBio")}
          className={`w-full p-3 mb-1 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"
          }`}
        />
        {errors.authorBio && (
          <p className="text-red-500 text-sm">{errors.authorBio.message}</p>
        )}

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
          <label className="inline-flex items-center gap-2 cursor-pointer">
            <span className="w-30 sm:w-28 md:w-32 text-white bg-orange-700 hover:bg-orange-600 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm text-center block transition"
          >
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

        {/* Toggles */}
        <div className="flex gap-6">
          {["isPopular","isRecommended","isYearBook"].map((field) => (
            <label key={field} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                {...register(field)}
                className="cursor-pointer accent-amber-200 active:accent-amber-800"
              />
              <span className={darkMode ? "text-white" : "text-gray-700"}>
                {field.replace("is", "")}
              </span>
            </label>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isUpdating}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
        >
          {isUpdating ? "Updating..." : "Update Book"}
        </button>
      </form>
      </div>
    </div>
  );
}

export default EditBook