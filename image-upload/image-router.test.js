const request = require('supertest');
const app = require('../app');

const iuServer = request(app);
describe('POST /image', () => {
    it('should return 400 on invalid tokens', async (done) => {
        const response = await iuServer
            .post('/iu/image')
            .set('Authorization', '32123123');
        expect(response.status).toBe(400)
        done();
    })
})