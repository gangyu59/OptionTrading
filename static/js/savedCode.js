const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY';

async function fetchStockData(symbol, startDate, endDate) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${API_KEY}&outputsize=full`;
    const response = await fetch(url);
    const data = await response.json();

    const timeSeries = data['Time Series (Daily)'];
    const stockData = Object.keys(timeSeries)
        .filter(date => date >= startDate && date <= endDate)
        .map(date => ({
            date,
            open: parseFloat(timeSeries[date]['1. open']),
            high: parseFloat(timeSeries[date]['2. high']),
            low: parseFloat(timeSeries[date]['3. low']),
            close: parseFloat(timeSeries[date]['4. close']),
            volume: parseInt(timeSeries[date]['6. volume'])
        }));
    return stockData;
}

async function fetchMACD(symbol) {
    const url = `https://www.alphavantage.co/query?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const macdData = data['Technical Analysis: MACD'];
    return macdData;
}

async function fetchKDJ(symbol) {
    const url = `https://www.alphavantage.co/query?function=STOCH&symbol=${symbol}&interval=daily&apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const kdjData = data['Technical Analysis: STOCH'];
    return kdjData;
}


#generateAdvice.js
function generateAdvice(macdData, kdjData) {
    const macdLabels = Object.keys(macdData);
    const kdjLabels = Object.keys(kdjData);
    const latestMACD = macdData[macdLabels[macdLabels.length - 1]];
    const latestKDJ = kdjData[kdjLabels[kdjLabels.length - 1]];

    const macdSignal = parseFloat(latestMACD['MACD_Signal']);
    const macdHist = parseFloat(latestMACD['MACD_Hist']);
    const k = parseFloat(latestKDJ['SlowK']);
    const d = parseFloat(latestKDJ['SlowD']);

    if (macdHist > 0 && macdSignal > 0 && k > d) {
        return "Recommendation: Buy Call Option";
    } else if (macdHist < 0 && macdSignal < 0 && k < d) {
        return "Recommendation: Buy Put Option";
    } else {
        return "Recommendation: Hold";
    }
}


function generateMockData(startDate, endDate) {
    const data = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const open = (Math.random() * 100 + 100).toFixed(2);
        const high = (parseFloat(open) + Math.random() * 10).toFixed(2);
        const low = (parseFloat(open) - Math.random() * 10).toFixed(2);
        const close = (Math.random() * (high - low) + parseFloat(low)).toFixed(2);
        const volume = (Math.random() * 1000 + 1000).toFixed(2);

        data.push({
            date: dateStr,
            open,
            high,
            low,
            close,
            volume
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
}

async function fetchStockData(symbol, startDate, endDate) {
    const stockData = generateMockData(startDate, endDate);
    return stockData;
}

async function fetchMACD(symbol) {
    const startDate = new Date();
    const data = [];
    for (let i = 0; i < 30; i++) {
        startDate.setDate(startDate.getDate() - 1);
        data.push({
            date: startDate.toISOString().split('T')[0],
            macd: (Math.random() * 2 - 1).toFixed(2),
            signal: (Math.random() * 2 - 1).toFixed(2),
            histogram: (Math.random() * 2 - 1).toFixed(2)
        });
    }
    return data;
}

async function fetchKDJ(symbol) {
    const startDate = new Date();
    const data = [];
    for (let i = 0; i < 30; i++) {
        startDate.setDate(startDate.getDate() - 1);
        data.push({
            date: startDate.toISOString().split('T')[0],
            k: (Math.random() * 100).toFixed(2),
            d: (Math.random() * 100).toFixed(2),
            j: (Math.random() * 100).toFixed(2)
        });
    }
    return data;
}

<canvas id="rsi-chart" width="800" height="180"></canvas>
		    <canvas id="ma-chart" width="800" height="180"></canvas>
		    <canvas id="atr-chart" width="800" height="180"></canvas>
		    <canvas id="adx-chart" width="800" height="180"></canvas>
		    <canvas id="stochastic-chart" width="800" height="180"></canvas>