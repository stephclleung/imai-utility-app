const { decodeCardName } = require('./image-generator');


describe('Testing card name decode in multiples', ()=>{
    test('Decode card name 0-4', ()=>{
        expect(decodeCardName("0-4")).toEqual([{rank : '0', type : '4'}])
    });
    
    test('Decode card name 11-4', ()=>{
        expect(decodeCardName("11-4_12-3")).toEqual([{rank : '11', type : '4'}, {rank : '12', type : '3'}])
    });
    
    test('Decode incorrect card names', ()=>{
        expect(decodeCardName("")).toEqual(null)
    });
})