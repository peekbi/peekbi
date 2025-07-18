const dfd = require("danfojs-node");
const mlr = require("ml-regression").SimpleLinearRegression;
const { safeSum, safeMean, safeMedian, safeMax } = require("../utils/statsUtils");
const { trendAnalysis, groupByAndAggregate } = require("../helper");

// ────────────── HELPER FUNCTIONS ──────────────
function cleanNum(values) {
    return values
        .map(v => (typeof v === "string" ? parseFloat(v) : v))
        .filter(v => typeof v === "number" && !isNaN(v));
}

function fuzzyMatch(df, keywords, type = "number") {
    return df.columns.find(col => {
        const norm = col.toLowerCase().replace(/[\s_]/g, "");
        const isNumeric = df[col].values.some(v => !isNaN(parseFloat(v)));
        return keywords.some(k => norm.includes(k)) && (type === "number" ? isNumeric : true);
    }) || null;
}

function guessCategorical(df, skipCols = []) {
    return df.columns.filter(col => {
        if (skipCols.includes(col)) return false;
        const values = df[col].values.map(v => v?.toString()?.trim());
        const unique = new Set(values).size;
        return unique > 1 && unique <= 50 && typeof df[col].values[0] === "string";
    });
}

function deriveCategorical(df) {
    for (const col of df.columns) {
        const values = df[col].values.map(v => v?.toString()?.trim());
        const unique = new Set(values);
        const ratio = unique.size / df.shape[0];
        if (ratio < 0.5 && unique.size > 1 && unique.size <= 50) {
            return col;
        }
    }
    return null;
}
function getFirstNumericCol(df) {
    for (const col of df.columns) {
        const vals = df[col].values;
        if (vals.some(v => !isNaN(parseFloat(v)))) return col;
    }
    return null;
}

function getNumericCols(df) {
    return df.columns.filter(col =>
        df[col].values.some(v => !isNaN(parseFloat(v)))
    );
}

function getFirstDateCol(df, threshold = 0.3) {
    for (const col of df.columns) {
        const vals = df[col].values;
        const validCount = vals.filter(v => !isNaN(Date.parse(v))).length;
        if ((validCount / vals.length) >= threshold) {
            return col;
        }
    }
    return null;
}


// ────── INVESTMENT KEYWORDS & DETECTION ──────
const investmentKeywordMap = {
    mutual_funds: ["mutualfund", "mutual_fund"] || getFirstNumericCol(df),
    equity: ["equity", "stock", "stockmarket", "stock_market"],
    debentures: ["debenture"],
    bonds: ["bond", "governmentbond"],
    fixed_deposits: ["fixeddeposit", "fd"],
    ppf: ["ppf"],
    gold: ["gold"]
};

function detectInvestmentColumns(df) {
    const clean = str => str.toLowerCase().replace(/[\s_]/g, "");
    const detected = {};
    for (const [type, keywords] of Object.entries(investmentKeywordMap)) {
        detected[type] = df.columns.find(col => {
            const norm = clean(col);
            return keywords.some(k => norm.includes(k));
        }) || null;
    }
    return detected;
}

