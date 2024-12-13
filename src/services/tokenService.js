const jwt = require('jsonwebtoken');

const secretKey = 'your-secret-key';

const tokenService = {
    generateToken: (payload, expiresIn = '1h') => {
        return jwt.sign(payload, secretKey, { expiresIn });
    },

    verifyToken: (token) => {
        try {
            return jwt.verify(token, secretKey);
        } catch (error) {
            return null;
        }
    },

    decodeToken: (token) => {
        return jwt.decode(token);
    }
};

module.exports = tokenService;