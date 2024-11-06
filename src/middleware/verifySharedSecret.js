import { SHARED_SECRET } from "../config/config.js";

const verifySharedSecret = (req, res, next) => {
    const { secret } = req.headers;

    if (!secret || secret !== SHARED_SECRET) {
        return res.status(401).json({
            error: "Unauthorized: Invalid shared secret",
        });
    }

    next();
};

export default verifySharedSecret;
