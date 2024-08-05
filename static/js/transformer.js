// static/js/transformer.js

async function fetchTechnicalIndicators(symbol, startDate, endDate) {
    const stockData = await fetchStockData(symbol, startDate, endDate);
    const macdData = await fetchMACD(symbol, startDate, endDate);
    const kdjData = await fetchKDJ(symbol, startDate, endDate);
    const rsiData = await fetchRSI(symbol, startDate, endDate);
    const maData = await fetchMA(symbol, startDate, endDate);
    const atrData = await fetchATR(symbol, startDate, endDate);
    const adxData = await fetchADX(symbol, startDate, endDate);
    const stochasticData = await fetchStochastic(symbol, startDate, endDate);

    // 将所有数据合并到一个数组中
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
}

async function trainModel(data) {
    const inputs = data.map(d => [
        d.open, d.high, d.low, d.close, d.volume,
        d.macd, d.macdSignal, d.k, d.d, d.rsi,
        d.ma20, d.atr, d.adx, d.slowK, d.slowD
    ]);
    const labels = data.map(d => d.close);  // 您可以根据实际需要调整标签

    const inputTensor = tf.tensor2d(inputs);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [15], units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    await model.fit(inputTensor, labelTensor, {
        epochs: 50,
        callbacks: tfvis.show.fitCallbacks(
            { name: 'Training Performance' },
            ['loss'],
            { height: 200, callbacks: ['onEpochEnd'] }
        )
    });

    await model.save('localstorage://stock-prediction-model');
}

async function predictRecommendation(model, data) {
    const inputs = data.map(d => [
        d.open, d.high, d.low, d.close, d.volume,
        d.macd, d.macdSignal, d.k, d.d, d.rsi,
        d.ma20, d.atr, d.adx, d.slowK, d.slowD
    ]);
    const inputTensor = tf.tensor2d(inputs);
    const predictions = model.predict(inputTensor);

    const recommendation = predictions.arraySync().map((pred, index) => {
        const actualClose = data[index].close;
        if (pred > actualClose) {
            return 'Buy';
        } else if (pred < actualClose) {
            return 'Sell';
        } else {
            return 'Hold';
        }
    });

    return recommendation;
}

async function fetchDataAndTrainModel(symbol, startDate, endDate) {
    const data = await fetchTechnicalIndicators(symbol, startDate, endDate);
    await trainModel(data);
}

async function getTransformerRecommendation(symbol, startDate, endDate) {
    const data = await fetchTechnicalIndicators(symbol, startDate, endDate);
    const model = await tf.loadLayersModel('localstorage://stock-prediction-model');
    const recommendations = await predictRecommendation(model, data);
    return recommendations[recommendations.length - 1]; // 返回最新日期的推荐
}

window.getTransformerRecommendation = getTransformerRecommendation;