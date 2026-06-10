module.exports = function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({
        message: "Access denied. You don't have permission."
      });
    }
    next();
  };
};