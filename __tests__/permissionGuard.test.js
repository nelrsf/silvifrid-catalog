const jwt = require('jsonwebtoken');
const axios = require('axios');
const permissionGuard = require('../guards/permissionGuard');

jest.mock('jsonwebtoken');
jest.mock('axios');

describe('Permission Guard', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            headers: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should reject requests without authorization header', async () => {
        const guard = permissionGuard(['products-edit']);
        
        guard(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header required' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests without bearer token', async () => {
        req.headers.authorization = 'Bearer';
        const guard = permissionGuard(['products-edit']);
        
        guard(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Bearer token required' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with invalid token', async () => {
        req.headers.authorization = 'Bearer invalid-token';
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null);
        });

        const guard = permissionGuard(['products-edit']);
        guard(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests when authentication service fails', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const payload = { userId: 1, permissions: ['products-edit'] };
        
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, payload);
        });
        axios.post.mockRejectedValue(new Error('Auth service error'));

        const guard = permissionGuard(['products-edit']);
        guard(req, res, next);

        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async operations

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Authentication failed' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests without required permissions', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const payload = { userId: 1, permissions: ['products-view'] };
        
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, payload);
        });
        axios.post.mockResolvedValue({ data: { success: true } });

        const guard = permissionGuard(['products-edit']);
        guard(req, res, next);

        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async operations

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should allow requests with required permissions', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const payload = { userId: 1, permissions: ['products-edit'] };
        
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, payload);
        });
        axios.post.mockResolvedValue({ data: { success: true } });

        const guard = permissionGuard(['products-edit']);
        guard(req, res, next);

        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async operations

        expect(req.userPayload).toEqual(payload);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow requests with global permissions', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const payload = { userId: 1, permissions: ['products-all'] };
        
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, payload);
        });
        axios.post.mockResolvedValue({ data: { success: true } });

        const guard = permissionGuard(['products-edit']);
        guard(req, res, next);

        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async operations

        expect(req.userPayload).toEqual(payload);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle multiple required permissions', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const payload = { userId: 1, permissions: ['products-delete'] };
        
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, payload);
        });
        axios.post.mockResolvedValue({ data: { success: true } });

        const guard = permissionGuard(['products-edit', 'products-delete']);
        guard(req, res, next);

        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async operations

        expect(req.userPayload).toEqual(payload);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle users without permissions property', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const payload = { userId: 1 }; // No permissions property
        
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, payload);
        });
        axios.post.mockResolvedValue({ data: { success: true } });

        const guard = permissionGuard(['products-edit']);
        guard(req, res, next);

        await new Promise(resolve => setTimeout(resolve, 0)); // Wait for async operations

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
        expect(next).not.toHaveBeenCalled();
    });
});