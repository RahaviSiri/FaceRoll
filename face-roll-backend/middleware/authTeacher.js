import jwt from "jsonwebtoken";

const authTeacher = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Auth Header:", authHeader);

        // Check if Authorization header exists and starts with "Bearer"
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized, please login again" });
        }

        // Extract token from header
        const token = authHeader.split(" ")[1];

        // Verify token and decode payload
        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        // You can attach more details to `req.user` as needed
        req.user = { userName: decoded.userName };

        next(); // Allow access to next middleware/route
    } catch (error) {
        console.error("Auth error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid token, authorization failed" });
    }
};

export default authTeacher;
