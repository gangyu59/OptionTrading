const API_KEY = 'OSQ403SM4KEOHQSQ';

async function fetchStockData(symbol, startDate, endDate) {
//    console.log("Fetching stock data...");
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${API_KEY}&outputsize=full`;
    try {
        const response = await fetch(url);
        const data = await response.json();
//        console.log("Stock data response received:", data);

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

        const bollingerBands = await fetchBollingerBands(symbol, startDate, endDate);
        stockData.forEach((data, index) => {
            const band = bollingerBands.find(b => b.date === data.date);
            if (band) {
                data.upperBand = band.upperBand;
                data.lowerBand = band.lowerBand;
                data.middleBand = band.middleBand;
            }
        });

//        console.log("Parsed stock data with Bollinger Bands:", stockData.slice(0, 5)); // Print the first 5 data points for verification
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