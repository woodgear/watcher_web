import stringHash from 'string-hash';

class TimeLineColor {
    constructor() {
        this.colors = ['red', 'blue', 'yellow'];
    }
    getColor(name) {
        return this.colors[stringHash(name) % this.colors.length];
    }
}

export default TimeLineColor;