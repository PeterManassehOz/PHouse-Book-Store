const Newsletter = require("../models/newsletter.model");
const User = require("../models/users.model");
const { getSubscribersByState } = require('../services/newsletter.service');




// 🔹 Subscribe to Newsletter
const subscribeNewsletter = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user || !user.email || !user.state) {
      return res.status(400).json({ message: "User not found or missing email/state." });
    }

    const email = user.email;
    
    const existingSubscriber = await Newsletter.findOne({ email, state: user.state });

    if (existingSubscriber) {
      await Newsletter.findOneAndDelete({ email, state: user.state });
      return res.status(200).json({ message: "You have successfully unsubscribed.", subscribed: false });
    }

    const newSubscriber = new Newsletter({ email, state: user.state });
    await newSubscriber.save();

    res.status(201).json({
      message: `You have successfully subscribed to the ${user.state} newsletter!`,
      subscribed: true
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

  

// 🔹 Get Subscription Status (Check if user is subscribed to their state's newsletter)
const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    
    if (!user || !user.email || !user.state) {
      return res.status(400).json({ message: "User not found or missing email/state." });
    }

    const email = user.email;
    const userState = user.state;
    if (!userState) {
      return res.status(400).json({ message: "User state not found." });
    }

    const isSubscribed = await Newsletter.findOne({ email, state: userState });

    res.status(200).json({
      subscribed: !!isSubscribed,
      state: userState,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



  // 🔹 Get All Subscribers for an Admin's State
  const getAllSubscribersForStateAdmin = async (req, res) => {
    try {
      const state = req.user?.state;
      const result = await getSubscribersByState(state); // result.subscribers is the array
  
      const formatted = result.subscribers.map(sub => ({
        email: sub.email,
        subscribedAt: sub.subscribedAt, // already correctly named
      }));
  
      res.status(200).json(formatted);
    } catch (error) {
      console.error("Admin Subscribers Error:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };
  

  
  
module.exports = { subscribeNewsletter, getSubscriptionStatus, getAllSubscribersForStateAdmin };