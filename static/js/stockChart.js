function renderTrendChart(stockData) {
    const ctx = document.getElementById('candle-chart').getContext('2d');
    const labels = stockData.map(data => data.date);
    const data = stockData.map(data => data.close);
    const upperBand = stockData.map(data => data.upperBand);
    const lowerBand = stockData.map(data => data.lowerBand);
    const middleBand = stockData.map(data => data.middleBand);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Stock Price',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
            },
            {
                label: 'Upper Band',
                data: upperBand,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false,
            },
            {
                label: 'Lower Band',
                data: lowerBand,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: false,
            },
            {
                label: 'Middle Band',
                data: middleBand,
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                fill: false,
            }
        ]
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true // 暂时保留X轴
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Price'
                    }
                }
            }
        }
    });
}

function renderMACDChart(macdData) {
    const ctx = document.getElementById('macd-chart').getContext('2d');
    const labels = macdData.map(data => data.date);
    const macd = macdData.map(data => data.macd);
    const signal = macdData.map(data => data.signal);
    const histogram = macdData.map(data => data.histogram);

    const chartData = {
        labels: labels,
        datasets: [
            {
                type: 'bar',
                label: 'MACD',
                data: histogram,
                backgroundColor: histogram.map(value => value >= 0 ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)'),
                borderColor: histogram.map(value => value >= 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)'),
                borderWidth: 1,
            },
            {
                type: 'line',
                label: 'DIF',
                data: macd,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0 // 不显示数据点
            },
            {
                type: 'line',
                label: 'DEA',
                data: signal,
                borderColor: 'rgba(192, 75, 75, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0 // 不显示数据点
            }
        ]
    };

    new Chart(ctx, {
        data: chartData,
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true // 暂时保留X轴
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
}

function renderKDJChart(kdjData) {
    const ctx = document.getElementById('kdj-chart').getContext('2d');
    const labels = kdjData.map(data => data.date);
    const k = kdjData.map(data => data.k);
    const d = kdjData.map(data => data.d);
    const j = kdjData.map(data => data.j);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'K',
                data: k,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0 // 不显示数据点
            },
            {
                label: 'D',
                data: d,
                borderColor: 'rgba(192, 75, 75, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0 // 不显示数据点
            },
            {
                label: 'J',
                data: j,
                borderColor: 'rgba(75, 75, 192, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0 // 不显示数据点
            }
        ]
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true, // 暂时保留X轴
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
}