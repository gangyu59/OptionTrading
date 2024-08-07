function renderTrendChart(stockData, tabName) {
    const ctx = document.getElementById(`${tabName}-candle-chart`).getContext('2d');
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
    } catch (error) {
        console.error('Error rendering chart:', error);
    }
}

function renderMACDChart(macdData, tabName) {
    const ctx = document.getElementById(`${tabName}-macd-chart`).getContext('2d');
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

function renderKDJChart(kdjData, tabName) {
    const ctx = document.getElementById(`${tabName}-kdj-chart`).getContext('2d');
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

function renderRSIChart(rsiData, tabName) {
    const ctx = document.getElementById(`${tabName}-dynamic-chart`).getContext('2d');
    const labels = rsiData.map(data => data.date);
    const rsi = rsiData.map(data => data.rsi);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'RSI',
                data: rsi,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
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

function renderMAChart(maData, tabName) {
    const ctx = document.getElementById(`${tabName}-dynamic-chart`).getContext('2d');
    const labels = maData.map(data => data.date);
    const ma = maData.map(data => data.ma);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'MA',
                data: ma,
                borderColor: 'rgba(192, 75, 75, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
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

function renderATRChart(atrData, tabName) {
    const ctx = document.getElementById(`${tabName}-dynamic-chart`).getContext('2d');
    const labels = atrData.map(data => data.date);
    const atr = atrData.map(data => data.atr);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'ATR',
                data: atr,
                borderColor: 'rgba(75, 75, 192, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
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

function renderADXChart(adxData, tabName) {
    const ctx = document.getElementById(`${tabName}-dynamic-chart`).getContext('2d');
    const labels = adxData.map(data => data.date);
    const adx = adxData.map(data => data.adx);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'ADX',
                data: adx,
                borderColor: 'rgba(192, 192, 75, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
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

function renderStochasticChart(stochasticData, tabName) {
    const ctx = document.getElementById(`${tabName}-dynamic-chart`).getContext('2d');
    const labels = stochasticData.map(data => data.date);
    const slowK = stochasticData.map(data => data.slowK);
    const slowD = stochasticData.map(data => data.slowD);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'SlowK',
                data: slowK,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            },
            {
                label: 'SlowD',
                data: slowD,
                borderColor: 'rgba(192, 75, 75, 1)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
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

function renderVolumeChart(stockData, tabName) {
    const ctx = document.getElementById(`${tabName}-dynamic-chart`).getContext('2d');
    const labels = stockData.map(data => data.date);
    const volume = stockData.map(data => data.volume / 1000000); // 以百万为单位

    const chartData = {
        labels: labels,
        datasets: [
            {
                type: 'bar',
                label: 'Volume', // 在标签中注明
                data: volume,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };

    const chartOptions = {
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
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Volume (x million)' // 轴标签注明
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
                        return `Volume: ${context.raw}M`; // 提示框中显示以千为单位的值
                    }
                }
            }
        }
    };

    new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
}
