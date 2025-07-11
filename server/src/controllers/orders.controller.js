const Order = require('../models/orders.model');
const Book = require('../models/books.model');

/*exports.createOrder = async (req, res) => {
    try {
        const user = req.user; // Get user from JWT
        const { productIds, totalPrice, name, email, phone, street, city, zipcode } = req.body;

        if (!productIds || productIds.length === 0) {
            return res.status(400).json({ message: "No products selected for the order." });
        }

        // Check if all products exist and match the user's state
        const bookDetails = await Book.find({ _id: { $in: productIds }, state: user.state });

        if (bookDetails.length !== productIds.length) {
            return res.status(400).json({ message: "Some books are not available in your state." });
        }

        // Create the order
        const newOrder = new Order({
            userId: user._id,
            name,
            email,
            phone,
            street,
            city,
            zipcode,
            state: user.state, // Attach user's state
            productIds, // Store the product IDs
            totalPrice,
            status: "pending",
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};*/



exports.createOrder = async (req, res) => {
  try {
    console.log("📦 Received order payload:", req.body);
    const user = req.user;
    const { items, totalPrice, name, email, phone, street, city, zipcode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No products selected for the order." });
    }

    // Validate every book exists and belongs to user.state
    const bookIds = items.map(i => i.bookId);
    const books   = await Book.find({ _id: { $in: bookIds }, state: user.state });

    if (books.length !== items.length) {
      return res.status(400).json({ message: "Some books are not available in your state." });
    }

    // **DECREMENT STOCK** BEFORE or AFTER saving the order:
    // Here we do it in a transaction for safety:
    const session = await Book.startSession();
    session.startTransaction();
    try {
      // Loop through each item and decrement
      for (let { bookId, quantity } of items) {
        const updated = await Book.findByIdAndUpdate(
          bookId,
          { $inc: { quantity: -quantity } },
          { new: true, session }
        );
        // Optional: if quantity would go negative, throw
        if (updated.quantity < 0) {
          throw new Error(`Insufficient stock for book ${bookId}`);
        }
      }
      
      // Create and save the order itself
      const newOrder = new Order({
        userId: user._id,
        name,
        email,
        phone,
        street,
        city,
        zipcode,
        state: user.state,
        items,        // now storing array of { bookId, quantity }
        totalPrice,
        status: "pending",
      });

      await newOrder.save({ session });
      await session.commitTransaction();
      session.endSession();

      return res.status(201).json(newOrder);

    } catch (err) {
      // if anything went wrong, rollback
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


exports.getOrdersForAdmin = async (req, res) => {
  try {
    const admin = req.user; // Get admin from JWT

    if (!admin.isAdmin) {
      return res.status(403).json({ message: "Unauthorized to view orders." });
    }

    const orders = await Order.find({ state: admin.state })
      .populate('userId', 'firstname lastname email image')  // show user details
      .populate('items.bookId', 'title author price image'); // show book details per item

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getOrdersForUser = async (req, res) => {
    try {
        const user = req.user; // Get user from JWT
        const orders = await Order.find({ userId: user._id }).populate('items.bookId', 'title author price image');
        
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found." });
        }

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const admin = req.user;
        const { orderId, status } = req.body;

        if (!admin.isAdmin) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // Get order ID from params

        // Find the order by ID
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Return the current status of the order
        res.status(200).json({ status: order.status });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllStatesOrdersForChiefAdmin = async (req, res) => {
    try {
      const admin = req.user;
      if (!admin.isAdmin || !admin.isChiefAdmin) {
        return res.status(403).json({ message: 'Unauthorized.' });
      }
  
      // grab all orders NOT in the chief’s own state
      const orders = await Order.find({ state: { $ne: admin.state } })
        .populate('userId', 'firstname lastname email image')
        .sort({ createdAt: -1 });
  
      // group by state
      const byState = orders.reduce((acc, order) => {
        acc[order.state] = acc[order.state] || [];
        acc[order.state].push(order);
        return acc;
      }, {});
  
      res.status(200).json(byState);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  };
  
  exports.getOrdersByStateForChiefAdmin = async (req, res) => {
    try {
      const admin = req.user;
      const { state } = req.params;
      if (!admin.isAdmin || !admin.isChiefAdmin) {
        return res.status(403).json({ message: 'Unauthorized.' });
      }
  
      // fetch just this state
      const orders = await Order.find({ state })
        .populate('userId', 'firstname lastname email image')
        .populate('productIds', 'title author price image')
        .sort({ createdAt: -1 });
  
      res.status(200).json(orders);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  };