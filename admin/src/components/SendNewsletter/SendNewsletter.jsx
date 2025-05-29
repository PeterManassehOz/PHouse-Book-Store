import React, { useState } from "react";
import { toast } from "react-toastify";
import { useSendNewsletterMutation } from "../../redux/subscribersAuthApi/subscribersAuthApi";
import { useSelector } from "react-redux";

const SendNewsletter = () => {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [sendNewsletter, { isLoading }] = useSendNewsletterMutation();

  
  const darkMode = useSelector((state) => state.theme.darkMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !html) {
      toast.error("Subject and content are required");
      return;
    }
    try {
      const res = await sendNewsletter({ subject, html }).unwrap();
      toast.success(res.message || "Newsletter sent!");
      setSubject("");
      setHtml("");
    } catch (err) {
      toast.error(err.data?.message || err.message || "Failed to send newsletter");
    }
  };

  return (
    <div className={`max-w-3xl mx-auto p-6 shadow-md rounded-lg mt-20 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
      <h2 className={`text-2xl font-semibold mb-6 text-center  ${darkMode ? "text-white" : "text-gray-800"}`}>Send Newsletter</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
            placeholder="Newsletter subject"
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">HTML Content</label>
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
           className={`w-full p-3 mb-3 rounded-md border-none focus:ring-2 focus:ring-blue-200 focus:outline-none ${darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600"}`}
            placeholder="<h1>Hello subscribers!</h1>"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
           className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded cursor-pointer"
        >
          {isLoading ? "Sending…" : "Send Newsletter"}
        </button>
      </form>
    </div>
  );
};

export default SendNewsletter;
