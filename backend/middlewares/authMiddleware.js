const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

exports.isAuthenticated = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else {
      const authHeader = req.headers.authorization || "";

      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded.id });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid Token!",
    });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};

// const jwt = require("jsonwebtoken");
// const rateLimit = require("express-rate-limit");
// const User = require("../models/userSchema");

// const jwtVerifyOptions = {
//     issuer: process.env.JWT_ISSUER || "crosta-api",
//     audience: process.env.JWT_AUDIENCE || "crosta-users"
// };

// const ensureJwtSecret = () => {
//     if (!process.env.JWT_SECRET) {
//         const error = new Error("JWT_SECRET is not configured.");
//         error.statusCode = 500;
//         throw error;
//     }

//     return process.env.JWT_SECRET;
// };

// const getBearerToken = (req) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//         return null;
//     }

//     const [scheme, token, ...rest] = authHeader.trim().split(" ");

//     if (scheme !== "Bearer" || !token || rest.length > 0) {
//         return null;
//     }

//     return token;
// };

// exports.authLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
//     standardHeaders: true,
//     legacyHeaders: false,
//     message: {
//         success: false,
//         message: "Too many authentication attempts. Please try again later."
//     }
// });

// exports.isAuthenticated = async (req, res, next) => {
//     try {
//         const secret = ensureJwtSecret();
//         const token = getBearerToken(req);

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authentication token is required."
//             });
//         }

//         const decoded = jwt.verify(token, secret, jwtVerifyOptions);

//         if (!decoded?.id) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid authentication token."
//             });
//         }

//         const user = await User.findById(decoded.id).select("name email role");

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authentication failed."
//             });
//         }

//         req.user = {
//             id: user._id.toString(),
//             name: user.name,
//             email: user.email,
//             role: user.role || "user"
//         };

//         next();
//     } catch (error) {
//         if (error.name === "TokenExpiredError") {
//             return res.status(401).json({
//                 success: false,
//                 message: "Token expired. Please log in again."
//             });
//         }

//         if (error.name === "JsonWebTokenError") {
//             return res.status(401).json({
//                 success: false,
//                 message: "Invalid authentication token."
//             });
//         }

//         return res.status(error.statusCode || 500).json({
//             success: false,
//             message: error.statusCode ? error.message : "Authentication failed."
//         });
//     }
// };
