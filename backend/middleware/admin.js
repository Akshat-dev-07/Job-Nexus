const User = require("../models/User");

module.exports = async function adminMiddleware(req, res, next) {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    if (user.isSuspended) {
      return res.status(403).json({ message: "Admin account is suspended" });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Authorization failed" });
  }
};