import moment from 'moment';

function humanTimeDurationParse(time) {
    return moment.duration(time).asMilliseconds();
}
export default humanTimeDurationParse;