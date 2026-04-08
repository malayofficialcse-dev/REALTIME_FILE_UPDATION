import jwt from "jsonwebtoken";

export const auth = (req) => {
    const token = req.headers.authorization || '';

    try {
        return jwt.verify(token,'SECRET');
    } catch (error) {
        return null;
    }
};