function getBollingerBandsRecommendation(stockData) {
    const latestData = stockData[stockData.length - 1];
    if (latestData.close > latestData.upperBand) {
        return 'Sell'; // 卖出
    } else if (latestData.close < latestData.lowerBand) {
        return 'Buy'; // 买入
    }
    return 'Hold'; // 持有
}

function getMACDRecommendation(macdData) {
    const latestData = macdData[macdData.length - 1];
    if (latestData.macd > latestData.signal) {
        return 'Buy'; // 买入
    } else if (latestData.macd < latestData.signal) {
        return 'Sell'; // 卖出
    }
    return 'Hold'; // 持有
}

function getKDJRecommendation(kdjData) {
    const latestData = kdjData[kdjData.length - 1];
    if (latestData.k > latestData.d) {
        return 'Buy'; // 买入
    } else if (latestData.k < latestData.d) {
        return 'Sell'; // 卖出
    }
    return 'Hold'; // 持有
}

function getRSIRecommendation(rsiData) {
    const latestData = rsiData[rsiData.length - 1];
    if (latestData.rsi > 70) {
        return 'Sell'; // 卖出
    } else if (latestData.rsi < 30) {
        return 'Buy'; // 买入
    }
    return 'Hold'; // 持有
}

function getMARecommendation(maData) {
    const latestData = maData[maData.length - 1];
    if (latestData.ma20 > latestData.ma50) {
        return 'Buy'; // 买入
    } else if (latestData.ma20 < latestData.ma50) {
        return 'Sell'; // 卖出
    }
    return 'Hold'; // 持有
}

function getATRRecommendation(atrData) {
    // ATR is typically used for setting stop-loss levels, not direct buy/sell signals
    return 'Hold'; // 中性
}

function getADXRecommendation(adxData) {
    const latestData = adxData[adxData.length - 1];
    if (latestData.adx > 25) {
        return 'Buy'; // 强趋势
    }
    return 'Hold'; // 持有
}

function getStochasticRecommendation(stochasticData) {
    const latestData = stochasticData[stochasticData.length - 1];
    if (latestData.slowK > 80) {
        return 'Sell'; // 卖出
    } else if (latestData.slowK < 20) {
        return 'Buy'; // 买入
    } else if (latestData.slowK > latestData.slowD) {
        return 'Buy'; // 买入
    } else if (latestData.slowK < latestData.slowD) {
        return 'Sell'; // 卖出
    }
    return 'Hold'; // 持有
}

function getOverallRecommendation(recommendations) {
    const scores = {
        'Buy': 1,
        'Hold': 0,
        'Sell': -1
    };

    let totalScore = 0;

    for (let key in recommendations) {
        totalScore += scores[recommendations[key]];
    }

    let overallRecommendation = 'Hold';
    if (totalScore > 0) {
        overallRecommendation = 'Buy';
    } else if (totalScore < 0) {
        overallRecommendation = 'Sell';
    }

    return {
        overallRecommendation,
        totalScore
    };
}