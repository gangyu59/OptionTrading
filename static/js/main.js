// static/js/main.js

let symbol;
let startDate;
let endDate;
let stockData;
let macdData;
let kdjData;
let rsiData;
let maData;
let atrData;
let adxData;
let stochasticData;

let chartIndex = 0;
const charts = ['volume', 'rsi', 'ma', 'atr', 'adx', 'stochastic'];
let allData;

function setGlobalVariables() {
    symbol = document.getElementById('symbol').value;
    if (!symbol) {
        alert('Please enter a stock symbol.');
        return false;
    }

    startDate = document.getElementById('start-date').value || getLastMonthDate();
    endDate = document.getElementById('end-date').value || getTodayDate();
    return true;
}

function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

function getLastMonthDate() {
    const today = new Date();
    const lastMonth = new Date(today.setMonth(today.getMonth() - 2));
    return lastMonth.toISOString().split('T')[0];
}

function setDefault() {
    document.getElementById('symbol').value = 'MSFT';
    document.getElementById('start-date').value = getLastMonthDate();
    document.getElementById('end-date').value = getTodayDate();
}

document.addEventListener('DOMContentLoaded', (event) => {
    setDefault();
});

async function fetchAllData() {
    if (!setGlobalVariables()) {
        return;
    }
    try {
        stockData = await fetchStockData(symbol, startDate, endDate);
        macdData = await fetchMACD(symbol, startDate, endDate);
        kdjData = await fetchKDJ(symbol, startDate, endDate);
        rsiData = await fetchRSI(symbol, startDate, endDate);
        maData = await fetchMA(symbol, startDate, endDate);
        atrData = await fetchATR(symbol, startDate, endDate);
        adxData = await fetchADX(symbol, startDate, endDate);
        stochasticData = await fetchStochastic(symbol, startDate, endDate);

        const combinedData = stockData.map((data, index) => ({
            ...data,
            macd: macdData[index] ? macdData[index].macd : null,
            macdSignal: macdData[index] ? macdData[index].signal : null,
            k: kdjData[index] ? kdjData[index].k : null,
            d: kdjData[index] ? kdjData[index].d : null,
            rsi: rsiData[index] ? rsiData[index].rsi : null,
            ma20: maData[index] ? maData[index].ma : null,
            atr: atrData[index] ? atrData[index].atr : null,
            adx: adxData[index] ? adxData[index].adx : null,
            slowK: stochasticData[index] ? stochasticData[index].slowK : null,
            slowD: stochasticData[index] ? stochasticData[index].slowD : null
        }));

//        console.log("Combined data fetched:", combinedData); // 调试信息
        return combinedData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function fetchData() {
    if (!setGlobalVariables()) {
        return;
    }

    try {
        const data = await fetchAllData();
        allData = data;

        renderTrendChart(stockData);
        renderMACDChart(macdData);
        renderKDJChart(kdjData);
        renderVolumeChart(stockData); // 初始显示 volume 图表
				document.getElementById('dynamic-chart-container').addEventListener('touchstart', renderNextChart);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function renderNextChart() {
    chartIndex = (chartIndex + 1) % charts.length;
    const currentChart = charts[chartIndex];

    const dynamicChartContainer = document.getElementById('dynamic-chart-container');
    dynamicChartContainer.innerHTML = ''; // 清空旧图表

    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'dynamic-chart';
    newCanvas.width = 800;
    newCanvas.height = 180;
  	dynamicChartContainer.appendChild(newCanvas);

    const ctx = newCanvas.getContext('2d');
//    console.log('Canvas context:', ctx); // 添加调试信息

    switch (currentChart) {
        case 'volume':
            renderVolumeChart(stockData);
            break;
        case 'rsi':
            renderRSIChart(rsiData);
            break;
        case 'ma':
            renderMAChart(maData);
            break;
        case 'atr':
            renderATRChart(atrData);
            break;
        case 'adx':
            renderADXChart(adxData);
            break;
        case 'stochastic':           renderStochasticChart(stochasticData);
            break;
    }
}

async function getAdvice() {
    if (!setGlobalVariables()) {
        return;
    }

    try {
        const data = await fetchAllData();

        const advice = await generateAdvice(symbol, macdData, kdjData, stockData);

        const details = `
            <h3>AI Results:</h3>
            <p>Recommendation: ${advice.recommendation}</p>
            <p>Strike Price: ${advice.strikePrice}</p>
            <p>Max Premium: ${advice.maxPremium}</p>
            <p>Expiration: ${advice.expiration}</p>
            <p>Option Price: ${advice.optionPrice}</p>
        `;
        document.getElementById('details').innerHTML = details;

    } catch (error) {
        console.error("Error getting advice:", error);
        document.getElementById('advice').innerText = 'Error generating advice. Please check the console for more details.';
        document.getElementById('details').innerHTML = '';
    }
}

async function simulate() {
    if (!setGlobalVariables()) {
        return;
    }

    const initialInvestment = 10000;

    try {
        const data = await fetchAllData();

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

        tradeDetails
            .filter(trade => trade.action !== "Hold")
            .forEach(trade => {
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

async function getRecommendation() {
    if (!setGlobalVariables()) {
        return;
    }

    try {
        const data = await fetchAllData();

        const recommendations = {
            bollinger: getBollingerBandsRecommendation(stockData),
            macd: getMACDRecommendation(macdData),
            kdj: getKDJRecommendation(kdjData),
            rsi: getRSIRecommendation(rsiData),
            ma: getMARecommendation(maData),
            atr: getATRRecommendation(atrData),
            adx: getADXRecommendation(adxData),
            stochastic: getStochasticRecommendation(stochasticData)
        };

        const { overallRecommendation, totalScore } = getOverallRecommendation(recommendations);

        // 调用Transformer模型获取推荐
        const transformerRecommendation = await getTransformerRecommendation(symbol, startDate, endDate);

        let recommendationDetails = `
            <h3>Recommendations:</h3>
            <table border="1">
                <tr>
                    <th>Indicator</th>
                    <th>Bollinger Bands</th>
                    <th>MACD</th>
                    <th>KDJ</th>
                    <th>RSI</th>
                    <th>MA</th>
                    <th>ATR</th>
                    <th>ADX</th>
                    <th>Stochastic</th>
                    <th>Overall</th>
                    <th>Total Score</th>
                    <th>Transformer Advice</th>
                </tr>
                <tr>
                    <td>Recommendation</td>
                    <td>${recommendations.bollinger}</td>
                    <td>${recommendations.macd}</td>
                    <td>${recommendations.kdj}</td>
                    <td>${recommendations.rsi}</td>
                    <td>${recommendations.ma}</td>
                    <td>${recommendations.atr}</td>
                    <td>${recommendations.adx}</td>
                    <td>${recommendations.stochastic}</td>
                    <td>${overallRecommendation}</td>
                    <td>${totalScore}</td>
                    <td>${transformerRecommendation}</td>
                </tr>
            </table>
        `;
        document.getElementById('recommendation').innerHTML = recommendationDetails;
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('recommendation').innerText = 'Error generating recommendations. Please check the console for more details.';
    }
}

window.fetchData = fetchData;
window.fetchAllData = fetchAllData;
window.getAdvice = getAdvice;
window.simulate = simulate;
window.getRecommendation = getRecommendation;