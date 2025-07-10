const Newsletter = require("../models/newsletter.model");
const User = require("../models/users.model");
const { getSubscribersByState } = require('../services/newsletter.service');
const transporter   = require("../config/nodemailer");  // your existing nodemailer setup





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
  


/**
 * POST /newsletter/send
 * Body: { subject: string, html: string }
 * Sends only to subscribers in req.user.state
 */
const sendNewsletter = async (req, res) => {
  try {
    const { subject, html } = req.body;
    const state = req.user.state;              // the admin’s state

    if (!subject || !html) {
      return res
        .status(400)
        .json({ message: "Both subject and html are required" });
    }
    if (!state) {
      return res
        .status(400)
        .json({ message: "Admin state not found on your profile" });
    }

    // fetch only those in this admin’s state
    const subscribers = await Newsletter.find({ state }).select("email -_id");
    if (subscribers.length === 0) {
      return res
        .status(404)
        .json({ message: `No subscribers in your state (${state})` });
    }

    // send in parallel
    await Promise.all(
      subscribers.map(({ email }) =>
        transporter.sendMail({
          to:      email,
          subject: subject,
          html:    html,
        })
      )
    );

    res.status(200).json({
      message: `Newsletter sent to ${subscribers.length} subscriber(s) in ${state}`,
      count: subscribers.length,
    });
  } catch (err) {
    console.error("sendNewsletter error:", err);
    res
      .status(500)
      .json({ message: "Server error sending newsletter", error: err.message });
  }
};

  
module.exports = { subscribeNewsletter, getSubscriptionStatus, getAllSubscribersForStateAdmin, sendNewsletter };