import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import { toast } from "react-toastify";
import {
  useDeleteBookMutation,
  useGetAllBooksQuery,
} from "../../redux/adminBookAuthApi/adminBookAuthApi";
import Error from "../Error/Error";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ManageBook = () => {
  const { data: books, refetch, isLoading, error } = useGetAllBooksQuery();
  const [
    deleteBook,
    { isError: isDeleteError, isSuccess: isDeleteSuccess, reset },
  ] = useDeleteBookMutation();

  console.log(books);

  const darkMode = useSelector((state) => state.theme.darkMode);
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      console.error("Fetch error:", error);
      toast.error(error?.data?.message || "Failed to fetch books");
      setShowError(true);
    }
  }, [error]);

  useEffect(() => {
    if (isDeleteSuccess) {
      toast.success("Book deleted successfully!");
      reset();
      refetch();
    }
    if (isDeleteError) {
      toast.error("Failed to delete book. You may not be authorized.");
    }
  }, [isDeleteSuccess, isDeleteError, reset, refetch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        await deleteBook(id).unwrap();
        refetch();
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  if (isLoading) return <Loader />;
  if (showError) return <Error onClose={() => setShowError(false)} />;

  return (
    <div
      className={`
        min-h-screen flex items-center justify-center
        ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}
      `}
    >
      <div
        className={`
          w-full max-w-3xl p-6 shadow-md rounded-lg
          ${darkMode ? "bg-gray-800" : "bg-white"}
        `}
      >
        <h2
          className={`
            text-2xl font-bold mb-6 text-center
            ${darkMode ? "text-white" : "text-gray-800"}
          `}
        >
          Manage Books
        </h2>

        {books?.length === 0 ? (
          <p className={`
            text-center
            ${darkMode ? "text-gray-400" : "text-gray-500"}
          `}>
            No books found.
          </p>
        ) : (
          books.map((book) => (
            <div
              key={book._id}
              className={`
                rounded-lg p-6 mb-4 shadow-md
                ${darkMode ? "bg-gray-700" : "bg-white"}
              `}
            >
              <div className="mb-4">
                <h3
                  className={`
                    text-xl font-semibold
                    ${darkMode ? "text-white" : "text-gray-700"}
                  `}
                >
                  {book.title}
                </h3>
                <p className={`
                  ${darkMode ? "text-gray-300" : "text-gray-600"}
                `}>
                  {book.description}
                </p>
                <p className={`
                  text-sm italic
                  ${darkMode ? "text-gray-400" : "text-gray-400"}
                `}>
                  Posted by: {book.adminId?.name}{" "}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/edit-book/${book._id}`)}
                  className="
                    bg-blue-500 hover:bg-blue-600 text-white
                    font-medium py-2 px-4 rounded transition
                  "
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(book._id)}
                  className="
                    bg-red-500 hover:bg-red-600 text-white
                    font-medium py-2 px-4 rounded transition
                  "
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageBook;
