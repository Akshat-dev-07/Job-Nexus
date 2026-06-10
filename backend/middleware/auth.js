const jwt = require("jsonwebtoken");

module.exports = function auth(req, res, next) {
  try {
    const cookieToken = req.cookies && req.cookies.token;
    const header = req.headers.authorization;
    const headerToken = header && header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    const token = cookieToken || headerToken;

    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    req.userRole = decoded.role;  
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};