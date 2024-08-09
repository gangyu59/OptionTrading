// static/js/generateOptionAdvice.js

function calculateHistoricalVolatility(stockData) {
    const logReturns = [];

    for (let i = 1; i < stockData.length; i++) {
        const currentPrice = stockData[i].close;
        const previousPrice = stockData[i - 1].close;
        const logReturn = Math.log(currentPrice / previousPrice);
        logReturns.push(logReturn);
    }

    const meanLogReturn = logReturns.reduce((sum, value) => sum + value, 0) / logReturns.length;
    const squaredDiffs = logReturns.map(value => Math.pow(value - meanLogReturn, 2));
    const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / (logReturns.length - 1);
    const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualize the volatility (252 trading days in a year)

    return volatility;
}

function blackScholes(S, K, T, r, sigma, optionType) {
    const d1 = (Math.log(S / K) + (r + Math.pow(sigma, 2) / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    const Nd1 = optionType === 'call' ? cumulativeNorm(d1) : cumulativeNorm(-d1);
    const Nd2 = optionType === 'call' ? cumulativeNorm(d2) : cumulativeNorm(-d2);
    const optionPrice = optionType === 'call' 
        ? S * Nd1 - K * Math.exp(-r * T) * Nd2 
        : K * Math.exp(-r * T) * Nd2 - S * Nd1;

    return optionPrice;
}

function cumulativeNorm(x) {
    const mean = 0.0;
    const stdDev = 1.0;
    return (1.0 + erf((x - mean) / (stdDev * Math.sqrt(2.0)))) / 2.0;
}

function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    // Constants
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    // A&S formula 7.1.26
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
}

async function generateOptionAdvice(symbol, macdData, kdjData, stockData, recommendations) {
    const latestMACD = macdData[macdData.length - 1];
    const latestKDJ = kdjData[kdjData.length - 1];
    const latestStock = stockData[stockData.length - 1];

    const macdSignal = latestMACD.signal;
    const macdHist = latestMACD.histogram;
    const k = latestKDJ.k;
    const d = latestKDJ.d;
    const currentPrice = latestStock.close;

    const strikePriceOffset = 5; // 假设执行价比当前价格上下浮动5
    const maxPremium = 5; // 假设最大允许支付的期权费为5
    const expirationDays = 30; // 假设期权到期时间为30天
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    const formattedExpirationDate = expirationDate.toISOString().split('T')[0];

    const volatility = calculateHistoricalVolatility(stockData);
    const riskFreeRate = 0.01; // 假设无风险利率为1%

    function calculateOptionDetails(type) {
        let strikePrice;
        if (type === 'call') {
            strikePrice = currentPrice + strikePriceOffset;
        } else {
            strikePrice = currentPrice - strikePriceOffset;
        }

        const optionPrice = blackScholes(currentPrice, strikePrice, expirationDays / 365, riskFreeRate, volatility, type);

        return {
            strikePrice: strikePrice,
            maxPremium: maxPremium,
            expiration: expirationDays,
            expirationDate: formattedExpirationDate,
            type: type,
            optionPrice: optionPrice
        };
    }

    function getOverallSignal(recommendations) {
        const scores = {
            'Buy': 1,
            'Hold': 0,
            'Sell': -1
        };

        let totalScore = 0;
        for (let key in recommendations) {
            totalScore += scores[recommendations[key]];
        }

        if (totalScore > 0) {
            return 'Buy';
        } else if (totalScore < 0) {
            return 'Sell';
        }
        return 'Hold';
    }

    const overallSignal = getOverallSignal(recommendations);

    if (overallSignal === 'Buy') {
        const optionDetails = calculateOptionDetails('call');
        if (optionDetails.optionPrice <= optionDetails.maxPremium) {
            return {
                recommendation: "Buy Call Option",
                strikePrice: optionDetails.strikePrice,
                maxPremium: optionDetails.maxPremium,
                expiration: optionDetails.expiration,
                optionPrice: optionDetails.optionPrice
            };
        }
    } else if (overallSignal === 'Sell') {
        const optionDetails = calculateOptionDetails('put');
        if (optionDetails.optionPrice <= optionDetails.maxPremium) {
            return {
                recommendation: "Buy Put Option",
                strikePrice: optionDetails.strikePrice,
                maxPremium: optionDetails.maxPremium,
                expiration: optionDetails.expiration,
                optionPrice: optionDetails.optionPrice
            };
        }
    }

    return {
        recommendation: "Hold",
        strikePrice: 'N/A',
        maxPremium: 'N/A',
        expiration: 'N/A',
        optionPrice: 'N/A'
    };
}

// 确保函数被正确导出
window.generateOptionAdvice = generateOptionAdvice;