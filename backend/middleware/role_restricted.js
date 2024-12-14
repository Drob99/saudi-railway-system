/**
 *
 * @param {("Staff" | "Passenger")[]} allowedRoles
 * @returns
 */
const roleRestricted = (allowedRoles) => {
  return (req, res, next) => {
    return next();
    // Ensure req.user exists (it should be set by the `protected` middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Access denied. User not authenticated.",
      });
    }

    // Check if the user's role is in the allowedRoles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden. You do not have access to this resource.",
      });
    }

    // Proceed to the next middleware or route handler
    next();
  };
};

module.exports = roleRestricted;
