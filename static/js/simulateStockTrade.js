// static/js/simulateStockTrade.js

async function transformerStrategy(symbol, currentDate, windowSize, type) {
    try {
        // 计算开始日期和结束日期
        const endDate = new Date(currentDate);
        const startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - windowSize);
        
        // 格式化日期为字符串
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        console.log(`Fetching Transformer recommendation for date range: ${formattedStartDate} to ${formattedEndDate}`);

        // 获取Transformer的推荐
        const transformerRecommendation = await getTransformerRecommendation(symbol, formattedStartDate, formattedEndDate, type);
        console.log("Transformer recommendation received:", transformerRecommendation);

        // 返回Transformer的推荐
        return transformerRecommendation;
    } catch (error) {
        console.error("Error during Transformer strategy:", error);
        return 'Hold'; // 如果Transformer出错，默认返回 'Hold'
    }
}

async function strategy(symbol, currentDate, cash, holdings, alpha, beta, gamma, windowSize, type) {
    // 获取当前日期的 transformer 推荐
//    const transformerRecommendation = await transformerStrategy(symbol, currentDate, windowSize, type);

		transformerRecommendation = 'Hold';
//    console.log("Date:", currentDate, " Transformer recommendation:", transformerRecommendation);

    // 获取技术指标的推荐
    const data = await fetchAllData(symbol, currentDate, currentDate, type);
    const recommendations = {
        bollinger: getBollingerBandsRecommendation([data[data.length - 1]]),
        macd: getMACDRecommendation([data[data.length - 1]]),
        kdj: getKDJRecommendation([data[data.length - 1]]),
        rsi: getRSIRecommendation([data[data.length - 1]]),
        ma: getMARecommendation([data[data.length - 1]]),
        atr: getATRRecommendation([data[data.length - 1]]),
        adx: getADXRecommendation([data[data.length - 1]]),
        stochastic: getStochasticRecommendation([data[data.length - 1]])
    };

    const overall = getOverallRecommendation(recommendations);

    // 计算综合推荐加权后得分
    let finalScore = overall.totalScore;
    if (overall.totalScore > gamma) {
        finalScore = 1;
    } else if (overall.totalScore < -gamma) {
        finalScore = -1;
    } else {
        finalScore = 0;
    }
		
		console.log("Date:", currentDate, "Technical recommendation:", overall, "Score:", overall.totalScore);

    // 综合加权
    finalScore = alpha * finalScore + beta * (transformerRecommendation === 'Buy' ? 1 : (transformerRecommendation === 'Sell' ? -1 : 0));

    // 最终决策
    let action = 'Hold';
    if (finalScore > 0) {
        action = 'Buy';
    } else if (finalScore < 0) {
        action = 'Sell';
    }

    return {
        action: action,
        price: data[data.length - 1].close,
        date: currentDate,
        decisionBase: {
            technicalRecommendation: overall.overallRecommendation,
            totalScore: overall.totalScore,
            transformerRecommendation: transformerRecommendation
        }
    };
}

function updateValue(trade, cash, holdings, stockPrice) {
    let updatedCash = cash;
    let updatedHoldings = holdings;

    if (trade.action === 'Buy') {
        const units = Math.floor(cash / stockPrice);
        if (units > 0) {
            updatedCash -= units * stockPrice;
            updatedHoldings += units;
        }
    } else if (trade.action === 'Sell' && holdings > 0) {
        updatedCash += holdings * stockPrice;
        updatedHoldings = 0;
    }

    const totalValue = updatedCash + updatedHoldings * stockPrice;
    
//    console.log(`Trade: ${JSON.stringify(trade)}, Updated Cash: ${updatedCash}, Updated Holdings: ${updatedHoldings}, Total Value: ${totalValue}`);

    return {
        updatedCash,
        updatedHoldings,
        totalValue
    };
}

async function simulateStockTrade(symbol, startDate, endDate, alpha, beta, gamma) {
    const initialCash = 10000;
    let cash = initialCash;
    let holdings = 0;
    const tradeDetails = [];
    const windowSize = 5;
    const type = 'stock';

    try {
        let currentDate = new Date(startDate);
        const endSimulationDate = new Date(endDate);

        while (currentDate <= endSimulationDate) {
            const nextTradingDate = findNextTradingDate(currentDate);
            const formattedCurrentDate = nextTradingDate.toISOString().split('T')[0];
            
            // 获取当前的交易决策
            const { action, price, date, decisionBase } = await strategy(symbol, formattedCurrentDate, cash, holdings, alpha, beta, gamma, windowSize, type);

            const { updatedCash, updatedHoldings, totalValue } = updateValue({ action, price }, cash, holdings, price);

            if (action !== 'Hold') {
                tradeDetails.push({
                    date: date,
                    action: action,
                    price: price,
                    units: action === 'Buy' ? Math.floor(cash / price) : holdings,
                    holdings: updatedHoldings,
                    cash: updatedCash,
                    totalValue: totalValue,
                    decisionBase: decisionBase
                });

                cash = updatedCash;
                holdings = updatedHoldings;
            }

            // 继续到下一个交易日
            currentDate = new Date(nextTradingDate);
            currentDate.setDate(currentDate.getDate() + 1);

            if (currentDate > endSimulationDate) {
                break;
            }
        }

        // 返回模拟结果
        const finalValue = cash + holdings * (tradeDetails.length > 0 ? tradeDetails[tradeDetails.length - 1].price : 0);
        return { tradeDetails, initialInvestment: initialCash, finalValue };

    } catch (error) {
        console.error("Error during simulation:", error);
        return null;  // 返回空结果以便在 simulateStock 中处理错误
    }
}

// 全局化函数
window.strategy = strategy;
window.transformerStrategy = transformerStrategy;
window.updateValue = updateValue;
window.simulateStockTrade = simulateStockTrade;