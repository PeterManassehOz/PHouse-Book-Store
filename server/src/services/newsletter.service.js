const Newsletter = require("../models/newsletter.model");

const getSubscribersByState = async (state) => {
  if (!state) throw new Error("State is required");

  const subscribers = await Newsletter.find({ state });
  return {
    total: subscribers.length,
    subscribers,
  };
};

module.exports = { getSubscribersByState };
