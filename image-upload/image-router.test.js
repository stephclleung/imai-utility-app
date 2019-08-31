const request = require('supertest');
const app = require('../app');

const iuServer = request(app);
describe('POST /image', () => {
    it('should return 401 on invalid tokens', async (done) => {
        const response = await iuServer
            .post('/iu/image')
            .set('Authorization', 'Bearer 32123123');
        expect(response.status).toBe(401)
        done();
    })

    it('should return 400 on single card requests', async (done) => {
        const response = await iuServer
            .post('/iu/image')
            .send({
                "cardName": "0_4",
                "cards": [
                    {
                        "rank": "0",
                        "type": "4"

                    }
                ]
            })
            .set('Authorization', `Bearer ${process.env.IMAI_ACCESS_TOKEN}`);
        expect(response.status).toBe(400)
        done();
    })

    it('should return 400 on 5+ card requests', async (done) => {
        const response = await iuServer
            .post('/iu/image')
            .send({
                "cardName": "0-4_1-2_3-4_4-2_4-2_4-2",
                "cards": [
                    {
                        "rank": "0",
                        "type": "4"

                    },
                    {
                        "rank": "0",
                        "type": "4"

                    },
                    {
                        "rank": "0",
                        "type": "4"

                    },
                    {
                        "rank": "0",
                        "type": "4"

                    },
                    {
                        "rank": "0",
                        "type": "4"

                    },
                    {
                        "rank": "0",
                        "type": "4"

                    },
                ]
            })
            .set('Authorization', `Bearer ${process.env.IMAI_ACCESS_TOKEN}`);
        expect(response.status).toBe(400)
        done();
    })
})