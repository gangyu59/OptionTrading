function renderTrendChart(stockData) {
    const ctx = document.getElementById('candle-chart').getContext('2d');
    const labels = stockData.map(data => data.date);
    const open = stockData.map(data => data.open);
    const high = stockData.map(data => data.high);
    const low = stockData.map(data => data.low);
    const close = stockData.map(data => data.close);
    const upperBand = stockData.map(data => data.upperBand);
    const lowerBand = stockData.map(data => data.lowerBand);
    const middleBand = stockData.map(data => data.middleBand);

    const candlestickData = stockData.map(data => ({
        t: data.date,
        o: data.open,
        h: data.high,
        l: data.low,
        c: data.close
    }));

    const chartData = {
        labels: labels,
        datasets: [
            {
								type: 'line',
                label: 'Upper Band',
                data: upperBand,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                fill: false,
								pointRadius: 0,
								tension: 0.4  // 使线条平滑
            },
            {
                type: 'line',
								label: 'Lower Band',
                data: lowerBand,
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                fill: false,
								pointRadius: 0,
								tension: 0.4  // 使线条平滑
            },
            {
                type: 'line',
								label: 'Middle Band',
                data: middleBand,
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                fill: false,
								pointRadius: 0,
								tension: 0.4  // 使线条平滑
            },
            {
                label: 'Candlestick Data',
                data: candlestickData,
                type: 'scatter',
                backgroundColor: context => {
                    const data = context.raw;
                    return data.c > data.o ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
                },
                borderColor: context => {
                    const data = context.raw;
                    return data.c > data.o ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)';
                },
                borderWidth: 1,
                pointRadius: 0,
                fill: false
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        scales: {
            x: {
            display: false, // 隐藏 x 轴
            type: 'category',
            title: {
                display: false,
            	}
        		},
            y: {
                beginAtZero: false,
                title: {
                    display: true,
                    text: 'Value'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const index = context.dataIndex;
                        const data = candlestickData[index];
                        return `Open: ${data.o}, High: ${data.h}, Low: ${data.l}, Close: ${data.c}`;
                    }
                }
            }
        }
    };

    try {
        const chartInstance = new Chart(ctx, {
            type: 'scatter',
            data: chartData,
            options: chartOptions,
            plugins: [{
                beforeDraw: function (chart) {
                    const ctx = chart.ctx;
                    candlestickData.forEach((data, i) => {
                        const x = chart.scales.x.getPixelForValue(labels[i]);
                        const o = chart.scales.y.getPixelForValue(data.o);
                        const h = chart.scales.y.getPixelForValue(data.h);
                        const l = chart.scales.y.getPixelForValue(data.l);
                        const c = chart.scales.y.getPixelForValue(data.c);

                        ctx.strokeStyle = data.c > data.o ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)';
                        ctx.fillStyle = data.c > data.o ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';

                        // Draw high-low line
                        ctx.beginPath();
                        ctx.moveTo(x, h);
                        ctx.lineTo(x, l);
                        ctx.stroke();

                        // Draw open-close rectangle
                        ctx.fillRect(x - 5, Math.min(o, c), 10, Math.abs(o - c));
                        ctx.strokeRect(x - 5, Math.min(o, c), 10, Math.abs(o - c));
                    });
                }
            }]
        });
//        console.log('Chart instance:', chartInstance);
//        console.log('Chart rendered successfully');
    } catch (error) {
        console.error('Error rendering chart:', error);
    }
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
                    display: false // 暂时保留X轴
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