const getFormatDateTime = (): string => {
    const dateTime = (new Date().toLocaleString('en', { timeZone: 'Asia/Ho_Chi_Minh' })).split(', ');
    const date = dateTime[0].split('/');
    const time = dateTime[1].split(':');

    const [month, day, year] = date;
    const [hour, minute,] = time;

    const formatDateTime = [day, month, year].join('/') + ' - ' + [hour, minute].join(':');
    
    return formatDateTime;
}

export default getFormatDateTime;