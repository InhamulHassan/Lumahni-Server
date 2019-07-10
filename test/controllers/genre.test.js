const app = require('../../app');
const request = require('supertest');

describe('Test the genre get path', () => {
    beforeAll(() => {
        jest.resetModules();
    });

    test('It should respond the GET method', () => {
        return request(app).get("/genre").then(response => {
            expect(response.statusCode).toBe(200)
        })
    });
});
