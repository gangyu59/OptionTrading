async function generateAdvice(symbol, macdData, kdjData, stockData) {
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

    function calculateOptionDetails(type) {
        let strikePrice;
        if (type === 'call') {
            strikePrice = currentPrice + strikePriceOffset;
        } else {
            strikePrice = currentPrice - strikePriceOffset;
        }

        return {
            strikePrice: strikePrice,
            maxPremium: maxPremium,
            expiration: expirationDays,
            expirationDate: formattedExpirationDate,
            type: type
        };
    }

    if (macdHist > 0 && macdSignal > 0 && k > d) {
        const optionDetails = calculateOptionDetails('call');
        const optionData = await fetchOptionData(symbol, optionDetails.expirationDate, optionDetails.strikePrice, optionDetails.type);
        const optionPrice = optionData.length > 0 ? optionData[0].lastPrice : null;
        if (optionPrice !== null && optionPrice <= optionDetails.maxPremium) {
            return {
                recommendation: "Buy Call Option",
                strikePrice: optionDetails.strikePrice,
                maxPremium: optionDetails.maxPremium,
                expiration: optionDetails.expiration,
                optionPrice: optionPrice
            };
        }
    } else if (macdHist < 0 && macdSignal < 0 && k < d) {
        const optionDetails = calculateOptionDetails('put');
        const optionData = await fetchOptionData(symbol, optionDetails.expirationDate, optionDetails.strikePrice, optionDetails.type);
        const optionPrice = optionData.length > 0 ? optionData[0].lastPrice : null;
        if (optionPrice !== null && optionPrice <= optionDetails.maxPremium) {
            return {
                recommendation: "Buy Put Option",
                strikePrice: optionDetails.strikePrice,
                maxPremium: optionDetails.maxPremium,
                expiration: optionDetails.expiration,
                optionPrice: optionPrice
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