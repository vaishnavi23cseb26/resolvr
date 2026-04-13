function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      res.status(403);
      throw new Error("Forbidden");
    }
    next();
  };
}

module.exports = { requireRole };

