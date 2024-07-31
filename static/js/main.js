// static/js/main.js

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

        // document.getElementById('advice').innerText = advice.recommendation;

        const details = `
						<h3>AI Results:</h3>
            <p>Recommendation: ${advice.recommendation}</p>
            <p>Strike Price: ${advice.strikePrice}</p>
            <p>Max Premium: ${advice.maxPremium}</p>
            <p>Expiration: ${advice.expiration}</p>
            <p>Option Price:${advice.optionPrice}</p>
        `;
        document.getElementById('details').innerHTML = details;

    } catch (error) {
        console.error("Error getting advice:", error);
        document.getElementById('advice').innerText = 'Error generating advice. Please check the console for more details.';
        document.getElementById('details').innerHTML = '';
    }
}

async function simulate() {
    const symbol = document.getElementById('symbol').value;
    if (!symbol) {
        alert('Please enter a stock symbol.');
        return;
    }

    const startDate = document.getElementById('start-date').value || getLastMonthDate();
    const endDate = document.getElementById('end-date').value || getTodayDate();
    const initialInvestment = 10000;

    try {
        const { tradeDetails, finalValue } = await simulateTrade(symbol, startDate, endDate, initialInvestment);

        let simulationDetails = `
            <h3>Simulation Results:</h3>
            <p>Initial Investment: $${initialInvestment.toFixed(2)}</p>
            <p>Final Value: $${finalValue.toFixed(2)}</p>
            <p>Total Return: $${(finalValue - initialInvestment).toFixed(2)}</p>
            <h3>Trade Details:</h3>
            <table border="1">
                <tr>
                    <th>Date</th>
                    <th>Action</th>
                    <th>Price</th>
                    <th>Trade Units</th>
                    <th>Holdings</th>
                    <th>Value in Hand</th>
                    <th>Decision Base</th>
                </tr>
        `;

        tradeDetails.forEach(trade => {
            const price = trade.price !== undefined ? `$${trade.price.toFixed(2)}` : 'N/A';
            simulationDetails += `
                <tr>
                    <td>${trade.date}</td>
                    <td>${trade.action}</td>
                    <td>${price}</td>
                    <td>${trade.units || 'N/A'}</td>
                    <td>${trade.holdings}</td>
                    <td>$${trade.cash.toFixed(2)}</td>
                    <td>${trade.decisionBase}</td>
                </tr>
            `;
        });

        simulationDetails += `</table>`;

        document.getElementById('simulation').innerHTML = simulationDetails;

    } catch (error) {
        console.error("Error during simulation:", error.message);
        document.getElementById('simulation').innerText = 'Error during simulation. Please check the console for more details.';
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
window.simulate = simulate;