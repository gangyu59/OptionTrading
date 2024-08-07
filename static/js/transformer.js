// static/js/transformer.js

async function trainModel(data) {
    const inputs = data.map(d => [
        d.open, d.high, d.low, d.close, d.volume,
        d.macd, d.macdSignal, d.k, d.d, d.rsi,
        d.ma20, d.atr, d.adx, d.slowK, d.slowD
    ]);

    const labels = data.map(d => d.close);  // 根据实际需要调整标签

    const inputTensor = tf.tensor2d(inputs);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    const model = tf.sequential();
    model.add(tf.layers.dense({ inputShape: [15], units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    try {
        await model.fit(inputTensor, labelTensor, {
            epochs: 50,
            callbacks: tfvis.show.fitCallbacks(
                { name: 'Training Performance' },
                ['loss'],
                { height: 200, callbacks: ['onEpochEnd'] }
            )
        });
    } catch (error) {
        console.error("Error during model training:", error);
    }

    try {
        await model.save('localstorage://stock-prediction-model');
    } catch (error) {
        console.error("Error saving model:", error);
    }
}

async function predictRecommendation(model, data) {
    const inputs = data.map(d => [
        d.open, d.high, d.low, d.close, d.volume,
        d.macd, d.macdSignal, d.k, d.d, d.rsi,
        d.ma20, d.atr, d.adx, d.slowK, d.slowD
    ]);
    const inputTensor = tf.tensor2d(inputs);

    try {
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
    } catch (error) {
        console.error("Error during prediction:", error);
    }
}

async function fetchDataAndTrainModel(type) {
    try {
        if (!setGlobalVariables(type)) {
            console.error("Global variables not set");
            return;
        }
        
        const data = await fetchAllData(type);
        if (data) {
            await trainModel(data);
        } else {
            console.error("No data available for training");
        }
    } catch (error) {
        console.error("Error fetching data and training model:", error);
    }
}

async function getTransformerRecommendation(type) {
    try {
        if (!setGlobalVariables(type)) {
            return;
        }

        const data = await fetchAllData(type);

        let model;
        try {
            model = await tf.loadLayersModel('localstorage://stock-prediction-model');
        } catch (error) {
            console.error("Error loading model, training a new one.", error);
            await fetchDataAndTrainModel(type);
            model = await tf.loadLayersModel('localstorage://stock-prediction-model');
        }

        if (data) {
            const recommendations = await predictRecommendation(model, data);
            return recommendations[recommendations.length - 1];
        } else {
            console.error("No data available for prediction");
            return null;
        }
    } catch (error) {
        console.error("Error getting transformer recommendation:", error);
    }
}

window.getTransformerRecommendation = getTransformerRecommendation;