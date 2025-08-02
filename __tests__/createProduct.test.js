const request = require('supertest');
const express = require('express');

// Mock permissionGuard BEFORE importing the router
jest.mock('../guards/permissionGuard', () => {
    const mockMiddleware = jest.fn((req, res, next) => next());
    const mockPermissionGuard = jest.fn(() => mockMiddleware);
    mockPermissionGuard.mockMiddleware = mockMiddleware;
    return mockPermissionGuard;
});

// Mock Product model
jest.mock('../model/product');

// NOW import the router after mocks are set up
const router = require('../controller/createProducts');
const Product = require('../model/product');
const mockPermissionGuard = require('../guards/permissionGuard');

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/', router);
    return app;
};

describe('Product Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock implementation - reset the middleware mock
        mockPermissionGuard.mockMiddleware.mockImplementation((req, res, next) => next());
    });

    it('should create a new product successfully', async () => {
        const app = createApp();
        const mockProduct = {
            nombre: 'Test Product',
            descripcion: 'This is a test product',
            categoria: 'Test Category',
            precio: 9.99,
            cantidad: 100
        };

        Product.create.mockResolvedValue(mockProduct);

        const response = await request(app)
            .post('/')
            .send(mockProduct);

        expect(response.statusCode).toBe(201);
        expect(response.text).toBe('Ok');
        expect(Product.create).toHaveBeenCalledWith(mockProduct);
        expect(mockPermissionGuard.mockMiddleware).toHaveBeenCalled();
    });

    it('should handle errors when creating a product', async () => {
        const app = createApp();
        const mockError = new Error('Database error');
        Product.create.mockRejectedValue(mockError);

        const response = await request(app)
            .post('/')
            .send({});

        expect(response.statusCode).toBe(500); 
        expect(response.body).toEqual({ message: mockError.toString() });
    });

    it('should reject requests without proper permissions', async () => {
        mockPermissionGuard.mockMiddleware.mockImplementation((req, res, next) => {
            res.status(403).json({ message: 'Insufficient permissions' });
        });

        const app = createApp();

        const response = await request(app)
            .post('/')
            .send({});

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({ message: 'Insufficient permissions' });
    });
});