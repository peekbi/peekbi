// // predict.js
// const ss = require('simple-statistics');
// const regression = require('regression');

// function linearPrediction(df, xCol, yCol) {
//     const points = df[xCol].values.map((x, i) => [new Date(x).getTime(), df[yCol].values[i]]);
//     const result = regression.linear(points);
//     return result.points.map(([x, y]) => ({
//         timestamp: new Date(x).toISOString(),
//         predicted: y
//     }));
// }

// function movingAverage(data, windowSize = 3) {
//     const result = [];
//     for (let i = windowSize - 1; i < data.length; i++) {
//         const window = data.slice(i - windowSize + 1, i + 1);
//         result.push(ss.mean(window));
//     }
//     return result;
// }

// module.exports = { linearPrediction, movingAverage };
