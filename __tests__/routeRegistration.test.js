const express = require("express");
const app = express();

// Mock the mongoose connection to avoid DB errors
jest.mock('mongoose', () => ({
    connect: jest.fn(),
    Schema: jest.fn(() => ({
        methods: {}
    })),
    model: jest.fn(() => ({})),
    Types: {
        ObjectId: {
            isValid: jest.fn(() => true)
        }
    }
}));

// Mock the Product model
jest.mock('../model/product', () => ({
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
}));

// Mock the permission guard  
jest.mock('../guards/permissionGuard', () => jest.fn(() => jest.fn((req, res, next) => next())));

// Mock axios for auth service
jest.mock('axios', () => ({
    post: jest.fn().mockResolvedValue({ data: { success: true } })
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
    verify: jest.fn((token, secret, callback) => {
        callback(null, { userId: 1, permissions: ['products-all'] });
    })
}));

// Test that all routes are properly registered
describe('Route Registration Test', () => {
    beforeAll(() => {
        // Set required environment variables
        process.env.SECRET = 'test-secret';
        process.env.AUTH_MICROSERVICE_URL = 'http://test.com';
        process.env.DB_CONNECTION = 'mongodb://test';
    });

    it('should register all routes without errors', () => {
        expect(() => {
            // This should load index.js and all its routes without throwing errors
            const indexPath = require.resolve('../index.js');
            delete require.cache[indexPath];
            
            // Delete cached modules to ensure fresh load
            Object.keys(require.cache).forEach(key => {
                if (key.includes('controller') || key.includes('guards')) {
                    delete require.cache[key];
                }
            });
            
            require('../index.js');
        }).not.toThrow();
    });
});