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

function setGlobalVariables(type) {
    symbol = document.getElementById(type + '-symbol').value;
    if (!symbol) {
        alert('Please enter a stock symbol.');
        return false;
    }

    startDate = document.getElementById(type + '-start-date').value || getLastMonthDate();
    endDate = document.getElementById(type + '-end-date').value || getTodayDate();
    return true;
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

function setDefault(type) {
    document.getElementById(type + '-symbol').value = 'NVDA';
    document.getElementById(type + '-start-date').value = getLastMonthDate();
    document.getElementById(type + '-end-date').value = getTodayDate();
}

document.addEventListener('DOMContentLoaded', (event) => {
    setDefault('stock');
    setDefault('option');
});

function showTab(tabName) {
    // 隐藏所有的tab内容
    document.getElementById('stock-trading').style.display = 'none';
    document.getElementById('option-trading').style.display = 'none';

    // 移除所有tab的活动状态
    document.getElementById('stock-trading-tab').classList.remove('active');
    document.getElementById('option-trading-tab').classList.remove('active');

    // 显示选中的tab内容并添加活动状态
    if (tabName === 'stock-trading') {
        document.getElementById('stock-trading').style.display = 'block';
        document.getElementById('stock-trading-tab').classList.add('active');
    } else if (tabName === 'option-trading') {
        document.getElementById('option-trading').style.display = 'block';
        document.getElementById('option-trading-tab').classList.add('active');
    }
}

// 默认显示stock-trading tab
document.addEventListener('DOMContentLoaded', (event) => {
    showTab('stock-trading');
});

async function fetchAllData(type) {
    if (!setGlobalVariables(type)) {
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

        return combinedData;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}

async function fetchData(type) {
    if (!setGlobalVariables(type)) {
        return;
    }
    // 显示对应tab的沙漏图标
    document.getElementById(type + '-hourglass').style.display = 'block';

    try {
        const data = await fetchAllData(type);
        allData = data;

        renderTrendChart(stockData, type);
        renderMACDChart(macdData, type);
        renderKDJChart(kdjData, type);
        renderVolumeChart(stockData, type); // 初始显示 volume 图表
        document.getElementById(type + '-dynamic-chart-container').addEventListener('touchstart', () => renderNextChart(type));
    } catch (error) {
        console.error("Error fetching data:", error);
    } finally {
        // 隐藏对应tab的沙漏图标
        document.getElementById(type + '-hourglass').style.display = 'none';
    }
}

function renderNextChart(type) {
    chartIndex = (chartIndex + 1) % charts.length;
    const currentChart = charts[chartIndex];

    const dynamicChartContainer = document.getElementById(type + '-dynamic-chart-container');
    dynamicChartContainer.innerHTML = ''; // 清空旧图表

    const newCanvas = document.createElement('canvas');
    newCanvas.id = type + '-dynamic-chart';
    dynamicChartContainer.appendChild(newCanvas);

    // 设置canvas的宽高
    newCanvas.style.width = '800px';
    newCanvas.style.height = '180px';
    newCanvas.width = 800;
    newCanvas.height = 180;

    const ctx = newCanvas.getContext('2d');

    switch (currentChart) {
        case 'volume':
            renderVolumeChart(stockData, type);
            break;
        case 'rsi':
            renderRSIChart(rsiData, type);
            break;
        case 'ma':
            renderMAChart(maData, type);
            break;
        case 'atr':
            renderATRChart(atrData, type);
            break;
        case 'adx':
            renderADXChart(adxData, type);
            break;
        case 'stochastic':
            renderStochasticChart(stochasticData, type);
            break;
    }
}

async function getAdvice() {
    if (!setGlobalVariables('option')) {
        return;
    }
    // 显示沙漏图标
    document.getElementById('option-hourglass').style.display = 'block';

    try {
        const data = await fetchAllData('option');
        const advice = await generateAdvice(symbol, macdData, kdjData, stockData);
        displayAdvice(advice); // 调用展示函数
    } catch (error) {
        console.error("Error getting advice:", error);
        document.getElementById('advice').innerText = 'Error generating advice. Please check the console for more details.';
        document.getElementById('details').innerHTML = '';
    } finally {
        // 隐藏沙漏图标
        document.getElementById('option-hourglass').style.display = 'none';
    }
}

async function simulate() {
    if (!setGlobalVariables('option')) {
        return;
    }
    // 显示沙漏图标
    document.getElementById('option-hourglass').style.display = 'block';

    const initialInvestment = 10000;

    try {
        const data = await fetchAllData('option');
        const { tradeDetails, finalValue } = await simulateTrade(symbol, startDate, endDate, initialInvestment);
        displaySimulationResults({ tradeDetails, finalValue, initialInvestment }); // 调用展示函数
    } catch (error) {
        console.error("Error during simulation:", error.message);
        document.getElementById('simulation').innerText = 'Error during simulation. Please check the console for more details.';
    } finally {
        // 隐藏沙漏图标
        document.getElementById('option-hourglass').style.display = 'none';
    }
}

async function getRecommendation() {
    if (!setGlobalVariables('stock')) {
        return;
    }
    document.getElementById('stock-hourglass').style.display = 'block';

    try {
        const data = await fetchAllData('stock');

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
        const transformerRecommendation = await getTransformerRecommendation('stock');
        displayRecommendations(recommendations, overallRecommendation, totalScore, transformerRecommendation);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('recommendation').innerText = 'Error generating recommendations. Please check the console for more details.';
    } finally {
        document.getElementById('stock-hourglass').style.display = 'none';
    }
}

window.fetchData = fetchData;
window.setGlobalVariables = setGlobalVariables;
window.fetchAllData = fetchAllData;
window.getAdvice = getAdvice;
window.simulate = simulate;
window.getRecommendation = getRecommendation;
window.showTab = showTab;