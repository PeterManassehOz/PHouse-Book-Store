import { FaFacebookF } from "react-icons/fa";
import { FaSquareYoutube } from "react-icons/fa6";
import { useState, useEffect } from "react";

import "react-toastify/dist/ReactToastify.css";
import { useGetSubscriptionStatusQuery, useSubscribeNewsletterMutation } from "../../redux/newsLetterAuthApi/newsLetterAuthApi";
import { toast } from 'react-toastify'

const Footer = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch subscription status
  const { data, isLoading: isCheckingStatus } = useGetSubscriptionStatusQuery();


  // Subscribe/Unsubscribe mutation
  const [subscribeNewsletter, { isLoading: isSubscribing }] = useSubscribeNewsletterMutation();

  // Update subscription status when data changes
  useEffect(() => {
    if (data) {
      setIsSubscribed(data.subscribed);
    }
  }, [data]);

  // Handle subscription toggle
  const handleSubscription = async () => {
    try {
      await subscribeNewsletter().unwrap();
      setIsSubscribed((prev) => !prev);
      toast.success('Newsletter subscription updated!');
    } catch (err) {
      console.error("Subscription failed:", err);
      toast.error('Newsletter subscription failed');
    }
  };


  return (
    <footer className="bg-amber-900 text-white py-30 px-6 sm:px-20">
      <div className="mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        
        {/* Left Section */}
        <div className="text-center sm:text-left md:w-[24%]">
          <h3 className="text-xl font-semibold">Living Seed, Gboko</h3>
          <p className="text-sm mt-2">Contact</p>
          <p className="mt-1">+234 80 456 789</p>
          <p className="mt-1">example@example.com</p>
          <div className="flex justify-center sm:justify-start gap-4 mt-3">
            <FaFacebookF className="text-xl cursor-pointer hover:text-amber-300 transition" />
            <FaSquareYoutube className="text-2xl cursor-pointer hover:text-amber-300 transition" />
          </div>
        </div>

        {/* Center Section */}
        <div className="text-center md:w-[51%]">
          <h3 className="text-xl font-semibold">Location</h3>
          <p className="text-sm mt-2 leading-6">
            Peace House, P.O Box 971 <br />
            Gboko, Benue State <br />
            Nigeria,<br />
            Tel: +234 703 036 3659, +234 703 768 1198
          </p>
        </div>

        {/* Right Section */}
        <div className="text-center md:text-right md:w-[25%]">
          <h3 className="text-xl font-semibold">Stay Connected</h3>
          <p className="text-sm mt-2 leading-6">Click below to {isSubscribed ? "unsubscribe" : "subscribe"} {isSubscribed ? "from" : "to"} our newsletter.</p>
          <div className="flex mt-4 justify-center md:justify-end w-full">
            <button
              className={`text-white 
              font-medium py-4 px-20 rounded-full shadow-md 
              transition duration-300 text-sm sm:text-base 
              w-full sm:w-auto text-center sm:text-right ${isSubscribed ? "bg-red-600 hover:bg-red-500 disabled:bg-red-400" : "bg-amber-600 hover:bg-amber-500 disabled:bg-amber-400"}`} onClick={handleSubscription}
              disabled={isSubscribing || isCheckingStatus}
            >
              {isCheckingStatus
                ? "Checking..."
                : isSubscribing
                ? "Processing..."
                : isSubscribed
                ? "Unsubscribe"
                : "Subscribe"}
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-sm mt-30 border-t border-amber-400 pt-10">
        <p>© {new Date().getFullYear()} Peace House. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
