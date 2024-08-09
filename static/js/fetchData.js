// static/js/fetchData.js

const API_KEY = 'OSQ403SM4KEOHQSQ';

async function fetchStockData(symbol, startDate, endDate) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${API_KEY}&outputsize=full`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.Information) {
            throw new Error(data.Information);
        }

        const timeSeries = data['Time Series (Daily)'];
        const stockData = Object.keys(timeSeries)
            .filter(date => date >= startDate && date <= endDate)
            .reverse() // Reverse the order to have the oldest date first
            .map(date => ({
                date,
                open: parseFloat(timeSeries[date]['1. open']),
                high: parseFloat(timeSeries[date]['2. high']),
                low: parseFloat(timeSeries[date]['3. low']),
                close: parseFloat(timeSeries[date]['4. close']),
                volume: parseInt(timeSeries[date]['6. volume'])
            }));

        const indicators = await Promise.all([
            fetchBollingerBands(symbol, startDate, endDate),
            fetchMACD(symbol, startDate, endDate),
            fetchKDJ(symbol, startDate, endDate),
            fetchRSI(symbol, startDate, endDate),
            fetchMA(symbol, startDate, endDate),
            fetchATR(symbol, startDate, endDate),
            fetchADX(symbol, startDate, endDate),
            fetchStochastic(symbol, startDate, endDate)
        ]);

        indicators.forEach(indicator => {
            stockData.forEach((data, index) => {
                const ind = indicator.find(i => i.date === data.date);
                if (ind) {
                    Object.assign(data, ind);
                }
            });
        });

        return stockData;
    } catch (error) {
        console.error("Error fetching stock data:", error);
        throw error;
    }
}

async function fetchBollingerBands(symbol, startDate, endDate) {
//    console.log("Fetching Bollinger Bands data...");
    const url = `https://www.alphavantage.co/query?function=BBANDS&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
  //      console.log("Bollinger Bands data response received:", data);

        if (data.Information) {
            throw new Error(data.Information);
        }

        const bollingerData = Object.keys(data['Technical Analysis: BBANDS'])
            .filter(date => date >= startDate && date <= endDate)
            .reverse() // Reverse the order to have the oldest date first
            .map(date => ({
                date,
                upperBand: parseFloat(data['Technical Analysis: BBANDS'][date]['Real Upper Band']),
                lowerBand: parseFloat(data['Technical Analysis: BBANDS'][date]['Real Lower Band']),
                middleBand: parseFloat(data['Technical Analysis: BBANDS'][date]['Real Middle Band'])
            }));

//        console.log("Parsed Bollinger Bands data:", bollingerData.slice(0, 5)); // Print the first 5 data points for verification
        return bollingerData;
    } catch (error) {
        console.error("Error fetching Bollinger Bands data:", error);
        throw error;
    }
}

async function fetchMACD(symbol, startDate, endDate) {
//    console.log("Fetching MACD data...");
    const url = `https://www.alphavantage.co/query?function=MACD&symbol=${symbol}&interval=daily&series_type=close&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
//        console.log("MACD data response received:", data);

        if (data.Information) {
            throw new Error(data.Information);
        }

        const macdData = Object.keys(data['Technical Analysis: MACD'])
            .filter(date => date >= startDate && date <= endDate)
            .reverse() // Reverse the order to have the oldest date first
            .map(date => ({
                date,
                macd: parseFloat(data['Technical Analysis: MACD'][date]['MACD']),
                signal: parseFloat(data['Technical Analysis: MACD'][date]['MACD_Signal']),
                histogram: parseFloat(data['Technical Analysis: MACD'][date]['MACD_Hist'])
            }));

//        console.log("Parsed MACD data:", macdData.slice(0, 5)); // Print the first 5 data points for verification
        return macdData;
    } catch (error) {
        console.error("Error fetching MACD data:", error);
        throw error;
    }
}

async function fetchKDJ(symbol, startDate, endDate) {
//    console.log("Fetching KDJ data...");
    const url = `https://www.alphavantage.co/query?function=STOCH&symbol=${symbol}&interval=daily&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
//        console.log("KDJ data response received:", data);

        if (data.Information) {
            throw new Error(data.Information);
        }

        const kdjData = Object.keys(data['Technical Analysis: STOCH'])
            .filter(date => date >= startDate && date <= endDate)
            .reverse() // Reverse the order to have the oldest date first
            .map(date => ({
                date,
                k: parseFloat(data['Technical Analysis: STOCH'][date]['SlowK']),
                d: parseFloat(data['Technical Analysis: STOCH'][date]['SlowD']),
                j: (3 * parseFloat(data['Technical Analysis: STOCH'][date]['SlowK'])) - (2 * parseFloat(data['Technical Analysis: STOCH'][date]['SlowD']))
            }));

 //       console.log("Parsed KDJ data:", kdjData.slice(0, 5)); // Print the first 5 data points for verification
        return kdjData;
    } catch (error) {
        console.error("Error fetching KDJ data:", error);
        throw error;
    }
}

