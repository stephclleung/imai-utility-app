const request = require('supertest');
const app = require('../app');
const UserAction = require('./user-action-model');

const uaRoute = request(app);
const testUser = "TEST123";

describe('Active HTTP verbs ', () => {
    let response;
    beforeAll(async (done) => {
        const deleted = await UserAction.findOneAndDelete({ userID: testUser })
        done();
    })

    beforeEach(async (done) => {
        response = await uaRoute
            .put(`/ua/${testUser}/action`)
            .query({ target: testUser })
            .send({ action: 100 });
        done();
    });

    afterAll(async (done) => {
        const deleted = await UserAction.findOneAndDelete({ userID: testUser })
        done();
    })

    describe('PUT/:target/action', () => {
        test('Should add a new user to database', async (done) => {
            expect(response.status).toBe(201);
            expect(response.body.message).toStrictEqual("Created")
            done();
        });

        test('Should retrieve if user already exists', async (done) => {

            const response = await uaRoute
                .put(`/ua/${testUser}/action`)
                .query({ target: testUser });

            expect(response.status).toBe(200);
            expect(response.body.message).toStrictEqual("Updated")
            done();
        })
    });

    describe('POST/:target/bet', () => {
        test("Should return 400 if user not found", async (done) => {
            let ghostUser = 'lala321'
            const response = await uaRoute
                .post(`/ua/${ghostUser}/bet`)
                .query({ target: ghostUser });

            expect(response.status).toBe(400);
            done();
        });

        test("Should make a bet", async (done) => {
            const response = await uaRoute
                .post(`/ua/${testUser}/bet`)
                .query({ target: testUser })

            expect(response.text).toBe("100")
            expect(response.status).toBe(200);
            done();
        })
    })
})

describe('Unauthorized verbs', () => {
    test('GET/ua/${testUser}/action should return 405', async (done) => {
        const response = await uaRoute
            .get(`/ua/${testUser}/action`)

        expect(response.status).toBe(405);
        done();
    })

    test('PATCH/ua/ should return 405', async (done) => {
        const response = await uaRoute
            .patch(`/ua/`)

        expect(response.status).toBe(405);
        done();
    })

    test('POST/ua/ should return 405', async (done) => {
        const response = await uaRoute
            .post(`/ua/`)

        expect(response.status).toBe(405);
        done();
    })

    test('DELETE/ua/ should return 405', async (done) => {
        const response = await uaRoute
            .delete(`/ua/`)

        expect(response.status).toBe(405);
        done();
    })
})