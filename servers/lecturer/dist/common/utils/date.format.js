"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFormatDateTime = () => {
    const dateTime = (new Date().toLocaleString('en', { timeZone: 'Asia/Ho_Chi_Minh' })).split(', ');
    const date = dateTime[0].split('/');
    const [time, time12h] = dateTime[1].split(' ');
    const [month, day, year] = date;
    const [hour, minute,] = time.split(':');
    const formatDateTime = [day, month, year].join('/') + ' - ' + [hour, minute].join(':') + ' ' + time12h;
    return formatDateTime;
};
exports.default = getFormatDateTime;
