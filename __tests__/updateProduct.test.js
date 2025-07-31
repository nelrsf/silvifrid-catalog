const request = require('supertest');
const express = require('express');
const router = require('../controller/updateProducts');
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

describe('Update Product Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock implementation
        mockPermissionGuard.mockImplementation(() => jest.fn((req, res, next) => next()));
    });

    it('should update a product successfully', async () => {
        const app = createApp();
        const productId = '507f1f77bcf86cd799439011';
        const updateData = {
            nombre: 'Updated Product',
            precio: 19.99
        };
        const existingProduct = { _id: productId, nombre: 'Old Product', precio: 9.99 };
        const updatedProduct = { _id: productId, ...updateData };

        Product.findById.mockResolvedValue(existingProduct);
        Product.findByIdAndUpdate.mockResolvedValue(updatedProduct);

        const response = await request(app)
            .put(`/${productId}`)
            .send(updateData);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(updatedProduct);
        expect(Product.findById).toHaveBeenCalledWith(productId);
        expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
            productId, 
            updateData, 
            { new: true, runValidators: true }
        );
        expect(mockPermissionGuard).toHaveBeenCalledWith(['products-edit']);
    });

    it('should handle product not found', async () => {
        const app = createApp();
        const productId = '507f1f77bcf86cd799439011';
        Product.findById.mockResolvedValue(null);

        const response = await request(app)
            .put(`/${productId}`)
            .send({ nombre: 'Updated Product' });

        expect(response.statusCode).toBe(404);
        expect(response.body).toEqual({ message: 'Product not found' });
    });

    it('should handle invalid product ID format', async () => {
        const app = createApp();
        const invalidId = 'invalid-id';

        const response = await request(app)
            .put(`/${invalidId}`)
            .send({ nombre: 'Updated Product' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: 'Invalid product ID format' });
    });

    it('should handle validation errors', async () => {
        const app = createApp();
        const productId = '507f1f77bcf86cd799439011';
        const existingProduct = { _id: productId, nombre: 'Old Product' };
        const validationError = new Error('Validation failed');
        validationError.name = 'ValidationError';

        Product.findById.mockResolvedValue(existingProduct);
        Product.findByIdAndUpdate.mockRejectedValue(validationError);

        const response = await request(app)
            .put(`/${productId}`)
            .send({ precio: 'invalid-price' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual({ message: 'Validation failed' });
    });

    it('should handle server errors', async () => {
        const app = createApp();
        const productId = '507f1f77bcf86cd799439011';
        const existingProduct = { _id: productId, nombre: 'Old Product' };
        Product.findById.mockResolvedValue(existingProduct);
        Product.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .put(`/${productId}`)
            .send({ nombre: 'Updated Product' });

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
            .put(`/${productId}`)
            .send({ nombre: 'Updated Product' });

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({ message: 'Insufficient permissions' });
    });
});