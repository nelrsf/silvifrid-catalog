const request = require('supertest');
const express = require('express');
const router = require('../controller/createProducts');
const Product = require('../model/product');

// Mock de permissionGuard with proper Jest hoisting
jest.mock('../guards/permissionGuard', () => jest.fn(() => jest.fn((req, res, next) => next())));
const mockPermissionGuard = require('../guards/permissionGuard');

// Mock de Product.create
jest.mock('../model/product');

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/', router);
    return app;
};

describe('Product Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Default mock implementation
        mockPermissionGuard.mockImplementation(() => jest.fn((req, res, next) => next()));
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
        expect(mockPermissionGuard).toHaveBeenCalledWith(['products-create']);
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
        mockPermissionGuard.mockImplementation(() => jest.fn((req, res, next) => {
            res.status(403).json({ message: 'Insufficient permissions' });
        }));

        const app = createApp();

        const response = await request(app)
            .post('/')
            .send({});

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({ message: 'Insufficient permissions' });
    });
});