async function fetchOptionData(symbol, expirationDate, strikePrice, optionType) {
    console.log("Fetching option price data...");
    const url = `https://www.alphavantage.co/query?function=OPTION_CHAIN&symbol=${symbol}&expiration_date=${expirationDate}&strike=${strikePrice}&option_type=${optionType}&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Option price data response received:", data);

        if (data.Information) {
            throw new Error(data.Information);
        }

        const optionData = data['optionChain'];
        const parsedOptionData = optionData.map(option => ({
            strike: parseFloat(option['strike']),
            lastPrice: parseFloat(option['last']),
            bid: parseFloat(option['bid']),
            ask: parseFloat(option['ask']),
            volume: parseInt(option['volume']),
            openInterest: parseInt(option['openInterest'])
        }));

        console.log("Parsed option data:", parsedOptionData.slice(0, 5)); // Print the first 5 data points for verification
        return parsedOptionData;
    } catch (error) {
        console.error("Error fetching option price data:", error);
        throw error;
    }
}

async function fetchRSI(symbol, startDate, endDate) {
    const url = `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.Information) {
            throw new Error(data.Information);
        }

        const rsiData = Object.keys(data['Technical Analysis: RSI'])
            .filter(date => date >= startDate && date <= endDate)
            .reverse() // Reverse the order to have the oldest date first
            .map(date => ({
                date,
                rsi: parseFloat(data['Technical Analysis: RSI'][date]['RSI'])
            }));

        return rsiData;
    } catch (error) {
        console.error("Error fetching RSI data:", error);
        throw error;
    }
}

async function fetchMA(symbol, startDate, endDate) {
    const url = `https://www.alphavantage.co/query?function=SMA&symbol=${symbol}&interval=daily&time_period=20&series_type=close&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.Information) {
            throw new Error(data.Information);
        }

        const maData = Object.keys(data['Technical Analysis: SMA'])
            .filter(date => date >= startDate && date <= endDate)
            .reverse() // Reverse the order to have the oldest date first
            .map(date => ({
                date,
                ma: parseFloat(data['Technical Analysis: SMA'][date]['SMA'])
            }));

        return maData;
    } catch (error) {
        console.error("Error fetching MA data:", error);
        throw error;
    }
}

async function fetchATR(symbol, startDate, endDate) {
    const url = `https://www.alphavantage.co/query?function=ATR&symbol=${symbol}&interval=daily&time_period=14&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.Information) {
            throw new Error(data.Information);
        }

        const atrData = Object.keys(data['Technical Analysis: ATR'])
            .filter(date => date >= startDate && date <= endDate)
            .reverse() // Reverse the order to have the oldest date first
            .map(date => ({
                date,
                atr: parseFloat(data['Technical Analysis: ATR'][date]['ATR'])
            }));

        return atrData;
    } catch (error) {
        console.error("Error fetching ATR data:", error);
        throw error;
    }
}

async function fetchADX(symbol, startDate, endDate) {
    const url = `https://www.alphavantage.co/query?function=ADX&symbol=${symbol}&interval=daily&time_period=14&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.Information) {
            throw new Error(data.Information);
        }

        const adxData = Object.keys(data['Technical Analysis: ADX'])
            .filter(date => date >= startDate && date <= endDate)
            .reverse() // Reverse the order to have the oldest date first
            .map(date => ({
                date,
                adx: parseFloat(data['Technical Analysis: ADX'][date]['ADX'])
            }));

        return adxData;
    } catch (error) {
        console.error("Error fetching ADX data:", error);
        throw error;
    }
}

async function fetchStochastic(symbol, startDate, endDate) {
    const url = `https://www.alphavantage.co/query?function=STOCH&symbol=${symbol}&interval=daily&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.Information) {
            throw new Error(data.Information);
        }

        const stochasticData = Object.keys(data['Technical Analysis: STOCH'])
            .filter(date => date >= startDate && date <= endDate)
            .reverse() // Reverse the order to have the oldest date first
            .map(date => ({
                date,
                slowK: parseFloat(data['Technical Analysis: STOCH'][date]['SlowK']),
                slowD: parseFloat(data['Technical Analysis: STOCH'][date]['SlowD'])
            }));

        return stochasticData;
    } catch (error) {
        console.error("Error fetching Stochastic data:", error);
        throw error;
    }
}

async function fetchAllData(symbol, startDate, endDate, type) {
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

// 全局化函数
window.fetchStockData = fetchStockData;
window.fetchBollingerBands = fetchBollingerBands;
window.fetchMACD = fetchMACD;
window.fetchKDJ = fetchKDJ;
window.fetchOptionData = fetchOptionData;
window.fetchRSI = fetchRSI;
window.fetchMA = fetchMA;
window.fetchATR = fetchATR;
window.fetchADX = fetchADX;
window.fetchStochastic = fetchStochastic;
window.fetchAllData = fetchAllData;
