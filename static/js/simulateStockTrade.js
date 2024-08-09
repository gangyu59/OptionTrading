async function strategy(data, cash, holdings, alpha, beta, gamma) {
    // 将当前数据封装为数组传递给各个技术指标推荐函数
    const recommendations = {
        bollinger: getBollingerBandsRecommendation([data]),
        macd: getMACDRecommendation([data]),
        kdj: getKDJRecommendation([data]),
        rsi: getRSIRecommendation([data]),
        ma: getMARecommendation([data]),
        atr: getATRRecommendation([data]),
        adx: getADXRecommendation([data]),
        stochastic: getStochasticRecommendation([data])
    };

    // 获取综合推荐
    const overall = getOverallRecommendation(recommendations);

    // 获取Transformer推荐
    const transformerRecommendation = 'Hold'; // 测试时直接设为 'Hold'
    
    // 打印每个技术指标的推荐
//    console.log(`Date: ${data.date}, Recommendations: ${JSON.stringify(recommendations)}, Overall: ${JSON.stringify(overall)}, Transformer: ${transformerRecommendation}`);
    
    // 计算综合推荐加权后得分
    let finalScore = overall.totalScore;
    if (overall.totalScore > gamma) {
        finalScore = 1;
    } else if (overall.totalScore < -gamma) {
        finalScore = -1;
    } else {
        finalScore = 0;
    }

    // 综合加权
    finalScore = alpha * finalScore + beta * (transformerRecommendation === 'Buy' ? 1 : (transformerRecommendation === 'Sell' ? -1 : 0));

    // 最终决策
    let action = 'Hold';
    if (finalScore > 0) {
        action = 'Buy';
    } else if (finalScore < 0) {
        action = 'Sell';
    }

//    console.log(`Strategy decision: ${action} at price ${data.close} on date ${data.date}`);
    
    return {
        action: action,
        price: data.close,
        date: data.date,
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

    try {
        const data = await fetchStockData(symbol, startDate, endDate);
//        console.log("Fetched stock data: ", data);
        
        if (!data || data.length === 0) {
            throw new Error('No data available for the given stock and date range.');
        }

        for (let i = 0; i < data.length; i++) {
            const currentData = data[i];
//            console.log(`Processing data for date: ${currentData.date}`);
            
            const { action, price, date, decisionBase } = await strategy(currentData, cash, holdings, alpha, beta, gamma);
//            console.log(`Strategy result: Action=${action}, Price=${price}, Date=${date}, DecisionBase=${JSON.stringify(decisionBase)}`);
            
            const { updatedCash, updatedHoldings, totalValue } = updateValue({ action, price }, cash, holdings, price);
//            console.log(`Updated values: Cash=${updatedCash}, Holdings=${updatedHoldings}, TotalValue=${totalValue}`);

            if (action !== 'Hold' && ((action === 'Buy' && Math.floor(cash / price) > 0) || (action === 'Sell' && holdings > 0))) {
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
        }

        const finalValue = cash + holdings * data[data.length - 1].close;
//        console.log(`Final value: ${finalValue}`);
        return { tradeDetails, initialInvestment: initialCash, finalValue };

    } catch (error) {
        console.error("Error during simulation:", error);
        document.getElementById('stockSimulation').innerText = 'Error during simulation. Please check the console for more details.';
        return { tradeDetails, initialInvestment: initialCash, finalValue: initialCash }; // 返回一个默认对象，以确保调用者的安全
    }
}

// 全局化函数
window.strategy = strategy;
window.updateValue = updateValue;
window.simulateStockTrade = simulateStockTrade;