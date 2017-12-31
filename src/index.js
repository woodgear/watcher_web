import './style/main.css'
import config from './config';
import TimeLine from './TimeLine'
import rp from 'request-promise';
import parseDuration from './humanTime';
import qs from 'querystring'

async function getData(left, right) {
    const url = `${config.serverHost}/api/v1/reporter/windows?${qs.stringify({left:left.toUTCString(),right:right.toUTCString()})}`;
    const option = {
        json: true,
        url: url,
        headers: {
            id: '{eb544d36-03a6-481a-9367-7010ddc9ef19}',
        }
    };
    const res = await rp.get(option);
    return res
}

async function show() {
    const data = await getData(leftTime, rightTime);
    new TimeLine(1000, 200)
        .setData(data)
        .show()
}

let leftTime = new Date(0);
let rightTime = new Date();

function setTimeRange(timeRange) {
    if (timeRange) {
        if (timeRange === "all") {
            leftTime = new Date(0);
            rightTime = new Date();
        } else {
            let duration = parseDuration(timeRange);
            if (duration != 0) {
                leftTime = new Date(new Date() - duration);
                rightTime = new Date(new Date());
            } else {
                console.error("could not parser this duaration please format as ISO_8601");
            }
        }
    }
    show()
}

show()

setInterval(async() => {
    show()
}, 1000 * 10);

const form = document.createElement("div");
const input = document.createElement("input");
const confirm = document.createElement("button");
confirm.innerHTML = 'current';
confirm.addEventListener('click', () => {
    const timeRange = input.value;
    setTimeRange(timeRange);
});
form.appendChild(input);
form.appendChild(confirm);
document.body.appendChild(form);