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

function getRetailInsights(df) {
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
    const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');

    const rawCols = {
        quantity: ['qty', 'quantity', 'units sold', 'unitsold', 'sold quantity', 'sold_qty', 'order quantity', 'order_qty', 'qty sold'],
        unitPrice: ['unit price', 'unitprice', 'unit cost', 'unitcost', 'price', 'price per unit', 'rate', 'cost per item', 'item price'],
        sales: ['total', 'amount', 'sales', 'sale', 'revenue', 'gross sale', 'net sale', 'invoice value', 'total revenue', 'totalamount', 'total price', 'total_price', 'order value'],
        profit: ['profit', 'gross profit', 'net profit', 'profit margin', 'profit ($)', 'profit amount', 'margin'],
        cost: ['cost', 'purchase cost', 'total cost', 'purchase price', 'cost per unit', 'unit cost'],
        loss: ['loss', 'net loss', 'negative profit'],
        category: ['category', 'product', 'item', 'brand', 'segment', 'product category', 'sub category', 'subcategory'],
        region: ['region', 'area', 'zone', 'territory', 'location', 'market'],
        date: ['date', 'order date', 'timestamp', 'sale date', 'datetime', 'transaction date'],
        customer: ['customer', 'customer id', 'client', 'user', 'customer name', 'client id', 'user id'],
        returnFlag: ['return', 'returned', 'is return', 'is_return', 'returned (y/n)', 'return status', 'was returned', 'isreturned'],
        promotionFlag: ['promo', 'discount', 'promotion', 'promotion applied (y/n)', 'is_discounted', 'discount applied', 'discountflag']
    };

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

    // Column detection
    const quantityCol = colMatch("quantity");
    const unitPriceCol = colMatch("unitPrice");
    let salesCol = colMatch("sales");
    let profitCol = colMatch("profit");
    let costCol = colMatch("cost");
    let lossCol = colMatch("loss");
    const categoryCol = colMatch("category");
    const regionCol = colMatch("region");
    const dateCol = colMatch("date");
    const customerCol = colMatch("customer");
    const returnCol = colMatch("returnFlag");
    const promoCol = colMatch("promotionFlag");

    // Compute helper
    const computeColumn = (col1, col2, fn, name) => {
        if (!col1 || !col2 || !df.columns.includes(col1) || !df.columns.includes(col2)) return undefined;
        const vals1 = df[col1].values.map(v => parseFloat(v) || 0);
        const vals2 = df[col2].values.map(v => parseFloat(v) || 0);
        const out = vals1.map((v, i) => fn(v, vals2[i]));
        df.addColumn(name, out);
        return name;
    };

    const cleanNumeric = vals => vals.map(v => parseFloat(String(v).toString().replace(/[^0-9.-]/g, "")) || 0);

    // Build missing sales/profit/loss columns
    if (!salesCol && quantityCol && unitPriceCol) {
        salesCol = computeColumn(quantityCol, unitPriceCol, (a, b) => a * b, "__sales__");
    }

    if (!profitCol && salesCol && costCol) {
        profitCol = computeColumn(salesCol, costCol, (a, b) => a - b, "__profit__");
    }

    if (!lossCol && salesCol && profitCol) {
        lossCol = computeColumn(salesCol, profitCol, (a, b) => a - b, "__loss__");
    }

    const salesVals = cleanNumeric(df[salesCol]?.values || []);
    const profitVals = cleanNumeric(df[profitCol]?.values || []);
    const lossVals = cleanNumeric(df[lossCol]?.values || []);
    const quantityVals = cleanNumeric(df[quantityCol]?.values || []);

    // Core KPIs
    if (salesVals.length > 0) {
        insights.kpis = {
            total_sales: safeSum(salesVals),
            avg_sales: safeMean(salesVals),
            median_sales: safeMedian(salesVals),
            total_profit: safeSum(profitVals),
            total_loss: safeSum(lossVals),
            avg_order_value: (safeSum(salesVals) / (df.shape[0] || 1)).toFixed(2),
            profit_margin_percent: (safeMean(salesVals.map((s, i) => profitVals[i] / (s || 1))) * 100).toFixed(2)
        };
    }

    // Top and low performers by category
    if (categoryCol && salesCol) {
        const catGroup = groupByAndAggregate(df, categoryCol, salesCol, "sum");
        if (catGroup) {
            catGroup.sortValues(salesCol, { ascending: false, inplace: true });
            const json = dfToRowObjects(catGroup);
            insights.highPerformers.top_products = json.slice(0, 5);
            insights.lowPerformers.low_products = json.slice(-3);
        }
    }

    // Region performance
    if (regionCol && salesCol) {
        const regGroup = groupByAndAggregate(df, regionCol, salesCol, "sum");
        if (regGroup) {
            insights.totals.sales_by_region = dfToRowObjects(regGroup);
        }
    }

    // Sales trends over time
    if (salesCol && dateCol) {
        try {
            const trend = trendAnalysis(df, dateCol, salesCol);
            if (trend?.length) {
                insights.trends.daily = trend;
            }
        } catch { }
    }

    // Frequent customers
    if (customerCol) {
        const freq = {};
        df[customerCol].values.forEach(id => {
            freq[id] = (freq[id] || 0) + 1;
        });
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
            .map(([customer, purchases]) => ({ customer, purchases }));
        insights.customer.frequent_customers = top;
    }

    // Return analysis
    if (returnCol && df.columns.includes(returnCol)) {
        const returns = df[returnCol].values.map(v =>
            v === true || v === "Yes" || v === 1 || String(v).toLowerCase() === "y"
        );
        insights.returns = {
            return_rate_percent: ((returns.filter(Boolean).length / (returns.length || 1)) * 100).toFixed(2),
            returned_count: returns.filter(Boolean).length
        };
    }

    // Inventory turnover
    if (costCol && quantityCol) {
        const totalCost = safeSum(cleanNumeric(df[costCol]?.values || []));
        const totalQty = safeSum(quantityVals);
        if (totalCost > 0 && totalQty > 0) {
            insights.inventory.turnover_rate = (totalQty / (totalCost || 1)).toFixed(2);
        }
    }

    // Promotion analysis
    if (promoCol && salesCol && df.columns.includes(promoCol)) {
        const promoOn = [], promoOff = [];
        df[promoCol].values.forEach((flag, i) => {
            const sale = parseFloat(df[salesCol].values[i]) || 0;
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

    // Sales forecast using linear regression
    if (dateCol && salesCol && df.shape[0] >= 5) {
        try {
            const cleanDates = df[dateCol].values.map(d => new Date(d)).filter(d => !isNaN(d));
            const sorted = cleanDates.map((d, i) => ({ x: i, y: salesVals[i] })).filter(r => r.y > 0);
            if (sorted.length >= 3) {
                const x = sorted.map(p => p.x);
                const y = sorted.map(p => p.y);
                const reg = new SimpleLinearRegression(x, y);
                insights.kpis.sales_forecast_next_period = reg.predict(x.length).toFixed(2);
            }
        } catch { }
    }

    // Hypothesis generation
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
        if (top && low && categoryCol && top[categoryCol] !== low[categoryCol]) {
            insights.hypothesis.push(`Category "${top[categoryCol]}" is outperforming "${low[categoryCol]}". Consider shifting inventory.`);
        }
    }

    return insights;
}

module.exports = { getRetailInsights };
