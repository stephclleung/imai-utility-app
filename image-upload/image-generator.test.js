const { decodeCardName, returnThisDamnImage } = require('./image-generator');
const fs = require('fs')

describe('Testing card name decode in multiples', () => {
    test('Should decode 0-3 to object', () => {
        expect(decodeCardName("0-3")).toEqual([{ rank: '0', type: '3' }])
    });

    test('Should decode 11-2 and 12-1 into an array', () => {
        expect(decodeCardName("11-2_12-1")).toEqual([{ rank: '11', type: '2' }, { rank: '12', type: '1' }])
    });

    test('Should not decode incorrect card name', () => {
        expect(decodeCardName("")).toEqual(null)
    });
})

describe('Testing card image generator', () => {
    test('Should generate image object for 0-0 and 10-1', (done) => {
        const twoCards = [
            { rank: 0, type: 0 },
            { rank: 10, type: 1 },
        ];

        returnThisDamnImage(twoCards)
            .then(imageBuffer => {
                expect(imageBuffer).not.toBeNull();
                expect(typeof imageBuffer).toBe("object")

                return imageBuffer;
            })
            .then(imageBuffer => {
                fs.readFile('output', (err, localImageBuffer) => {
                    if (err) throw err;
                    expect(imageBuffer).toEqual(localImageBuffer)

                })
            })
            .catch(e => console.log(e));
        done();
    });
})