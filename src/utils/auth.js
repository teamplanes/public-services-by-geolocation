const jwt = require("jsonwebtoken");
const AppError = require("../lib/Error");

exports.register = async (req, res, next) => {
  try {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        salt: process.env.AUTH_JWT_SALT,
      },
      process.env.AUTH_JWT_SECRET
    );

    return res.status(200).json({
      status: "success",
      token,
    });
  } catch (error) {
    return next(
      new AppError(401, "unauthorized", "Please contact support or try later."),
      req,
      res,
      next
    );
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) check if the token is there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError(401, "unauthorized", "Please provide your API secret key"),
        req,
        res,
        next
      );
    }

    try {
      const decode = jwt.verify(token, process.env.AUTH_JWT_SECRET);
    } catch (error) {
      if (error.message === "jwt expired")
        return next(
          new AppError(
            401,
            "unauthorized",
            "The provided secret key has expired, please generate a new one."
          ),
          req,
          res,
          next
        );
    }

    next();
  } catch (err) {
    next(err);
  }
};