// ────────────── MAIN FUNCTION ──────────────
function getFinanceInsights(df) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        totals: {},
        trends: [],
        forecast: {},
        segments: {},
        variance: {},
        hypothesis: []
    };
    const numericCols = getNumericCols(df);
    const revenueCol = fuzzyMatch(df, ["revenue", "sales", "amount", "income", "checking", "transaction"]) || getFirstNumericCol(df);
    const expenseCol = fuzzyMatch(df, ["expense", "cost", "spend", "debit", "withdrawal"]) || numericCols[2];
    const dateCol = fuzzyMatch(df, ["date", "timestamp", "period", "time", 'month', 'year', 'period']) || getFirstDateCol(df);
    const metricCol = fuzzyMatch(df, ["metric", "type", "category", "label"], "string") || numericCols[3];
    const customerCol = fuzzyMatch(df, ["customer", "client", "user", 'sme', 'enterprise', 'retail'], "string") || numericCols[0] || null;

    if (!revenueCol) {
        insights.hypothesis.push(" Revenue column not found.");
        return insights;
    }

    const revenueVals = cleanNum(df[revenueCol].values);
    const expenseVals = expenseCol ? cleanNum(df[expenseCol].values) : [];

    // ────── KPIs ──────
    insights.kpis.total_revenue = safeSum(revenueVals);
    insights.kpis.avg_revenue = safeMean(revenueVals);
    insights.kpis.median_revenue = safeMedian(revenueVals);
    insights.kpis.max_revenue = safeMax(revenueVals);

    if (expenseVals.length) {
        insights.kpis.total_expenses = safeSum(expenseVals);
        insights.kpis.avg_expenses = safeMean(expenseVals);
        const netProfit = insights.kpis.total_revenue - insights.kpis.total_expenses;
        insights.kpis.net_profit = netProfit.toFixed(2);
        insights.kpis.net_margin = ((netProfit / insights.kpis.total_revenue) * 100).toFixed(2) + "%";
        insights.hypothesis.push(" Calculated profitability ratios.");
    } else {
        insights.hypothesis.push(" Only revenue data available; no expense analysis.");
    }

    // ────── Trend Analysis ──────
    if (dateCol) {
        try {
            const trends = trendAnalysis(df, dateCol, revenueCol, expenseCol);
            if (Array.isArray(trends) && trends.length > 0) {
                insights.trends = trends;
                insights.hypothesis.push(" Revenue vs Expense trend analysis complete.");
            } else {
                insights.hypothesis.push(" Trend analysis returned no insights.");
            }
        } catch {
            insights.hypothesis.push(" Trend analysis failed.");
        }
    }

    // ────── Forecast: Cash Flow ──────
    if (dateCol && expenseCol) {
        try {
            const dfCopy = df.loc({ columns: [dateCol, revenueCol, expenseCol] }).dropNa().sortValues(dateCol);
            const net = dfCopy[revenueCol].values.map((r, i) => parseFloat(r) - parseFloat(dfCopy[expenseCol].values[i]));
            const x = [...Array(net.length).keys()];
            if (x.length >= 3) {
                const reg = new mlr(x, net);
                const forecast = reg.predict(net.length);
                insights.forecast = {
                    method: "linear_regression",
                    next_cashflow: forecast.toFixed(2)
                };
                insights.hypothesis.push(" Cash flow forecast generated.");
            } else {
                insights.hypothesis.push(" Not enough data for cash flow forecast.");
            }
        } catch {
            insights.hypothesis.push(" Cash flow forecast failed.");
        }
    }

    // ────── Monthly Variance ──────
    if (dateCol) {
        try {
            const dfMonth = df.loc({ columns: [dateCol, revenueCol] });
            const months = dfMonth[dateCol].values.map(d => new Date(d).toISOString().slice(0, 7));
            dfMonth.addColumn("Month", months, { inplace: true });
            const monthly = groupByAndAggregate(dfMonth, "Month", revenueCol, "sum");
            insights.variance.monthly_revenue = monthly.toJSON();
            insights.hypothesis.push(" Monthly revenue variance analyzed.");
        } catch {
            insights.hypothesis.push(" Monthly variance analysis failed.");
        }
    }

    // ────── Customer Segmentation ──────
    if (customerCol) {
        const numericCols = df.columns.filter(c =>
            c !== customerCol &&
            df[c].values.every(v => typeof v === "number" && !isNaN(v))
        );
        if (numericCols.length >= 2) {
            insights.segments.available_features = numericCols;
            insights.hypothesis.push(" Customer segmentation features detected.");
        } else {
            insights.hypothesis.push(" Not enough numeric fields for segmentation.");
        }
    }

    // ────── Group Performance ──────
    let catColList = guessCategorical(df, [revenueCol, expenseCol, dateCol, metricCol]);
    let catCol = catColList.length ? catColList[0] : deriveCategorical(df);

    if (catCol && revenueCol) {
        try {
            const grouped = groupByAndAggregate(df, catCol, revenueCol, "mean");
            const sorted = grouped.sortValues(revenueCol, { ascending: false });
            const json = sorted.values.map(row => {
                const obj = {};
                sorted.columns.forEach((col, i) => obj[col] = row[i]);
                return obj;
            });

            insights.totals[`revenue_by_${catCol}`] = json;
            insights.highPerformers[`top_${catCol}`] = json.slice(0, 3);
            insights.lowPerformers[`bottom_${catCol}`] = json.slice(-3);
            insights.hypothesis.push(` Revenue performance grouped by '${catCol}'.`);
        } catch {
            insights.hypothesis.push(` Grouping by '${catCol}' failed.`);
        }
    }

    // ────── Revenue Growth Rate ──────
    if (dateCol && revenueCol) {
        try {
            const dfCopy = df.loc({ columns: [dateCol, revenueCol] }).dropNa();
            const dates = dfCopy[dateCol].values.map(d => new Date(d));
            const revenues = cleanNum(dfCopy[revenueCol].values);
            const sorted = dates.map((d, i) => ({ date: d, revenue: revenues[i] }))
                .sort((a, b) => a.date - b.date);
            const first = sorted[0].revenue;
            const last = sorted[sorted.length - 1].revenue;
            if (first && last && first !== 0) {
                const growth = ((last - first) / Math.abs(first)) * 100;
                insights.kpis.revenue_growth_rate = growth.toFixed(2) + "%";
                insights.hypothesis.push(" Calculated overall revenue growth rate.");
            }
        } catch {
            insights.hypothesis.push(" Revenue growth rate calculation failed.");
        }
    }

    // ────── Outlier Detection (Revenue) ──────
    try {
        const vals = revenueVals;
        const mean = safeMean(vals);
        const std = Math.sqrt(safeMean(vals.map(v => (v - mean) ** 2)));
        const outliers = vals.filter(v => Math.abs(v - mean) > 2 * std);
        if (outliers.length) {
            insights.kpis.revenue_outliers = outliers.length;
            insights.hypothesis.push(` Detected ${outliers.length} potential revenue outliers.`);
        }
    } catch {
        insights.hypothesis.push("⚠️ Revenue outlier detection failed.");
    }

    // ────── Customer Concentration ──────
    if (customerCol && revenueCol) {
        try {
            const grouped = groupByAndAggregate(df, customerCol, revenueCol, "sum");
            const totalRevenue = safeSum(grouped[revenueCol].values);
            const top3 = grouped[revenueCol].values.sort((a, b) => b - a).slice(0, 3);
            const concentration = safeSum(top3) / totalRevenue;
            insights.kpis.customer_concentration_ratio = (concentration * 100).toFixed(2) + "%";
            insights.hypothesis.push(" Calculated customer revenue concentration.");
        } catch {
            insights.hypothesis.push(" Customer concentration calculation failed.");
        }
    }

    // ────── Expense to Revenue Ratio Trend ──────
    if (dateCol && revenueCol && expenseCol) {
        try {
            const dfCopy = df.loc({ columns: [dateCol, revenueCol, expenseCol] }).dropNa();
            const months = dfCopy[dateCol].values.map(d => new Date(d).toISOString().slice(0, 7));
            dfCopy.addColumn("Month", months, { inplace: true });
            const revAgg = groupByAndAggregate(dfCopy, "Month", revenueCol, "sum");
            const expAgg = groupByAndAggregate(dfCopy, "Month", expenseCol, "sum");

            const ratios = revAgg["Month"].values.map((m, i) => {
                const rev = revAgg[revenueCol].values[i];
                const expIndex = expAgg["Month"].values.indexOf(m);
                const exp = expIndex !== -1 ? expAgg[expenseCol].values[expIndex] : 0;
                return {
                    month: m,
                    expense_to_revenue: rev !== 0 ? (exp / rev).toFixed(2) : "0.00"
                };
            });

            insights.variance.expense_to_revenue_ratio = ratios;
            insights.hypothesis.push(" Calculated monthly expense-to-revenue ratios.");
        } catch {
            insights.hypothesis.push(" Expense-to-revenue ratio trend failed.");
        }
    }

    // ────── Anomaly Detection (Simple z-score) ──────
    if (revenueVals.length > 5) {
        try {
            const mean = safeMean(revenueVals);
            const std = Math.sqrt(safeMean(revenueVals.map(v => (v - mean) ** 2)));
            const anomalies = revenueVals.map((v, i) => ({
                index: i,
                value: v,
                z: ((v - mean) / std).toFixed(2)
            })).filter(a => Math.abs(a.z) > 2);

            if (anomalies.length) {
                insights.kpis.revenue_anomalies = anomalies;
                insights.hypothesis.push(` Found ${anomalies.length} anomalous revenue points (z-score > 2).`);
            }
        } catch {
            insights.hypothesis.push(" Anomaly detection failed.");
        }
    }
    // ────── Investment Analysis ──────
    const investments = detectInvestmentColumns(df);
    insights.investments = {};

    for (const [type, col] of Object.entries(investments)) {
        if (col) {
            const values = cleanNum(df[col].values);
            insights.investments[type] = {
                total: safeSum(values),
                average: safeMean(values),
                max: safeMax(values),
            };
            insights.hypothesis.push(` Analyzed ${type.replace("_", " ")} investment performance.`);

            // Monthly trend
            if (dateCol) {
                try {
                    const dfTrend = df.loc({ columns: [dateCol, col] }).dropNa();
                    const months = dfTrend[dateCol].values.map(d => new Date(d).toISOString().slice(0, 7));
                    dfTrend.addColumn("Month", months, { inplace: true });
                    const monthly = groupByAndAggregate(dfTrend, "Month", col, "sum");
                    insights.trends.push({
                        metric: type,
                        data: monthly.toJSON()
                    });
                    insights.hypothesis.push(` Monthly trend generated for ${type.replace("_", " ")}.`);
                } catch {
                    insights.hypothesis.push(`Trend generation failed for ${type.replace("_", " ")}.`);
                }
            }

            // AccountType segmentation
            const accountCol = fuzzyMatch(df, ["accounttype", "account", "acct"], "string");
            if (accountCol) {
                try {
                    const grouped = groupByAndAggregate(df, accountCol, col, "mean");
                    const json = grouped.values.map(row => {
                        const obj = {};
                        grouped.columns.forEach((c, i) => obj[c] = row[i]);
                        return obj;
                    });
                    insights.segments[`${type}_by_${accountCol}`] = json;
                    insights.hypothesis.push(` Grouped ${type.replace("_", " ")} by ${accountCol}.`);
                } catch {
                    insights.hypothesis.push(` Account-type grouping failed for ${type.replace("_", " ")}.`);
                }
            }
        }
    }

    // ────── Risk, Credit, Investment Placeholders ──────
    insights.hypothesis.push(" Risk exposure requires liabilities/debt columns.");
    insights.hypothesis.push(" Credit default modeling needs labeled outcomes & payment history.");
    insights.hypothesis.push(" Investment performance analysis requires investment/return fields.");

    return insights;
}

module.exports = { getFinanceInsights };
