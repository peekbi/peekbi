const dfd = require("danfojs-node");
const { groupByAndAggregate, correlation, trendAnalysis } = require("../helper");
const { safeSum, safeMean, safeMedian } = require("../utils/statsUtils");
const mlr = require("ml-regression").SimpleLinearRegression;
function getRetailInsights(df, match) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        hypothesis: [],
        totals: {},
        trends: [],
    };

    const cols = {
        quantity: ['qty', 'quantity', 'unitsold', 'soldquantity', 'orderquantity'],
        unitPrice: ['unitprice', 'unitcost', 'price', 'priceperunit', 'rate', 'costperitem'],
        sales: ['total', 'amount', 'sale', 'revenue', 'grosssale', 'netsale', 'invoicevalue', 'totalsale'],
        profit: ['profit', 'grossprofit', 'netprofit'],
        loss: ['loss', 'netloss'],
        cost: ['cost', 'totalcost', 'purchaseprice'],
        category: ['category', 'item', 'product', 'brand', 'segment'],
        region: ['region', 'area', 'zone', 'territory', 'location'],
        date: ['date', 'orderdate', 'timestamp', 'orderdatetime'],
    };

    const colMatch = (type) => match(cols[type]);

    const quantityCol = colMatch('quantity');
    const unitPriceCol = colMatch('unitPrice');
    const salesCol = colMatch('sales');
    const profitCol = colMatch('profit');
    const lossCol = colMatch('loss');
    const costCol = colMatch('cost');
    const categoryCol = colMatch('category');
    const regionCol = colMatch('region');
    const dateCol = colMatch('date');

    // Compute Sales if missing
    let salesColumnName = salesCol;
    if (!salesCol && quantityCol && unitPriceCol) {
        const qVals = df[quantityCol].values;
        const pVals = df[unitPriceCol].values;
        const computedSales = new Array(qVals.length);
        for (let i = 0; i < qVals.length; i++) {
            computedSales[i] = (parseFloat(qVals[i]) || 0) * (parseFloat(pVals[i]) || 0);
        }
        salesColumnName = "__computed_sales__";
        df.addColumn(salesColumnName, computedSales);
    }

    // Compute Profit if missing
    let profitColumnName = profitCol;
    if (!profitCol && salesColumnName && costCol) {
        const sVals = df[salesColumnName].values;
        const cVals = df[costCol].values;
        const computedProfit = new Array(sVals.length);
        for (let i = 0; i < sVals.length; i++) {
            computedProfit[i] = (parseFloat(sVals[i]) || 0) - (parseFloat(cVals[i]) || 0);
        }
        profitColumnName = "__computed_profit__";
        df.addColumn(profitColumnName, computedProfit);
    }

    // Compute Loss if missing
    let lossColumnName = lossCol;
    if (!lossCol && salesColumnName && profitColumnName && df.columns.includes(profitColumnName)) {
        const sVals = df[salesColumnName].values;
        const pVals = df[profitColumnName].values;
        const computedLoss = new Array(sVals.length);
        for (let i = 0; i < sVals.length; i++) {
            computedLoss[i] = (parseFloat(sVals[i]) || 0) - (parseFloat(pVals[i]) || 0);
        }
        lossColumnName = "__computed_loss__";
        df.addColumn(lossColumnName, computedLoss);
    }

    // Fast cleaning of numeric values
    const cleanVals = (vals) => {
        const result = [];
        for (let i = 0; i < vals.length; i++) {
            const v = typeof vals[i] === 'string' ? parseFloat(vals[i]) : vals[i];
            if (typeof v === 'number' && !isNaN(v)) result.push(v);
        }
        return result;
    };

    const salesVals = salesColumnName && df.columns.includes(salesColumnName) ? cleanVals(df[salesColumnName].values) : [];
    const profitVals = profitColumnName && df.columns.includes(profitColumnName) ? cleanVals(df[profitColumnName].values) : [];
    const lossVals = lossColumnName && df.columns.includes(lossColumnName) ? cleanVals(df[lossColumnName].values) : [];

    // KPIs
    insights.kpis = {
        total_sales: safeSum(salesVals),
        avg_sales: safeMean(salesVals),
        median_sales: safeMedian(salesVals),
        total_profit: safeSum(profitVals),
        total_loss: safeSum(lossVals),
    };

    // High / Low Performers by Category
    if (categoryCol && salesColumnName) {
        const grouped = groupByAndAggregate(df, categoryCol, salesColumnName, 'sum');
        if (grouped) {
            grouped.sortValues(salesColumnName, { ascending: false, inplace: true });
            const json = dfd.toJSON(grouped, { format: "row" });
            const jsonArr = Array.isArray(json) ? json : Object.values(json);
            insights.highPerformers = jsonArr.slice(0, 3);
            insights.lowPerformers = jsonArr.slice(-3);
            insights.totals.sales_by_category = jsonArr;
        }
    }

    // Hypothesis
    let hypothesisAdded = false;
    const totalProfit = insights.kpis.total_profit;
    const totalLoss = insights.kpis.total_loss;
    const totalSales = insights.kpis.total_sales;

    if (
        df.shape[0] < 10000 &&
        profitColumnName && lossColumnName &&
        df.columns.includes(profitColumnName) && df.columns.includes(lossColumnName)
    ) {
        const corr = correlation(df, profitColumnName, lossColumnName);
        insights.hypothesis.push(`📊 Correlation between profit and loss: ${corr.toFixed(2)}`);
        hypothesisAdded = true;
    }

    if (!hypothesisAdded && totalProfit && totalSales) {
        const margin = totalProfit / (totalSales || 1);
        insights.hypothesis.push(`💰 Average profit margin (estimated): ${(margin * 100).toFixed(2)}%`);
        hypothesisAdded = true;
    }

    if (!hypothesisAdded && totalProfit && totalLoss) {
        insights.hypothesis.push(`🧾 Estimated total loss (based on sales - profit): ₹${(totalLoss).toFixed(2)}`);
        hypothesisAdded = true;
    }

    if (!hypothesisAdded) {
        insights.hypothesis.push(`⚠️ Data incomplete — profit/loss/sales not directly found. Tried fallback logic.`);
    }

    // Sales by Region
    if (regionCol && salesColumnName) {
        const grouped = groupByAndAggregate(df, regionCol, salesColumnName, 'sum');
        if (grouped) {
            insights.totals.sales_by_region = dfd.toJSON(grouped, { format: "row" });
        }
    }

    // Sales Trend (only if dataset is manageable)
    if (dateCol && salesColumnName && df.shape[0] < 10000) {
        insights.trends = trendAnalysis(df, dateCol, salesColumnName);
    }
    // === Sales Forecast using Simple Linear Regression ===
    if (dateCol && salesColumnName && df.shape[0] >= 3) {
        try {
            const dfTime = df.loc({ columns: [dateCol, salesColumnName] }).dropNa();
            const sorted = dfTime.sortValues(dateCol);
            const x = Array.from({ length: sorted.shape[0] }, (_, i) => i); // time index
            const y = cleanVals(sorted[salesColumnName].values);

            if (x.length === y.length && x.length >= 3) {
                const reg = new mlr(x, y);
                const forecast = reg.predict(x.length); // predict for next time index

                insights.kpis.sales_forecast_next_period = forecast.toFixed(2);
                insights.hypothesis.push("🔮 Forecasted next period's sales using Simple Linear Regression.");
            }
        } catch (err) {
            insights.hypothesis.push("⚠️ Sales forecasting failed: " + err.message);
        }
    }

    return insights;
}

module.exports = { getRetailInsights };
