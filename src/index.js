import './style/main.css'
import TimeLine from './TimeLine'

function getData(start, end) {
    const rawData = [{
            startTime: "Sun Dec 10 2017 18:47:46 GMT+0800",
            endTime: "Sun Dec 10 2017 18:57:46 GMT+0800",
            tile: "ECharts Documentation - Google Chrome",
            name: "chrome.exe",
        },
        {
            startTime: "Sun Dec 10 2017 18:57:46 GMT+0800",
            endTime: "Sun Dec 10 2017 18:59:58 GMT+0800",
            tile: "main.rs",
            name: "code.exe",
        },
        {
            startTime: "Sun Dec 10 2017 18:59:58 GMT+0800",
            endTime: "Sun Dec 10 2017 19:59:58 GMT+0800",
            tile: "main.rs",
            name: "wireshark.exe",
        },

    ]
    return rawData;
}

const leftTime = 'Sun Dec 10 2017 18:47:46 GMT+0800';
const rightTime = 'Sun Dec 10 2017 18:59:58 GMT+0800'

new TimeLine(720, 50)
    .setData(getData(leftTime, rightTime))
    .show()