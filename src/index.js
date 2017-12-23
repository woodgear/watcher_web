import './style/main.css'
import TimeLine from './TimeLine'

function getData(start, end) {
    const rawData = [{
        actor: 'windows',
        data: [{
                startTime: "Sun Dec 10 2017 0:00:00 GMT+0800",
                endTime: "Sun Dec 10 2017 0:30:00 GMT+0800",
                action: {
                    executer: "chrome.exe",
                    tile: "ECharts Documentation - Google Chrome",
                },
            },
            {
                startTime: "Sun Dec 10 2017 0:30:00 GMT+0800",
                endTime: "Sun Dec 10 2017 01:00:00 GMT+0800",
                action: {
                    tile: "main.rs",
                    executer: "code.exe",
                }
            },
            {
                startTime: "Sun Dec 10 2017 01:00:00 GMT+0800",
                endTime: "Sun Dec 10 2017 02:00:00 GMT+0800",
                action: {
                    tile: "main.rs",
                    executer: "notepad.exe",
                }
            },
            {
                startTime: "Sun Dec 10 2017 03:00:00 GMT+0800",
                endTime: "Sun Dec 10 2017  10:00:00 GMT+0800",
                action: {
                    tile: "main.rs",
                    executer: "wireshark.exe",
                }
            },
        ]
    }]
    return rawData;
}

const leftTime = 'Sun Dec 10 2017 0:00:00 GMT+0800';
const rightTime = 'Sun Dec 10 2017 10:00:00 GMT+0800'

new TimeLine(720, 100)
    .setData(getData(leftTime, rightTime))
    .show()