import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import './style/tooltip.css'

import Color from './timeLineColor';
import { nest } from 'd3';

const tip = d3Tip()
    .direction('s')
    .attr('class', 'd3-tip').html(d => generateToolTip(d));

function generateToolTip(data) {
    return `<div class="tooltip">
        <span class="tooltiptext">${data.actor}<br>${data.action.executer}<br>${data.startTime}<br>${data.endTime}</span>
        </div>`
}

class TimeLine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.timeLabelDuration = 50; //interval per 50 px
        this.timelineMargin = [30, 30, 30, 30];
    }

    setData(rawData) {
        const data = rawData.map(report => {
            const actor = report.actor;
            return Object.assign({ actor }, this.formatData(report.data));
        });
        const max = data.reduce((max, current) => {
            if (current.maxDuration > max.maxDuration) {
                return current;
            }
            return max;
        });
        this.data = data;
        this.startTime = max.startTime;
        this.endTime = max.endTime;
        this.maxDuration = max.maxDuration;
        return this;
    }

    formatData(rawData) {
        function generateMetaInfo(data) {
            let startTime = new Date(data[0].startTime);
            let endTime = new Date(data[0].endTime);
            data.forEach(ele => {
                if (new Date(ele.startTime) < new Date(startTime)) {
                    startTime = new Date(ele.startTime);
                }
                if (new Date(ele.endTime) > new Date(endTime)) {
                    endTime = new Date(ele.endTime);
                }
            });
            const maxDuration = Math.floor((new Date(endTime) - new Date(startTime)) / 1000);
            return { startTime, endTime, maxDuration }
        }

        function tightTimeSequence(data) {
            const tightTimeSequence = [data[0]];
            data.slice(1).forEach(next => {
                const last = tightTimeSequence[tightTimeSequence.length - 1];
                if (new Date(last.endTime).getTime() != new Date(next.startTime).getTime()) {
                    tightTimeSequence.push({ startTime: last.endTime, endTime: next.startTime, action: { executer: 'empty' } })
                }
                tightTimeSequence.push(next)
            })
            return tightTimeSequence;
        }

        function generateAreaInfo(data) {
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
        const meta = generateMetaInfo(rawData);
        const data = generateAreaInfo(tightTimeSequence(rawData));
        return Object.assign(meta, { data });
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
        // todo
        // * the label of start time and end time

        const data = this.data[0];
        const svg = this.init();
        const tip = d3Tip()
            .direction('s')
            .attr('class', 'd3-tip')
            .html(d => generateToolTip(Object.assign(d, { actor: data.actor })));

        const height = this.height;
        const width = this.width;
        const timeLineContainer = svg.append("g")
            .attr("transform", `translate(0,0)`)
            .attr("class", "timeLineContainer")

        const timeLineXAxisScaler = d3.scaleTime()
            .domain([this.startTime, this.endTime])
            .range([0, width]);

        const temp = d3.axisBottom(timeLineXAxisScaler)
            .ticks((width / this.timeLabelDuration));

        const timeLineXAxis = timeLineContainer.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,0)`)
            .call(temp)
        const timeLineXAxisHeight = timeLineXAxis.node().getBBox().height;
        timeLineXAxis.attr("transform", `translate(0,${height-timeLineXAxisHeight})`);
        const timeBlockScaler = d3.scaleLinear()
            .domain([0, this.maxDuration])
            .range([0, width]);

        function getXPos(d, i) {
            return timeBlockScaler(d.base)
        }

        function getWidth(d) {
            return timeBlockScaler(d.duration)
        }
        const color = new Color({ empty: 'white' });
        const timeBlockHeight = 20;
        const timeBlockMarginBottom = 1;
        const timeBlockContainer = timeLineContainer
            .append('g')
            .attr('class', 'timeBlockContainer')
            .attr('transform', `translate(0,${(height-timeLineXAxisHeight-timeBlockHeight-timeBlockMarginBottom)})`);
        timeBlockContainer.call(tip);
        timeBlockContainer
            .selectAll('svg')
            .data(data.data)
            .enter()
            .append('rect')
            .attr('x', getXPos)
            .attr('width', getWidth)
            .attr('y', 0)
            .attr('height', timeBlockHeight)
            .style('fill', d => color.getColor(d.action.executer))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)

    }
}

export default TimeLine;