const dateFormattedET = function(){
    let timeNow = new Date();
    const monthNamesET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
    return timeNow.getDate() + ". " + monthNamesET[timeNow.getMonth()] + " " + timeNow.getFullYear();
}

const weekDayET = function(){
    let timeNow = new Date();
    const weekdayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"];
    return weekdayNamesEt[timeNow.getDay()];
}

const timeNowFormattedET = function(){
    let timeNow = new Date();
    return timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();
}

const usDateFormattedET = function(){
    let timeNow = new Date();
    let month = timeNow.getMonth() + 1;
    let day = timeNow.getDate();
    let year = timeNow.getFullYear();
    return month + "." + day + "." + year;
}


module.exports = {
    longDate: dateFormattedET,
    weekDay: weekDayET,
    time: timeNowFormattedET,
    usDate: usDateFormattedET
};
