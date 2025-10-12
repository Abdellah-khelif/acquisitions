import { jwttoken } from '#utils/jwt.js';
import logger from '#config/logger.js';
import { cookies } from '#utils/cookies.js';

const authMiddleware = (req, _res, next) => {
  try {
    let token = cookies.get(req, 'token');
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!token && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    if (token) {
      const payload = jwttoken.verify(token);
      if (payload && payload.id && payload.role) {
        req.user = { id: payload.id, email: payload.email, role: payload.role };
      }
    }
  } catch (e) {
    logger.warn(`Invalid or missing auth token for path ${req.path}`);
    // proceed as guest
  } finally {
    next();
  }
};

export default authMiddleware;