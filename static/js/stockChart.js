function renderTrendChart(stockData) {
    const ctx = document.getElementById('candle-chart').getContext('2d');
    const labels = stockData.map(data => data.date);
    const data = stockData.map(data => data.close);

    const chartData = {
        labels: labels,
        datasets: [{
            label: 'Stock Price',
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false,
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Date'
                    }
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
                label: 'MACD',
                data: macd,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
            },
            {
                label: 'Signal Line',
                data: signal,
                borderColor: 'rgba(192, 75, 75, 1)',
                borderWidth: 1,
                fill: false,
            },
            {
                label: 'Histogram',
                data: histogram,
                borderColor: 'rgba(75, 75, 192, 1)',
                borderWidth: 1,
                fill: false,
            }
        ]
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                x: {
                    display: true,
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
            },
            {
                label: 'D',
                data: d,
                borderColor: 'rgba(192, 75, 75, 1)',
                borderWidth: 1,
                fill: false,
            },
            {
                label: 'J',
                data: j,
                borderColor: 'rgba(75, 75, 192, 1)',
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
                    display: true,
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