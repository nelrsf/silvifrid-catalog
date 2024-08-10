const crypto = require('crypto');
const product = require('../model/product');

jest.mock('../model/product');

const { signProduct, signProducts } = require('../guards/signProduct'); // Replace with actual path
const { default: mongoose } = require('mongoose');

describe('Signature Functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('signProduct', () => {
        it('should sign a single product object', () => {
            const mockProduct = {
                _id: new mongoose.Types.ObjectId(),
                _doc: {
                    name: 'Test Product',
                    price: 10.99,
                }
            };

            product.mockReturnValue(mockProduct);

            const expectedSignature = crypto
                .createHash('sha256')
                .update(`${mockProduct._id}${process.env.SECRET}${mockProduct._doc.price}${mockProduct._doc.name}`)
                .digest('hex');

            signProduct(mockProduct);

            expect(mockProduct._doc.signature).toBe(expectedSignature);
        });

        it('should handle missing product properties', () => {
            const mockProduct = {};

            expect(() => signProduct(mockProduct)).toThrowError(
                'Product object requires _id, name, and price properties'
            );
        });
    });

    describe('signProducts', () => {
        it('should sign an array of product objects', () => {
            const mockProducts = [
                { _id: new mongoose.Types.ObjectId(), _doc: { name: 'P1', price: 5 } },
                { _id: new mongoose.Types.ObjectId(), _doc: { name: 'P2', price: 10 } },
            ];

            product.mockReturnValueOnce(mockProducts[0]);
            product.mockReturnValueOnce(mockProducts[1]);

            const expectedSignatures = mockProducts.map((product) => {
                const plainSignature = `${product._id}${process.env.SECRET}${product._doc.price}${product._doc.name}`;
                return crypto.createHash('sha256').update(plainSignature).digest('hex');
            });

            signProducts(mockProducts);

            expect(mockProducts[0]._doc.signature).toBe(expectedSignatures[0]);
            expect(mockProducts[1]._doc.signature).toBe(expectedSignatures[1]);
        });

        it('should handle an empty array', () => {
            expect(() => signProducts([])).not.toThrow();
        });


        it('should sign a single product object from signProducts func', () => {
            const mockProduct = {
                _id: new mongoose.Types.ObjectId(),
                _doc: {
                    name: 'Test Product',
                    price: 15.99,
                }
            };

            product.mockReturnValue(mockProduct);

            const expectedSignature = crypto
                .createHash('sha256')
                .update(`${mockProduct._id}${process.env.SECRET}${mockProduct._doc.price}${mockProduct._doc.name}`)
                .digest('hex');

            signProducts(mockProduct);

            expect(mockProduct._doc.signature).toBe(expectedSignature);
        });
    });
});
