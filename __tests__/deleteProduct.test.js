const request = require('supertest');
const express = require('express');
const router = require('../controller/deleteProducts');
const Product = require('../model/product');

// Mock permissionGuard with proper Jest hoisting
jest.mock('../guards/permissionGuard', () => jest.fn(() => jest.fn((req, res, next) => next())));
const mockPermissionGuard = require('../guards/permissionGuard');

// Mock Product model
jest.mock('../model/product');

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/', router);
    return app;
};

describe('Delete Product Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset to default mock implementation
        mockPermissionGuard.mockImplementation(() => jest.fn((req, res, next) => next()));
    });

    it('should delete a product successfully', async () => {
        const app = createApp();
        const productId = '507f1f77bcf86cd799439011';
        const deletedProduct = { _id: productId, nombre: 'Test Product', precio: 9.99 };

        Product.findByIdAndDelete.mockResolvedValue(deletedProduct);

        const response = await request(app)
            .delete(`/${productId}`);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
        expect(Product.findByIdAndDelete).toHaveBeenCalledWith(productId);
        expect(mockPermissionGuard).toHaveBeenCalledWith(['products-delete']);
    });

    it('should handle product not found', async () => {
        const app = createApp();
        const productId = '507f1f77bcf86cd799439011';
        Product.findByIdAndDelete.mockResolvedValue(null);

        const response = await request(app)
            .delete(`/${productId}`);

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'Product not found' });
    });

    it('should handle invalid product ID format', async () => {
        const app = createApp();
        const invalidId = 'invalid-id';

        const response = await request(app)
            .delete(`/${invalidId}`);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid product ID format' });
    });

    it('should handle server errors', async () => {
        const app = createApp();
        const productId = '507f1f77bcf86cd799439011';
        Product.findByIdAndDelete.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .delete(`/${productId}`);

        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ message: 'Internal server error' });
    });

    it('should reject requests without proper permissions', async () => {
        mockPermissionGuard.mockImplementation(() => jest.fn((req, res, next) => {
            res.status(403).json({ message: 'Insufficient permissions' });
        }));
        
        const app = createApp();
        const productId = '507f1f77bcf86cd799439011';

        const response = await request(app)
            .delete(`/${productId}`);

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({ message: 'Insufficient permissions' });
    });
});