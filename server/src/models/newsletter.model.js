const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true,},
  state: { type: String, required: true },
  subscribedAt: { type: Date, default: Date.now, },
});


// ensure that each (email, state) pair is inserted only once:
newsletterSchema.index({ email: 1, state: 1 }, { unique: true });



const Newsletter = mongoose.model("Newsletter", newsletterSchema);
module.exports = Newsletter;
