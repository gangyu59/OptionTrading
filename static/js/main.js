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

function getYesterdayDate() {
    const today = new Date();
    today.setDate(today.getDate() - 1);  // 将日期设为前一天
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
    document.getElementById(type + '-end-date').value = getYesterdayDate();
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

async function fetchData(type) {
    if (!setGlobalVariables(type)) {
        return;
    }
    // 显示对应tab的沙漏图标
    document.getElementById(type + '-hourglass').style.display = 'block';

    try {
        const data = await fetchAllData(symbol, startDate, endDate, type); // 使用 symbol, startDate, endDate 和 type
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

async function getOptionAdvice() {
    if (!setGlobalVariables('option')) {
        return;
    }
    // 显示沙漏图标
    document.getElementById('option-hourglass').style.display = 'block';

    try {
        const data = await fetchAllData('option');

        // 获取各项指标的推荐结果
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

        const advice = await generateOptionAdvice(symbol, macdData, kdjData, stockData, recommendations);
        displayOptionAdvice(advice); 
    } catch (error) {
        console.error("Error getting advice:", error);
        document.getElementById('optionAdvice').innerText = 'Error generating advice. Please check the console for more details.';
    } finally {
        // 隐藏沙漏图标
        document.getElementById('option-hourglass').style.display = 'none';
    }
}

async function simulateOption() {
    if (!setGlobalVariables('option')) {
        return;
    }
    // 显示沙漏图标
    document.getElementById('option-hourglass').style.display = 'block';

    const initialInvestment = 10000;

    try {
        const data = await fetchAllData('option');
        const { tradeDetails, finalValue } = await simulateOptionTrade(symbol, startDate, endDate, initialInvestment);
        displayOptionSimulationResults({ tradeDetails, finalValue, initialInvestment }); // 调用展示函数
    } catch (error) {
        console.error("Error during simulation:", error.message);
        document.getElementById('optionSimulation').innerText = 'Error during simulation. Please check the console for more details.';
    } finally {
        // 隐藏沙漏图标
        document.getElementById('option-hourglass').style.display = 'none';
    }
}

async function simulateStock() {
    if (!setGlobalVariables('stock')) {
        return;
    }
    // 显示沙漏图标
    document.getElementById('stock-hourglass').style.display = 'block';

    const initialInvestment = 10000;

    try {
        // 调用模拟交易函数，并接收结果
        const simulationResults = await simulateStockTrade(symbol, startDate, endDate, 1, 0, 1); // 设定 alpha, beta 和 gamma 的值

        // 这里 simulationResults 是从 simulateStockTrade 返回的数据，包含所有交易细节和最终结果
        if (simulationResults && simulationResults.tradeDetails.length > 0) {
            console.log("Simulation Results:", simulationResults);
            displayStockSimulationResults(simulationResults); // 调用展示函数
        } else {
            console.warn("Simulation returned no results.");
            document.getElementById('stockSimulation').innerText = 'Simulation returned no results.';
        }
    } catch (error) {
        console.error("Error during simulation:", error.message);
        document.getElementById('stockSimulation').innerText = 'Error during simulation. Please check the console for more details.';
    } finally {
        // 隐藏沙漏图标
        document.getElementById('stock-hourglass').style.display = 'none';
    }
}

async function getStockRecommendation() {
    if (!setGlobalVariables('stock')) {
        return;
    }
    document.getElementById('stock-hourglass').style.display = 'block';

    try {
        const symbol = document.getElementById('stock-symbol').value;
        const startDate = document.getElementById('stock-start-date').value;
        const endDate = document.getElementById('stock-end-date').value;

        // 调用 fetchAllData 获取数据
        const data = await fetchAllData(symbol, startDate, endDate, 'stock');

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
        const transformerRecommendation = await getTransformerRecommendation(symbol, startDate, endDate, 'stock');
        displayStockRecommendation(recommendations, overallRecommendation, totalScore, transformerRecommendation);
    } catch (error) {
        console.error("Error fetching data:", error);
        document.getElementById('stockRecommendation').innerText = 'Error generating recommendations. Please check the console for more details.';
    } finally {
        document.getElementById('stock-hourglass').style.display = 'none';
    }
}

window.fetchData = fetchData;
window.setGlobalVariables = setGlobalVariables;
window.getOptionAdvice = getOptionAdvice;
window.simulateOption = simulateOption;
window.getStockRecommendation = getStockRecommendation;
window.simulateStock = simulateStock;
window.showTab = showTab;