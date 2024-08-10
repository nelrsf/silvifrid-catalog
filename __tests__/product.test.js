const mongoose = require('mongoose');
const ProductModel = require('../model/product');
require("dotenv/config");


describe('Product Model Test', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.DB_TEST_CONNECTION);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await ProductModel.deleteMany({});
  });

  it('should create & save product successfully', async () => {
    const validProduct = new ProductModel({
      nombre: 'Test Product',
      descripcion: 'This is a test product',
      categoria: 'Test Category',
      precio: 9.99,
      cantidad: 100
    });
    const savedProduct = await validProduct.save();
    
    expect(savedProduct._id).toBeDefined();
    expect(savedProduct.nombre).toBe(validProduct.nombre);
    expect(savedProduct.descripcion).toBe(validProduct.descripcion);
    expect(savedProduct.categoria).toBe(validProduct.categoria);
    expect(savedProduct.precio).toBe(validProduct.precio);
    expect(savedProduct.cantidad).toBe(validProduct.cantidad);
  });

  it('should fail to create product without required fields', async () => {
    const productWithoutRequiredField = new ProductModel({ nombre: 'Test Product' });
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
