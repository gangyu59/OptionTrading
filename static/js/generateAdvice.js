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