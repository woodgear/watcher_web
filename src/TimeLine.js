import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import './style/tooltip.css'

import Color from './timeLineColor';

const tip = d3Tip()
    .direction('s')
    .attr('class', 'd3-tip').html(d => generateToolTip(d));

function generateToolTip(data) {
    return `<div class="tooltip">
        <span class="tooltiptext">${data.name}<br>${data.startTime}<br>${data.endTime}</span>
        </div>`
}

class TimeLine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    setTime(start, end) {
        this.startTime = start;
        this.endTime = end;
        return this;
    }

    setData(rawData) {
        if (rawData.length == 0) { return }

        let startTime = rawData[0].startTime;
        let endTime = rawData[0].endTime;
        rawData.forEach(ele => {
            if (new Date(ele.startTime) < new Date(startTime)) {
                startTime = new Date(ele.startTime);
            }
            if (new Date(ele.endTime) > new Date(endTime)) {
                endTime = new Date(ele.endTime);
            }
        });
        this.data = this.formatData(rawData);
        this.startTime = startTime;
        this.endTime = endTime;
        this.maxDuration = Math.floor((new Date(this.endTime) - new Date(this.startTime)) / 1000);

        return this;
    }

    formatData(data) {
        const v_date = new Date();
        data.unshift({ base: 0, duration: 0, startTime: v_date, endTime: v_date });
        let leftBase = 0;
        let leftDuration = 0;
        return data.map((ele, index) => {
            const item = ele;
            item.base = leftBase + leftDuration;
            leftBase = item.base;
            item.duration = Math.floor((new Date(item.endTime) - new Date(item.startTime)) / 1000);
            leftDuration = item.duration
            return item
        }).slice(1)
    }
    init() {
        d3.select('body').append('svg');
        const svg = d3.select('svg');
        svg.attr('width', this.width);
        svg.attr('height', this.height);
        svg.attr('class', 'd3-timeline');
        svg.style('border', '1px solid');
        return svg;
    }
    show() {
        const svg = this.init();
        const data = this.data;

        const x = d3.scaleLinear()
            .domain([0, this.maxDuration])
            .range([0, this.width]);
        const tip = d3Tip()
            .direction('s')
            .attr('class', 'd3-tip').html(d => generateToolTip(d));
        const rects = svg.selectAll('svg')
            .data(data)
            .enter()
            .append('rect')

        const color = new Color();
        rects.call(tip)
        rects
            .attr('x', d => x(d.base))
            .attr('width', d => x(d.duration))
            .attr('height', this.height)
            .style('fill', d => color.getColor(d.name))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
    }
}

export default TimeLine;