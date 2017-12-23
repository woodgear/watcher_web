import stringHash from 'string-hash';

class TimeLineColor {
    constructor(specialColor) {
        this.specialColor = specialColor || {};
        this.defaultColors = ['#EE2C2C', '#993300', '#E0D873', '#98A148', '#C8F526', '#C5C1AA'];
    }
    getColor(name) {
        if (this.specialColor[name]) {
            return this.specialColor[name];
        }
        return this.defaultColors[stringHash(name) % this.defaultColors.length];
    }
}

export default TimeLineColor;