const request = require('supertest');
const express = require('express');
const router = require('../controller/createProducts');
const Product = require('../model/product');
const authGuard = require('./../guards/authGuard');

// Mock de authGuard
jest.mock('./../guards/authGuard', () => jest.fn((req, res, next) => next()));

// Mock de Product.create
jest.mock('../model/product');

const app = express();

app.use(express.json());
app.use('/', router);

describe('Product Controller', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new product successfully', async () => {
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
        expect(authGuard).toHaveBeenCalled();
    });

    it('should handle errors when creating a product', async () => {
        const mockError = new Error('Database error');
        Product.create.mockRejectedValue(mockError);

        const response = await request(app)
            .post('/')
            .send({});

        expect(response.statusCode).toBe(500); 
        expect(response.body).toEqual({ message: mockError.toString() });
    });

    it('should reject requests without proper authentication', async () => {
        authGuard.mockImplementation((req, res, next) => {
            res.status(401).json({ message: 'Unauthorized' });
        });

        const response = await request(app)
            .post('/')
            .send({});

        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual({ message: 'Unauthorized' });
    });
});