const AdminOrders = require('../models/adminOrders.model');
const Admin = require('../models/admin.model');


const createAdminOrder = async (req, res) => {
  try {
    const { orderItems, message } = req.body;
    const adminId = req.user._id;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

      // disallow chief admins from placing orders
      if (admin.isChiefAdmin) {
      return res.status(403).json({ message: "Chief admin cannot create orders." });
    }

    // Validate each order item
    if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one book." });
    }

    for (let item of orderItems) {
      if (!item.bookTitle || typeof item.bookTitle !== 'string' || !item.quantity || typeof item.quantity !== 'number') {
        return res.status(400).json({ message: "Each order item must have a valid bookTitle and quantity." });
      }
    }

    const newOrder = new AdminOrders({
      adminId,
      adminName: admin.name,
      adminState: admin.state,
      orderItems,
      message,
      status: "pending",
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating admin order:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
;


const getAdminOrders = async (req, res) => {
  try {
    const adminId = req.user._id; // Get the admin ID from the JWT token

    // Find orders for the specific admin without populating productId
    const orders = await AdminOrders.find({ adminId });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


const updateAdminOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body; // Get new status from request body

        // Find the order by ID and update its status
        const updatedOrder = await AdminOrders.findByIdAndUpdate(
            orderId,
            { status },
            { new: true } // Return the updated order
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found." });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getAdminOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // Get order ID from params

        // Find the order by ID
        const order = await AdminOrders.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // Return the current status of the order
        res.status(200).json({ status: order.status });
    } catch (error) {
        console.error("Error fetching order status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};


const getAllStatesOrdersForChiefAdmin = async (req, res) => {
  try {
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin || !admin.isChiefAdmin) {
      return res.status(403).json({ message: "Access denied. Only the chief admin can view all states' orders." });
    }

    const orders = await AdminOrders.find(); // no populate, schema already has bookTitle
    if (!orders.length) {
      return res.status(404).json({ message: "No orders found." });
    }
    // Group by state
    const byState = orders.reduce((acc, order) => {
      acc[order.adminState] = acc[order.adminState] || [];
      acc[order.adminState].push(order);
      return acc;
    }, {});
    res.status(200).json(byState);
  } catch (error) {
    console.error("Error fetching all states orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// GET /chief-admin-orders/:state
// Returns the array of orders for the given state
const getOrdersByStateForChiefAdmin = async (req, res) => {
  try {
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin || !admin.isChiefAdmin) {
      return res.status(403).json({ message: "Access denied. Only the chief admin can view all states' orders." });
    }

    const { state } = req.params;
    const orders = await AdminOrders.find({ adminState: state });
    if (!orders.length) {
      return res.status(404).json({ message: `No orders found for state ${state}.` });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders by state:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};



const getAdminOrderStatistics = async (req, res) => {
  try {
    const adminId = req.user._id;
    const adminState = req.user.state;

    // 1. Total Orders for this Admin
    const totalOrders = await AdminOrders.countDocuments({ adminId });

    // 2. Status breakdown
    const rawStatus = await AdminOrders.aggregate([
      { $match: { adminId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statusBreakdown = rawStatus.reduce((acc, r) => {
      acc[r._id] = r.count;
      return acc;
    }, {});

    // 3. Recent Orders (no populate)
    const recent = await AdminOrders.find({ adminId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // 4. Total State-wide Orders
    const totalStateOrders = await AdminOrders.countDocuments({ adminState });

    // 5. Total books ordered (sum of all quantities)
    const booksAgg = await AdminOrders.aggregate([
      { $match: { adminId } },
      { $unwind: "$orderItems" },
      { $group: { _id: null, totalBooks: { $sum: "$orderItems.quantity" } } }
    ]);
    const totalBooks = booksAgg[0]?.totalBooks || 0;

    // 6. Average quantity per order
    const avgAgg = await AdminOrders.aggregate([
      { $match: { adminId } },
      { $unwind: "$orderItems" },
      { $group: { _id: null, avgQty: { $avg: "$orderItems.quantity" } } }
    ]);
    const averageQuantity = avgAgg[0]?.avgQty?.toFixed(2) || "0.00";

    res.json({
      orders: {
        total: totalOrders,
        recent,
        statusBreakdown,
        totalBooks,
        averageQuantity
      },
      stateOrders: { total: totalStateOrders }
    });
  } catch (err) {
    console.error("Error getting admin order statistics:", err);
    res.status(500).json({ message: "Error getting aggregated data", error: err.message });
  }
};



module.exports = { createAdminOrder, getAdminOrders, updateAdminOrderStatus, getAdminOrderStatus, getAllStatesOrdersForChiefAdmin, getOrdersByStateForChiefAdmin, getAdminOrderStatistics };