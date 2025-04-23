const Order = require('../models/orders.model');

const Book = require('../models/books.model');


exports.createOrder = async (req, res) => {
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
};

exports.getOrdersForAdmin = async (req, res) => {
    try {
        const admin = req.user; // Get admin from JWT

        if (!admin.isAdmin) {
            return res.status(403).json({ message: "Unauthorized to view orders." });
        }

        const orders = await Order.find({ state: admin.state }).populate('userId', 'firstname lastname email image').populate('productIds', 'title author price image');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getOrdersForUser = async (req, res) => {
    try {
        const user = req.user; // Get user from JWT
        const orders = await Order.find({ userId: user._id }).populate('productIds', 'title author price image');
        
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
