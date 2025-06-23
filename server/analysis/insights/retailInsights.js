const dfd = require("danfojs-node");
const { groupByAndAggregate, trendAnalysis } = require("../helper");
const { safeSum, safeMean, safeMedian } = require("../utils/statsUtils");
const { SimpleLinearRegression } = require("ml-regression");

function dfToRowObjects(df) {
    return df.values.map(row => {
        const obj = {};
        df.columns.forEach((col, idx) => {
            obj[col] = row[idx];
        });
        return obj;
    });
}

function getRetailInsights(df, match) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        totals: {},
        trends: {},
        hypothesis: [],
        customer: {},
        returns: {},
        inventory: {},
        promotions: {},
    };

    df.columns = df.columns.map(col => col.trim());
    const originalCols = [...df.columns];

    const rawCols = {
        quantity: ['qty', 'quantity', 'units sold', 'unitsold', 'sold quantity', 'soldquantity', 'order quantity', 'orderquantity'],
        unitPrice: ['unit price', 'unitprice', 'unit cost', 'unitcost', 'price', 'price per unit', 'rate', 'cost per item'],
        sales: ['total', 'amount', 'sale', 'revenue', 'gross sale', 'net sale', 'invoice value', 'total revenue'],
        profit: ['profit', 'gross profit', 'net profit', 'profit margin'],
        cost: ['cost', 'purchase cost', 'total cost', 'purchase price', 'cost per unit'],
        loss: ['loss', 'net loss'],
        category: ['category', 'product', 'item', 'brand', 'segment', 'product category'],
        region: ['region', 'area', 'zone', 'territory', 'location'],
        date: ['date', 'order date', 'timestamp'],
        customer: ['customer', 'customer id', 'client', 'user'],
        returnFlag: ['return', 'returned', 'is return', 'is_return', 'returned (y/n)'],
        promotionFlag: ['promo', 'discount', 'promotion', 'promotion applied (y/n)', 'is_discounted']
    };

    const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const safeMatch = possible => {
        const normalizedCols = df.columns.map(normalize);
        const colMap = Object.fromEntries(df.columns.map((col, i) => [normalizedCols[i], col]));
        for (const alias of possible) {
            const norm = normalize(alias);
            if (colMap[norm]) return colMap[norm];
        }
        return undefined;
    };
    const colMatch = type => safeMatch(rawCols[type]);

    const quantityCol = colMatch("quantity");
    const unitPriceCol = colMatch("unitPrice");
    const salesCol = colMatch("sales");
    const profitCol = colMatch("profit");
    const costCol = colMatch("cost");
    const lossCol = colMatch("loss");
    const categoryCol = colMatch("category");
    const regionCol = colMatch("region");
    const dateCol = colMatch("date");
    const customerCol = colMatch("customer");
    const returnCol = colMatch("returnFlag");
    const promoCol = colMatch("promotionFlag");

    const computeColumn = (col1, col2, fn, name) => {
        if (!col1 || !col2 || !df.columns.includes(col1) || !df.columns.includes(col2)) return undefined;
        const vals1 = df[col1].values.map(v => parseFloat(v) || 0);
        const vals2 = df[col2].values.map(v => parseFloat(v) || 0);
        const out = vals1.map((v, i) => fn(v, vals2[i]));
        df.addColumn(name, out);
        return name;
    };

    const cleanNumeric = vals => vals.map(v => parseFloat(String(v).replace(/[^0-9.-]/g, "")) || 0);

    let salesColName = salesCol;
    if (!salesColName && quantityCol && unitPriceCol) {
        salesColName = computeColumn(quantityCol, unitPriceCol, (a, b) => a * b, "__sales__");
    }

    let profitColName = profitCol;
    if (!profitColName && salesColName && costCol) {
        profitColName = computeColumn(salesColName, costCol, (a, b) => a - b, "__profit__");
    }

    let lossColName = lossCol;
    if (!lossColName && salesColName && profitColName) {
        lossColName = computeColumn(salesColName, profitColName, (a, b) => a - b, "__loss__");
    }

    const salesVals = cleanNumeric(df[salesColName]?.values || []);
    const profitVals = cleanNumeric(df[profitColName]?.values || []);
    const lossVals = cleanNumeric(df[lossColName]?.values || []);

    insights.kpis = {
        total_sales: safeSum(salesVals),
        avg_sales: safeMean(salesVals),
        median_sales: safeMedian(salesVals),
        total_profit: safeSum(profitVals),
        total_loss: safeSum(lossVals),
        profit_margin_percent: (safeMean(salesVals.map((s, i) => profitVals[i] / (s || 1))) * 100).toFixed(2)
    };

    if (categoryCol && salesColName) {
        const catGroup = groupByAndAggregate(df, categoryCol, salesColName, "sum");
        if (catGroup) {
            catGroup.sortValues(salesColName, { ascending: false, inplace: true });
            const json = dfToRowObjects(catGroup);
            insights.highPerformers.top_products = json.slice(0, 5);
            insights.lowPerformers.low_products = json.slice(-3);
        }
    }

    if (regionCol && salesColName) {
        const regGroup = groupByAndAggregate(df, regionCol, salesColName, "sum");
        if (regGroup) {
            insights.totals.sales_by_region = dfToRowObjects(regGroup);
        }
    }

    if (salesColName && dateCol) {
        try {
            const trend = trendAnalysis(df, dateCol, salesColName);
            if (trend.length) {
                insights.trends.daily = trend;
            }
        } catch (e) { /* trendAnalysis failed */ }
    }

    if (customerCol) {
        const freq = {};
        df[customerCol].values.forEach(id => { freq[id] = (freq[id] || 0) + 1; });
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
            .map(([customer, purchases]) => ({ customer, purchases }));
        insights.customer.frequent_customers = top;
    }

    if (returnCol && df.columns.includes(returnCol)) {
        const returns = df[returnCol].values.map(v =>
            v === true || v === "Yes" || v === 1 || String(v).toLowerCase() === "y"
        );
        insights.returns.return_rate_percent = ((returns.filter(Boolean).length / (returns.length || 1)) * 100).toFixed(2);
    }

    if (costCol && quantityCol) {
        const avgCost = safeMean(cleanNumeric(df[costCol]?.values || []));
        const cogs = safeSum(cleanNumeric(df[costCol]?.values || []));
        if (avgCost) {
            insights.inventory.turnover_rate = (cogs / avgCost).toFixed(2);
        }
    }

    if (promoCol && salesColName && df.columns.includes(promoCol)) {
        const promoOn = [], promoOff = [];
        df[promoCol].values.forEach((flag, i) => {
            const sale = parseFloat(df[salesColName].values[i]) || 0;
            const isPromo = flag === true || flag === "Yes" || flag === 1 || String(flag).toLowerCase() === "y";
            (isPromo ? promoOn : promoOff).push(sale);
        });
        if (promoOn.length && promoOff.length) {
            insights.promotions.impact = {
                avg_with_promo: safeMean(promoOn).toFixed(2),
                avg_without_promo: safeMean(promoOff).toFixed(2)
            };
        }
    }

    if (dateCol && salesColName && df.shape[0] >= 5) {
        try {
            const cleanDates = df[dateCol].values.map(d => new Date(d)).filter(d => !isNaN(d));
            const sorted = cleanDates.map((d, i) => ({ x: i, y: salesVals[i] })).filter(r => r.y > 0);
            if (sorted.length >= 3) {
                const x = sorted.map(p => p.x);
                const y = sorted.map(p => p.y);
                const reg = new SimpleLinearRegression(x, y);
                insights.kpis.sales_forecast_next_period = reg.predict(x.length).toFixed(2);
            }
        } catch (e) { /* forecasting failed */ }
    }

    if (insights.promotions.impact) {
        const { avg_with_promo, avg_without_promo } = insights.promotions.impact;
        const diff = avg_with_promo - avg_without_promo;
        if (diff > 0) {
            insights.hypothesis.push(`Sales increase with promotions by ${diff.toFixed(2)} on average.`);
        } else {
            insights.hypothesis.push(`Promotions may not be effective, as average sales with promotions are ${Math.abs(diff).toFixed(2)} lower.`);
        }
    }

    if (insights.kpis.total_profit < 0) {
        insights.hypothesis.push("Business is running at a loss overall. Cost structure or pricing may need review.");
    }

    if (insights.highPerformers.top_products && insights.lowPerformers.low_products) {
        const top = insights.highPerformers.top_products[0];
        const low = insights.lowPerformers.low_products[0];
        if (top && low && top[categoryCol] !== low[categoryCol]) {
            insights.hypothesis.push(`Category "${top[categoryCol]}" is outperforming "${low[categoryCol]}". Consider shifting inventory.`);
        }
    }

    return insights;
}

module.exports = { getRetailInsights };
