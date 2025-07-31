const jwt = require("jsonwebtoken");
const axios = require('axios');

const authenticate = async (payload) => {
    return await axios.post(process.env.AUTH_MICROSERVICE_URL, payload);
}

const permissionGuard = (requiredPermissions) => {
    return (req, res, next) => {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.status(401).json({ message: 'Authorization header required' });
        }
        
        const token = authorizationHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: 'Bearer token required' });
        }

        jwt.verify(token, process.env.SECRET, (error, payload) => {
            if (error) {
                console.log(error);
                return res.status(401).json({ message: 'Invalid token' });
            }

            authenticate(payload).then(
                (_response) => {
                    console.log("user successfully authenticated");
                    console.log(payload);
                    
                    // Check permissions
                    const userPermissions = payload.permissions || [];
                    const hasGlobalPermission = userPermissions.includes('products-all');
                    const hasRequiredPermission = requiredPermissions.some(permission => 
                        userPermissions.includes(permission)
                    );

                    if (hasGlobalPermission || hasRequiredPermission) {
                        req.userPayload = payload;
                        next();
                    } else {
                        res.status(403).json({ message: 'Insufficient permissions' });
                    }
                }
            ).catch(
                (error) => {
                    console.log(error);
                    res.status(401).json({ message: 'Authentication failed' });
                }
            );
        });
    };
};

module.exports = permissionGuard;