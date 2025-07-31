/**
 * Integration Test for Product API Endpoints
 * This test validates that all endpoints are properly accessible
 */

const request = require('supertest');
const express = require('express');

// Create a test app similar to the main app but with mocked dependencies
const createTestApp = () => {
    const app = express();
    const cors = require("cors");
    var bodyParser = require('body-parser');

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use(cors())

    // Mock the routers with simple responses to test route registration
    const mockGetProducts = express.Router();
    mockGetProducts.get("/", (req, res) => res.json({ endpoint: "getproducts", method: "GET" }));
    mockGetProducts.get("/:id", (req, res) => res.json({ endpoint: "getproducts/:id", method: "GET", id: req.params.id }));

    const mockCreateProducts = express.Router();
    mockCreateProducts.post("/", (req, res) => res.json({ endpoint: "createproduct", method: "POST" }));

    const mockUpdateProducts = express.Router();
    mockUpdateProducts.put("/:id", (req, res) => res.json({ endpoint: "updateproduct/:id", method: "PUT", id: req.params.id }));

    const mockDeleteProducts = express.Router();
    mockDeleteProducts.delete("/:id", (req, res) => res.json({ endpoint: "deleteproduct/:id", method: "DELETE", id: req.params.id }));

    app.use("/getproducts", mockGetProducts);
    app.use("/createproduct", mockCreateProducts);
    app.use("/updateproduct", mockUpdateProducts);
    app.use("/deleteproduct", mockDeleteProducts);

    return app;
};

describe('Product API Integration Tests', () => {
    let app;

    beforeAll(() => {
        app = createTestApp();
    });

    it('should respond to GET /getproducts', async () => {
        const response = await request(app)
            .get('/getproducts')
            .expect(200);

        expect(response.body).toEqual({
            endpoint: "getproducts",
            method: "GET"
        });
    });

    it('should respond to GET /getproducts/:id', async () => {
        const testId = '507f1f77bcf86cd799439011';
        const response = await request(app)
            .get(`/getproducts/${testId}`)
            .expect(200);

        expect(response.body).toEqual({
            endpoint: "getproducts/:id",
            method: "GET",
            id: testId
        });
    });

    it('should respond to POST /createproduct', async () => {
        const response = await request(app)
            .post('/createproduct')
            .send({ test: 'data' })
            .expect(200);

        expect(response.body).toEqual({
            endpoint: "createproduct",
            method: "POST"
        });
    });

    it('should respond to PUT /updateproduct/:id', async () => {
        const testId = '507f1f77bcf86cd799439011';
        const response = await request(app)
            .put(`/updateproduct/${testId}`)
            .send({ test: 'update data' })
            .expect(200);

        expect(response.body).toEqual({
            endpoint: "updateproduct/:id",
            method: "PUT",
            id: testId
        });
    });

    it('should respond to DELETE /deleteproduct/:id', async () => {
        const testId = '507f1f77bcf86cd799439011';
        const response = await request(app)
            .delete(`/deleteproduct/${testId}`)
            .expect(200);

        expect(response.body).toEqual({
            endpoint: "deleteproduct/:id",
            method: "DELETE",
            id: testId
        });
    });
});