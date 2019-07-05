const { decodeCardName, returnThisDamnImage } = require('./image-generator');
const fs = require('fs')

describe('Testing card name decode in multiples', ()=>{
    test('Should decode 0-4 to object', ()=>{
        expect(decodeCardName("0-4")).toEqual([{rank : '0', type : '4'}])
    });
    
    test('Should decode 11-4 and 12-3 into an array', ()=>{
        expect(decodeCardName("11-4_12-3")).toEqual([{rank : '11', type : '4'}, {rank : '12', type : '3'}])
    });
    
    test('Should not decode incorrect card name', ()=>{
        expect(decodeCardName("")).toEqual(null)
    });
})

describe('Testing card image generator', async ()=>{
    test('Should generate image object for 0-0 and 10-1', async()=>{
        const twoCards = [
            { rank: 0, type: 0 },
            { rank: 10, type: 1 },
        ];

        const imageBuffer = await returnThisDamnImage(twoCards);
        expect(imageBuffer).not.toBeNull();
        expect(typeof imageBuffer).toBe("object")
        try {
            const localImageBuffer = await fs.read('output');
            expect(imageBuffer).toBe(localImageBuffer)
        } catch (error) {
            console.log(error)
        }
        
    });
})