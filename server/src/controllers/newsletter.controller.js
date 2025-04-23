const Newsletter = require("../models/newsletter.model");
const { getSubscribersByState } = require('../services/newsletter.service');

// 🔹 Subscribe to Newsletter
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    const user = req.user;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!user.state) {
      return res.status(400).json({ message: "User state is missing." });
    }

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
    const { email } = req.body;
    const user = req.user;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

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
      const result = await getSubscribersByState(state);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };

  
  
module.exports = { subscribeNewsletter, getSubscriptionStatus, getAllSubscribersForStateAdmin };