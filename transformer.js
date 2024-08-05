// static/js/transformer.js

async function trainModel(data) {
    console.log("Training model with data:", data);

    const inputs = data.map(d => [
        d.open, d.high, d.low, d.close, d.volume,
        d.macd, d.macdSignal, d.k, d.d, d.rsi,
        d.ma20, d.atr, d.adx, d.slowK, d.slowD
    ]);
    console.log("Inputs for training:", inputs);

    const labels = data.map(d => d.close);  // 根据实际需要调整标签
    console.log("Labels for training:", labels);

    const inputTensor = tf.tensor2d(inputs);
    const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

    console.log("Tensor shapes - Inputs:", inputTensor.shape, "Labels:", labelTensor.shape);

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
        console.log("Model training completed");
    } catch (error) {
        console.error("Error during model training:", error);
    }

    try {
        await model.save('localstorage://stock-prediction-model');
        console.log("Model saved to localstorage");
    } catch (error) {
        console.error("Error saving model:", error);
    }
}

async function predictRecommendation(model, data) {
    console.log("Predicting with model and data:", data);

    const inputs = data.map(d => [
        d.open, d.high, d.low, d.close, d.volume,
        d.macd, d.macdSignal, d.k, d.d, d.rsi,
        d.ma20, d.atr, d.adx, d.slowK, d.slowD
    ]);
    const inputTensor = tf.tensor2d(inputs);
    console.log("Input tensor for prediction:", inputTensor);

    try {
        const predictions = model.predict(inputTensor);
        console.log("Predictions:", predictions);

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

        console.log("Recommendations:", recommendation);
        return recommendation;
    } catch (error) {
        console.error("Error during prediction:", error);
    }
}

async function fetchDataAndTrainModel() {
    console.log("Fetching data and training model...");
    try {
        const data = await fetchAllData();  // 使用参数传递
        console.log("Fetched data for training:", data);
        await trainModel(data);
    } catch (error) {
        console.error("Error fetching data and training model:", error);
    }
}

async function getTransformerRecommendation() {
    console.log("Getting transformer recommendation...");
    try {
        const data = await fetchAllData();  // 使用参数传递
        console.log("Fetched data for prediction:", data);

        // 检查模型是否存在于本地存储中
        let model;
        try {
            model = await tf.loadLayersModel('localstorage://stock-prediction-model');
            console.log("Model loaded from localstorage");
        } catch (error) {
            console.error("Error loading model, training a new one.", error);
            await fetchDataAndTrainModel();
            model = await tf.loadLayersModel('localstorage://stock-prediction-model');
            console.log("New model trained and loaded");
        }

        const recommendations = await predictRecommendation(model, data);
        console.log("Final recommendation:", recommendations[recommendations.length - 1]);
        return recommendations[recommendations.length - 1]; // 返回最新日期的推荐
    } catch (error) {
        console.error("Error getting transformer recommendation:", error);
    }
}

window.getTransformerRecommendation = getTransformerRecommendation;