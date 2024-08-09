// static/js/resultDisplay.js


function displayOptionAdvice(advice) {
    const details = `
        <h3>AI Results:</h3>
        <p>Recommendation: ${advice.recommendation}</p>
        <p>Strike Price: ${advice.strikePrice}</p>
        <p>Max Premium: ${advice.maxPremium}</p>
        <p>Expiration: ${advice.expiration}</p>
        <p>Option Price: ${advice.optionPrice}</p>
    `;
    document.getElementById('optionAdvice').innerHTML = details;
}

function displayOptionSimulationResults(simulationResults) {
    let simulationDetails = `
        <h3>Simulation Results:</h3>
        <p>Initial Investment: $${simulationResults.initialInvestment.toFixed(2)}</p>
        <p>Final Value: $${simulationResults.finalValue.toFixed(2)}</p>
        <p>Total Return: $${(simulationResults.finalValue - simulationResults.initialInvestment).toFixed(2)}</p>
        <h3>Trade Details:</h3>
        <table border="1">
            <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Price</th>
                <th>Trade Units</th>
                <th>Holdings</th>
                <th>Value in Hand</th>
                <th>Decision Base</th>
            </tr>
    `;

    simulationResults.tradeDetails
        .filter(trade => trade.action !== "Hold")
        .forEach(trade => {
            const price = trade.price !== undefined ? `$${trade.price.toFixed(2)}` : 'N/A';
            simulationDetails += `
                <tr>
                    <td>${trade.date}</td>
                    <td>${trade.action}</td>
                    <td>${price}</td>
                    <td>${trade.units || 'N/A'}</td>
                    <td>${trade.holdings}</td>
                    <td>$${trade.cash.toFixed(2)}</td>
                    <td>${trade.decisionBase}</td>
                </tr>
            `;
        });

    simulationDetails += `</table>`;

    document.getElementById('optionSimulation').innerHTML = simulationDetails;
}

function displayStockSimulationResults(simulationResults) {
    const totalReturn = simulationResults.finalValue - simulationResults.initialInvestment;
    const returnRate = (totalReturn / simulationResults.initialInvestment) * 100;

    let simulationDetails = `
        <h3>Simulation Results:</h3>
        <table border="1" style="margin:auto; text-align:center;">
            <tr>
                <th>Initial Investment</th>
                <th>Final Value</th>
                <th>Total Return</th>
                <th>Return Rate</th>
            </tr>
            <tr>
                <td>$${simulationResults.initialInvestment.toFixed(2)}</td>
                <td>$${simulationResults.finalValue.toFixed(2)}</td>
                <td>${totalReturn < 0 ? `-$${Math.abs(totalReturn).toFixed(2)}` : `$${totalReturn.toFixed(2)}`}</td>
                <td>${returnRate.toFixed(2)}%</td>
            </tr>
        </table>
        <h3>Trade Details:</h3>
        <table border="1" style="margin:auto; text-align:center;">
            <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Price</th>
                <th>Trade Units</th>
                <th>Holdings</th>
                <th>Cash on Hand</th>
                <th>Total Value</th>
                <th>Technical Indicators Recommendation</th>
                <th>Total Score</th>
                <th>Transformer Recommendation</th>
            </tr>
    `;

    simulationResults.tradeDetails
        .filter(trade => trade.action !== "Hold")
        .forEach(trade => {
            if (trade.units !== 0) { // 忽略没有实际交易的记录
                const price = trade.price !== undefined ? `$${parseFloat(trade.price).toFixed(2)}` : 'N/A';
                const cashOnHand = trade.cash < 0 ? `-$${Math.abs(trade.cash).toFixed(2)}` : `$${trade.cash.toFixed(2)}`;
                const totalValue = trade.totalValue < 0 ? `-$${Math.abs(trade.totalValue).toFixed(2)}` : `$${trade.totalValue.toFixed(2)}`;
                
                simulationDetails += `
                    <tr>
                        <td>${trade.date}</td>
                        <td>${trade.action}</td>
                        <td>${price}</td>
                        <td>${trade.units || 'N/A'}</td>
                        <td>${trade.holdings}</td>
                        <td>${cashOnHand}</td>
                        <td>${totalValue}</td>
                        <td>${trade.decisionBase.technicalRecommendation}</td>
                        <td>${trade.decisionBase.totalScore}</td>
                        <td>${trade.decisionBase.transformerRecommendation}</td>
                    </tr>
                `;
            }
        });

    simulationDetails += `</table>`;

    document.getElementById('stockSimulation').innerHTML = simulationDetails;
}

function displayStockRecommendation(recommendations, overallRecommendation, totalScore, transformerRecommendation) {
    let recommendationDetails = `
    <h3 style="text-align:center;">Recommendations:</h3>
    <table border="1" style="width: 100%; text-align: center;">
        <tr>
            <th>Indicator</th>
            <th>Bollinger Bands</th>
            <th>MACD</th>
            <th>KDJ</th>
            <th>RSI</th>
            <th>MA</th>
            <th>ATR</th>
            <th>ADX</th>
            <th>Stochastic</th>
            <th>Overall</th>
            <th>Total Score</th>
            <th>Transformer Advice</th>
        </tr>
        <tr>
            <td><b>Recommendation</b></td>
            <td style="color:${getColor(recommendations.bollinger)};">${recommendations.bollinger}</td>
            <td style="color:${getColor(recommendations.macd)};">${recommendations.macd}</td>
            <td style="color:${getColor(recommendations.kdj)};">${recommendations.kdj}</td>
            <td style="color:${getColor(recommendations.rsi)};">${recommendations.rsi}</td>
            <td style="color:${getColor(recommendations.ma)};">${recommendations.ma}</td>
            <td style="color:${getColor(recommendations.atr)};">${recommendations.atr}</td>
            <td style="color:${getColor(recommendations.adx)};">${recommendations.adx}</td>
            <td style="color:${getColor(recommendations.stochastic)};">${recommendations.stochastic}</td>
            <td style="color:${getColor(overallRecommendation)};">${overallRecommendation}</td>
            <td>${totalScore}</td>
            <td style="color:${getColor(transformerRecommendation)};">${transformerRecommendation}</td>
        </tr>
    </table>
`;
    document.getElementById('stockRecommendation').innerHTML = recommendationDetails;
}

function getColor(recommendation) {
    switch (recommendation) {
        case 'Buy':
            return 'green';
        case 'Sell':
            return 'red';
        case 'Hold':
            return 'black';
        default:
            return 'black';
    }
}

window.displayOptionAdvice = displayOptionAdvice;
window.displayOptionSimulationResults = displayOptionSimulationResults;
window.displayStockSimulationResults = displayStockSimulationResults;
window.displayStockRecommendation = displayStockRecommendation;