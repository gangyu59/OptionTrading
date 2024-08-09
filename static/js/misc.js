function isHoliday(date) {
    const year = date.getFullYear();
    const holidays = [
        new Date(year, 0, 1), // New Year's Day (January 1)
        new Date(year, 0, thirdMonday(year, 0)), // Martin Luther King Jr. Day (Third Monday of January)
        new Date(year, 1, thirdMonday(year, 1)), // Presidents' Day (Third Monday of February)
        new Date(year, 6, 4), // Independence Day (July 4)
        new Date(year, 10, fourthThursday(year, 10)), // Thanksgiving Day (Fourth Thursday of November)
        new Date(year, 11, 25) // Christmas Day (December 25)
    ];

    // If the holiday falls on a weekend, it's observed on the closest weekday.
    return holidays.some(holiday => {
        if (holiday.getDay() === 6) { // Saturday holiday observed on Friday
            holiday.setDate(holiday.getDate() - 1);
        } else if (holiday.getDay() === 0) { // Sunday holiday observed on Monday
            holiday.setDate(holiday.getDate() + 1);
        }
        return date.getTime() === holiday.getTime();
    });
}

function thirdMonday(year, month) {
    const date = new Date(year, month, 1);
    const day = date.getDay();
    const diff = (day <= 1) ? (1 - day) : (8 - day); 
    return 15 + diff; // Third Monday will always be between 15th and 21st
}

function fourthThursday(year, month) {
    const date = new Date(year, month, 1);
    const day = date.getDay();
    const diff = (day <= 4) ? (4 - day) : (11 - day); 
    return 22 + diff; // Fourth Thursday will always be between 22nd and 28th
}

function findLastTradingDate(currentDate) {
    let lastTradingDate = new Date(currentDate);
    lastTradingDate.setDate(lastTradingDate.getDate() - 1); // Start checking from the previous day

    while (lastTradingDate.getDay() === 0 || lastTradingDate.getDay() === 6 || isHoliday(lastTradingDate)) {
        // Skip weekends and holidays
        lastTradingDate.setDate(lastTradingDate.getDate() - 1);
    }

    return lastTradingDate;
}

function findNextTradingDate(currentDate) {
    let nextTradingDate = new Date(currentDate);

    // 如果当前日期为交易日，则直接返回
    if (nextTradingDate.getDay() !== 0 && nextTradingDate.getDay() !== 6 && !isHoliday(nextTradingDate)) {
        return nextTradingDate;
    }

    // 否则寻找下一个交易日
    nextTradingDate.setDate(nextTradingDate.getDate() + 1);

    while (nextTradingDate.getDay() === 0 || nextTradingDate.getDay() === 6 || isHoliday(nextTradingDate)) {
        // Skip weekends and holidays
        nextTradingDate.setDate(nextTradingDate.getDate() + 1);
    }

    return nextTradingDate;
}

// 全局化函数
window.findNextTradingDate = findNextTradingDate;
window.findLastTradingDate = findLastTradingDate;