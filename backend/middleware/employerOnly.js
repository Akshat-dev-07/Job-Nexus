module.exports = (req, res, next) => {
  if (req.userRole !== "employer") {
    return res.status(403).json({ message: "Only employers allowed" });
  }
  next();
};