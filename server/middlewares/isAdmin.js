export const isAdmin = (req, res, next) => {
  // req.user comes from identifier middleware
  // It has userId, email, verified, isAdmin

  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized. Please login first.",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  // User is admin then continue to controller
  next();
};
