import parser from '../src/humanTime';
import expect from 'expect';

describe('humanTime', () => {
    it('should ok', () => {
        const ONESEC = 1000;
        const ONEM = ONESEC * 60;
        const ONEH = ONEM * 60;
        const ONED = ONEH * 24;

        expect(parser('PT5S')).toEqual(5 * ONESEC);
        expect(parser('PT5M')).toEqual(5 * ONEM);
        expect(parser('PT5H')).toEqual(5 * ONEH);
        expect(parser('P1D')).toEqual(1 * ONED);
    });
});