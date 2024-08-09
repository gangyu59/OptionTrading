// static/js/simulateOptionTrade.js

async function simulateOptionTrade(symbol, startDate, endDate, initialInvestment) {
    let cash = initialInvestment;
    let holdings = 0;
    const tradeDetails = [];

    try {
        const macdData = await fetchMACD(symbol, startDate, endDate);
        const kdjData = await fetchKDJ(symbol, startDate, endDate);
        const stockData = await fetchStockData(symbol, startDate, endDate);

        for (let i = 20; i < stockData.length; i++) { // Ensure sufficient data for indicators
            const currentDate = stockData[i].date;
            const subMacdData = macdData.slice(0, i + 1);
            const subKdjData = kdjData.slice(0, i + 1);
            const subStockData = stockData.slice(0, i + 1);

            const advice = await generateOptionAdvice(symbol, subMacdData, subKdjData, subStockData);

            if (advice.recommendation === "Buy Call Option" && cash >= advice.optionPrice) {
                const units = Math.floor(cash / advice.optionPrice);
                holdings += units;
                cash -= units * advice.optionPrice;
                tradeDetails.push({
                    date: currentDate,
                    action: "Buy Call Option",
                    price: advice.optionPrice,
                    units,
                    holdings,
                    cash,
                    decisionBase: "Buy Call Option based on MACD and KDJ indicators"
                });
            } else if (advice.recommendation === "Buy Put Option" && cash >= advice.optionPrice) {
                const units = Math.floor(cash / advice.optionPrice);
                holdings += units;
                cash -= units * advice.optionPrice;
                tradeDetails.push({
                    date: currentDate,
                    action: "Buy Put Option",
                    price: advice.optionPrice,
                    units,
                    holdings,
                    cash,
                    decisionBase: "Buy Put Option based on MACD and KDJ indicators"
                });
            } else {
                tradeDetails.push({
                    date: currentDate,
                    action: "Hold",
                    holdings,
                    cash,
                    decisionBase: "Market conditions not favorable"
                });
            }
        }

        // 卖出所有持有的期权
        const lastStockPrice = stockData[stockData.length - 1].close;
        const totalValue = cash + (holdings * lastStockPrice);
        tradeDetails.push({
            date: endDate,
            action: "Sell All Holdings",
            price: lastStockPrice,
            units: holdings,
            holdings: 0,
            cash: totalValue,
            decisionBase: "End of simulation, sell all holdings"
        });

        return { tradeDetails, finalValue: totalValue };
    } catch (error) {
        console.error("Error during simulation:", error.message);
        console.error(error.stack);
        throw error; // Re-throw the error after logging it
    }
}

// 确保函数被正确导出
window.simulateOptionTrade = simulateOptionTrade;