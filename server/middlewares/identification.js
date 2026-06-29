import jwt from "jsonwebtoken";

export const identifier = (req, res, next) => {
  let token;

  // Check Authorization header first (for API calls from frontend)
  if (req.headers.authorization) {
    token = req.headers.authorization;
  } else if (req.headers.client === "not-browser") {
    token = req.headers.authorization;
  } else {
    token = req.cookies["Authorization"];
  }

  if (!token) {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  try {
    const userToken = token.split(" ")[1];
    const jwtVerified = jwt.verify(userToken, process.env.JWT_TOKEN_SECRET);
    if (jwtVerified) {
      req.user = jwtVerified;
      next();
    } else {
      throw new Error("Error in the token");
    }
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong!!" });
  }
};
