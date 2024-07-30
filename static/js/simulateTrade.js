async function simulateTrade(symbol, startDate, endDate, initialInvestment) {
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

            const advice = await generateAdvice(symbol, subMacdData, subKdjData, subStockData);

            if (advice.recommendation === "Buy Call Option" && cash >= advice.optionPrice) {
                const units = Math.floor(cash / advice.optionPrice);
                holdings += units;
                cash -= units * advice.optionPrice;
                tradeDetails.push({ date: currentDate, action: "Buy Call Option", price: advice.optionPrice, holdings, cash });
            } else if (advice.recommendation === "Buy Put Option" && cash >= advice.optionPrice) {
                const units = Math.floor(cash / advice.optionPrice);
                holdings += units;
                cash -= units * advice.optionPrice;
                tradeDetails.push({ date: currentDate, action: "Buy Put Option", price: advice.optionPrice, holdings, cash });
            } else {
                tradeDetails.push({ date: currentDate, action: "Hold", holdings, cash });
            }
        }

        const finalValue = cash + (holdings * stockData[stockData.length - 1].close);
        return { tradeDetails, finalValue };
    } catch (error) {
        console.error("Error during simulation:", error.message);
        console.error(error.stack);
        throw error; // Re-throw the error after logging it
    }
}

// 确保函数被正确导出
window.simulateTrade = simulateTrade;