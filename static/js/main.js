document.getElementById('start-date').value = getLastMonthDate();
document.getElementById('end-date').value = getTodayDate();

async function fetchData() {
//    console.log("Fetching data...");

    const symbol = document.getElementById('symbol').value;
    const startDate = document.getElementById('start-date').value || getLastMonthDate();
    const endDate = document.getElementById('end-date').value || getTodayDate();

//    console.log(`Symbol: ${symbol}, Start Date: ${startDate}, End Date: ${endDate}`);

    if (!symbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    try {
        const stockData = await fetchStockData(symbol, startDate, endDate);
 //       console.log("Stock Data fetched:", stockData);

        const macdData = await fetchMACD(symbol, startDate, endDate);
//        console.log("MACD Data fetched:", macdData);

        const kdjData = await fetchKDJ(symbol, startDate, endDate);
//        console.log("KDJ Data fetched:", kdjData);

        renderTrendChart(stockData);
        renderMACDChart(macdData);
        renderKDJChart(kdjData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function getAdvice() {
//    console.log("Getting advice...");

    const symbol = document.getElementById('symbol').value;
    if (!symbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const startDate = document.getElementById('start-date').value || getLastMonthDate();
    const endDate = document.getElementById('end-date').value || getTodayDate();

    try {
        const macdData = await fetchMACD(symbol, startDate, endDate);
//        console.log("MACD Data:", macdData);
        
        const kdjData = await fetchKDJ(symbol, startDate, endDate);
//        console.log("KDJ Data:", kdjData);
        
        const stockData = await fetchStockData(symbol, startDate, endDate);
//        console.log("Stock Data:", stockData);
        
        const advice = await generateAdvice(symbol, macdData, kdjData, stockData);
//        console.log("Generated Advice:", advice);

        document.getElementById('advice').innerText = advice.recommendation;

        const details = `
            <p><strong>Recommendation:</strong> ${advice.recommendation}</p>
            <p><strong>Strike Price:</strong> ${advice.strikePrice}</p>
            <p><strong>Max Premium:</strong> ${advice.maxPremium}</p>
            <p><strong>Expiration:</strong> ${advice.expiration}</p>
            <p><strong>Option Price:</strong> ${advice.optionPrice}</p>
        `;
        document.getElementById('details').innerHTML = details;

    } catch (error) {
        console.error("Error getting advice:", error);
        document.getElementById('advice').innerText = 'Error generating advice. Please check the console for more details.';
        document.getElementById('details').innerHTML = '';
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