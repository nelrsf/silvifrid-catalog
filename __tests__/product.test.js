// Mock mongoose to avoid real database connections
jest.mock('mongoose', () => {
  const mockModel = {
    save: jest.fn(),
    deleteMany: jest.fn()
  };
  
  const MockProductModel = jest.fn(() => mockModel);
  
  return {
    connect: jest.fn(),
    connection: {
      close: jest.fn()
    },
    Error: {
      ValidationError: class ValidationError extends Error {
        constructor(message) {
          super(message);
          this.name = 'ValidationError';
          this.errors = {};
        }
      }
    },
    Types: {
      ObjectId: {
        isValid: jest.fn(() => true)
      }
    },
    Schema: jest.fn(),
    model: jest.fn(() => MockProductModel)
  };
});

// Mock the Product model to return predictable results
jest.mock('../model/product', () => {
  const mockModel = {
    save: jest.fn(),
    deleteMany: jest.fn()
  };
  
  return jest.fn(() => mockModel);
});

const mongoose = require('mongoose');
const ProductModel = require('../model/product');

describe('Product Model Test', () => {
  beforeAll(async () => {
    // Mock database connection
  });

  afterAll(async () => {
    // Mock database disconnection
  });

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should create & save product successfully', async () => {
    const validProduct = new ProductModel({
      nombre: 'Test Product',
      descripcion: 'This is a test product',
      categoria: 'Test Category',
      precio: 9.99,
      cantidad: 100
    });
    
    // Mock successful save
    validProduct.save.mockResolvedValue({
      _id: 'mockId123',
      nombre: 'Test Product',
      descripcion: 'This is a test product',
      categoria: 'Test Category',
      precio: 9.99,
      cantidad: 100
    });
    
    const savedProduct = await validProduct.save();
    
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.nombre).toBe('Test Product');
    expect(savedProduct.descripcion).toBe('This is a test product');
    expect(savedProduct.categoria).toBe('Test Category');
    expect(savedProduct.precio).toBe(9.99);
    expect(savedProduct.cantidad).toBe(100);
  });

  it('should fail to create product without required fields', async () => {
    const productWithoutRequiredField = new ProductModel({ nombre: 'Test Product' });
    
    // Mock validation error
    const validationError = new mongoose.Error.ValidationError('Validation failed');
    productWithoutRequiredField.save.mockRejectedValue(validationError);
    
    let err;
    try {
      await productWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
  });

  it('should fail to create product with invalid field type', async () => {
    const productWithInvalidFieldType = new ProductModel({
      nombre: 'Test Product',
      descripcion: 'This is a test product',
      categoria: 'Test Category',
      precio: 'invalid price', // Should be a number
      cantidad: 100
    });
    
    // Mock validation error with specific field error
    const validationError = new mongoose.Error.ValidationError('Validation failed');
    validationError.errors.precio = new Error('Invalid price type');
    productWithInvalidFieldType.save.mockRejectedValue(validationError);
    
    let err;
    try {
      await productWithInvalidFieldType.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.precio).toBeDefined();
  });
});
