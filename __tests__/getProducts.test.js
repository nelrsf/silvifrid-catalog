const request = require('supertest');
const express = require('express');
const router = require('../controller/getProducts');
const Product = require('../model/product');
const { signProducts } = require("../guards/signProduct");

// Mocks
jest.mock('../model/product');
jest.mock('../guards/signProduct');

const app = express();
app.use(express.json());
app.use('/', router);

describe('Product Controller - GET routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should return all products', async () => {
            const mockProducts = [
                { _id: '1', name: 'Product 1' },
                { _id: '2', name: 'Product 2' },
            ];
            Product.find.mockResolvedValue(mockProducts);
            signProducts.mockImplementation((products) => products);

            const response = await request(app).get('/');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockProducts);
            expect(Product.find).toHaveBeenCalledWith({});
            expect(signProducts).toHaveBeenCalledWith(mockProducts);
        });

        it('should handle errors', async () => {
            const mockError = { error: 'Database error' };
            Product.find.mockRejectedValue(mockError);

            const response = await request(app).get('/');

            expect(response.statusCode).toBe(409);
            expect(response.body).toEqual({ message: mockError });
        });
    });

    describe('GET /:id', () => {
        it('should return a specific product', async () => {
            const mockProduct = { _id: 'd97f2345b8c6543290123456', name: 'Product 1' };
            Product.findById.mockResolvedValue(mockProduct);
            signProducts.mockImplementation((product) => product);

            const response = await request(app).get('/d97f2345b8c6543290123456');

            expect(response.statusCode).toBe(200);
            expect(response.body).toEqual(mockProduct);
            expect(Product.findById).toHaveBeenCalledWith('d97f2345b8c6543290123456');
            expect(signProducts).toHaveBeenCalledWith(mockProduct);
        });

        it('should handle invalid ID format', async () => {
            const response = await request(app).get('/invalidid');

            expect(response.statusCode).toBe(400);
            expect(response.body).toEqual({ message: 'Invalid product ID format' });
        });

        it('should handle non-existent product ID', async () => {
            const validNonExistentId = '507f1f77bcf86cd799439011';
            Product.findById.mockResolvedValue(null);

            const response = await request(app).get(`/${validNonExistentId}`);

            expect(response.statusCode).toBe(404);
            expect(response.body).toEqual({ message: 'Product not found' });
        });

        it('should handle errors', async () => {
            const validNonExistentId = '507f1f77bcf86cd799439011';
            const mockError = { error: "Internal Error" }
            Product.findById.mockRejectedValue(mockError);

            const response = await request(app).get(`/${validNonExistentId}`);

            expect(response.statusCode).toBe(500);
            expect(response.body).toEqual({ message: 'Internal server error' });
        });
    });
});