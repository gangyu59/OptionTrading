document.getElementById('start-date').value = getLastMonthDate();
document.getElementById('end-date').value = getTodayDate();

async function fetchData() {
    console.log("Fetching data...");

    const symbol = document.getElementById('symbol').value;
    const startDate = document.getElementById('start-date').value || getLastMonthDate();
    const endDate = document.getElementById('end-date').value || getTodayDate();

    console.log(`Symbol: ${symbol}, Start Date: ${startDate}, End Date: ${endDate}`);

    if (!symbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    try {
        const stockData = await fetchStockData(symbol, startDate, endDate);
        console.log("Stock Data fetched:", stockData);

        const macdData = await fetchMACD(symbol, startDate, endDate);
        console.log("MACD Data fetched:", macdData);

        const kdjData = await fetchKDJ(symbol, startDate, endDate);
        console.log("KDJ Data fetched:", kdjData);

        renderTrendChart(stockData);
        renderMACDChart(macdData);
        renderKDJChart(kdjData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function getAdvice() {
    console.log("Getting advice...");

    const symbol = document.getElementById('symbol').value;
    if (!symbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const startDate = document.getElementById('start-date').value || getLastMonthDate();
    const endDate = document.getElementById('end-date').value || getTodayDate();

    try {
        const macdData = await fetchMACD(symbol, startDate, endDate);
        console.log("MACD Data for advice fetched:", macdData);

        const kdjData = await fetchKDJ(symbol, startDate, endDate);
        console.log("KDJ Data for advice fetched:", kdjData);

        const advice = generateAdvice(macdData, kdjData);
        console.log("Advice generated:", advice);

        document.getElementById('advice').innerHTML = `<p>${advice}</p>`;
    } catch (error) {
        console.error("Error getting advice:", error);
    }
}

function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getLastMonthDate() {
    const today = new Date();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
    return lastMonth.toISOString().split('T')[0];
}

window.fetchData = fetchData;
window.getAdvice = getAdvice;