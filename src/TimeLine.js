import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import './style/tooltip.css'

import Color from './timeLineColor';
import { nest } from 'd3';

const tip = d3Tip()
    .direction('s')
    .attr('class', 'd3-tip').html(d => generateToolTip(d));

function generateToolTip(data) {
    let msg = "";
    Object.entries(data.action).forEach(([key, value]) => {
        msg += `${value}<br>`
    });
    return `<div class="tooltip">
        <span class="tooltiptext">${msg}</span>
        </div>`
}

class TimeLine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.timeLabelDuration = 50; //time interval per 50 px
        this.padding = {
            left: 30,
            right: 30,
            top: 10,
            bottom: 0,
        };
        this.timeBlockHeight = 20;
        this.timeBlockMarginBottom = 1;
    }

    setData(rawData) {
        function checkData(rawData) {
            if (rawData.length == 0) {
                throw Error("could not get any actor")
            }
            if (rawData[0].data.length == 0) {
                throw Error(`could not get any time block data from actor ${rawData[0].actor}`)
            }
        }
        checkData(rawData);
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

        function formatRawData(data) {
            return data.map((item) => {
                const startTime = item.startTime;
                const endTime = item.endTime;
                delete item.startTime;
                delete item.endTime;
                const action = item;
                action.executer = action.name;
                return {
                    startTime: startTime,
                    endTime: endTime,
                    action
                }
            });
        }
        const formatdData = formatRawData(rawData);

        const meta = generateMetaInfo(formatdData);
        let data = generateAreaInfo(tightTimeSequence(formatdData));
        data = data.filter((x) => {
            return x.action.duration >= 0
        });

        return Object.assign(meta, { data });
    }

    init() {
        d3.select('.d3-timeline').remove();
        d3.select('body').append('svg');
        const svg = d3.select('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('class', 'd3-timeline')
            .style('border', '1px solid');
        return svg;
    }

    show() {
        const svg = this.init();
        const data = this.data[0];

        const height = this.height - this.padding.top - this.padding.bottom;
        const width = this.width - this.padding.left - this.padding.right;

        const timeLineContainer = svg
            .append('g')
            .attr('class', 'timelineContainer')
            .attr("transform", `translate(${this.padding.left}, ${this.padding.top})`)

        const timeLineXAxisScaler = d3.scaleTime()
            .domain([this.startTime, this.endTime])
            .range([0, width]);

        const temp = d3.axisBottom(timeLineXAxisScaler)
            .ticks((width / this.timeLabelDuration));

        const timeLineXAxis = timeLineContainer.append("g")
            .attr("class", "xaxis")
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

        const timeBlockContainer = timeLineContainer
            .append('g')
            .attr('class', 'timeBlockContainer');

        this.data.forEach((actor, index) => {
            const actorYPos = height - timeLineXAxisHeight - (this.timeBlockHeight + this.timeBlockMarginBottom) * (index + 1);
            const actorBlockContainer = timeBlockContainer
                .append('g')
                .attr('class', 'actorBlockContainer')
                .attr('transform', `translate(0,${actorYPos})`);

            const tip = d3Tip()
                .direction('s')
                .attr('class', 'd3-tip')
                .html(d => generateToolTip(Object.assign(d, { actor: actor.actor })));

            actorBlockContainer.call(tip);
            actorBlockContainer
                .selectAll('svg')
                .data(actor.data)
                .enter()
                .append('rect')
                .attr('x', getXPos)
                .attr('width', getWidth)
                .attr('y', 0)
                .attr('height', this.timeBlockHeight)
                .style('fill', d => color.getColor(d.action.executer))
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);
        });
        svg.exit().remove()
    }
}

export default TimeLine;