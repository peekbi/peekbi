const dfd = require("danfojs-node");
const mlr = require("ml-regression").SimpleLinearRegression;
const { groupByAndAggregate, trendAnalysis } = require("../helper");
const { safeSum, safeMean, safeMax, safeMedian } = require("../utils/statsUtils");

function cleanNum(vals) {
    return Array.isArray(vals)
        ? vals.map(v => parseFloat(v)).filter(v => !isNaN(v))
        : [];
}

function fuzzyMatch(df, keywords, type = "string") {
    const normalizedCols = df.columns.map(c => c.toLowerCase().replace(/\s|_/g, ""));
    for (const key of keywords) {
        const keyNorm = key.toLowerCase().replace(/\s|_/g, "");
        for (let i = 0; i < normalizedCols.length; i++) {
            const col = df.columns[i];
            const series = df[col];
            if (normalizedCols[i].includes(keyNorm)) {
                if (type === "number" && !series.values.some(v => !isNaN(parseFloat(v)))) continue;
                return col;
            }
        }
    }
    return null;
}

function toRowJSON(df) {
    return df.values.map((row, i) => {
        const obj = {};
        df.columns.forEach((col, j) => obj[col] = row[j]);
        return obj;
    });
}

function getHealthcareInsights(df) {
    const insights = {
        kpis: {},
        trends: {},
        breakdowns: {},
        correlations: [],
        hypothesis: [],
        forecasts: {},
        totals: {},
        highPerformers: {},
        lowPerformers: {}
    };

    const match = (keywords, type = "string") => fuzzyMatch(df, keywords, type);

    const admissionCol = match(["admission", "visit", "encounter"], "number");
    const departmentCol = match(["department", "unit", "ward"]);
    const diseaseCol = match(["disease", "diagnosis", "condition", "icd"]);
    const treatmentCol = match(["treatment", "therapy", "procedure"]);
    const outcomeCol = match(["outcome", "result", "status"]);
    const bedCol = match(["bed", "occupancy", "room"], "number");
    const staffCol = match(["staff", "nurse", "doctor", "personnel"]);
    const equipmentCol = match(["equipment", "machine", "device"]);
    const insuranceCol = match(["insurance", "payer", "claim"]);
    const medicationCol = match(["medication", "drug", "prescription", "rx"]);
    const dateCol = match(["date", "admission date", "timestamp", "period"]);

    // 1. Admissions by department
    if (admissionCol && departmentCol) {
        try {
            const grouped = groupByAndAggregate(df, departmentCol, admissionCol, "sum");
            const rows = toRowJSON(grouped);
            insights.breakdowns.admissions_by_department = rows;
            insights.hypothesis.push("📌 Admission trends analyzed by department.");

            const sorted = [...rows].sort((a, b) => b[admissionCol] - a[admissionCol]);
            if (sorted.length > 0) {
                insights.highPerformers = sorted[0];
                insights.lowPerformers = sorted[sorted.length - 1];
                insights.hypothesis.push("🏅 High and low performers identified by admissions.");
            }
        } catch (e) {
            insights.hypothesis.push("⚠️ Error analyzing admissions by department.");
        }
    }

    // 2. Disease incidence
    if (diseaseCol && admissionCol) {
        try {
            const grouped = groupByAndAggregate(df, diseaseCol, admissionCol, "sum");
            insights.breakdowns.disease_incidence = toRowJSON(grouped);
            insights.hypothesis.push("🦠 Disease incidence distribution analyzed.");
        } catch (e) {
            insights.hypothesis.push("⚠️ Disease incidence analysis failed.");
        }
    }

    // 3. Treatment success rate
    if (treatmentCol && outcomeCol) {
        try {
            const outcomes = df[outcomeCol].values.map(v => String(v).toLowerCase());
            const successTerms = ["success", "recovered", "discharged"];
            const successCount = outcomes.filter(v => successTerms.includes(v)).length;
            const total = outcomes.length || 1;
            insights.kpis.treatment_success_rate = ((successCount / total) * 100).toFixed(2) + "%";
            insights.hypothesis.push("✅ Treatment success rate calculated.");
        } catch (e) {
            insights.hypothesis.push("⚠️ Treatment outcome analysis failed.");
        }
    }

    // 4. Bed occupancy stats
    if (bedCol) {
        try {
            const vals = cleanNum(df[bedCol].values);
            insights.kpis.avg_bed_occupancy = safeMean(vals).toFixed(2);
            insights.kpis.max_bed_occupancy = safeMax(vals);
            insights.hypothesis.push("🛏️ Bed occupancy stats derived.");
        } catch (e) {
            insights.hypothesis.push("⚠️ Bed occupancy analysis failed.");
        }
    }

    // 5. Staff workload
    if (staffCol && dateCol) {
        try {
            const grouped = groupByAndAggregate(df, staffCol, staffCol, "count");
            insights.breakdowns.staff_workload = toRowJSON(grouped);
            insights.hypothesis.push("🧑‍⚕️ Staff workload distribution analyzed.");
        } catch (e) {
            insights.hypothesis.push("⚠️ Staff workload analysis failed.");
        }
    }

    // 6. Equipment usage
    if (equipmentCol && admissionCol) {
        try {
            const usage = groupByAndAggregate(df, equipmentCol, admissionCol, "sum");
            insights.breakdowns.equipment_usage = toRowJSON(usage);
            insights.hypothesis.push("🔧 Medical equipment usage analyzed.");
        } catch (e) {
            insights.hypothesis.push("⚠️ Equipment usage analysis failed.");
        }
    }

    // 7. Insurance claim patterns
    if (insuranceCol && admissionCol) {
        try {
            const claims = groupByAndAggregate(df, insuranceCol, admissionCol, "sum");
            insights.breakdowns.insurance_claims = toRowJSON(claims);
            insights.hypothesis.push("💳 Insurance claim patterns evaluated.");
        } catch (e) {
            insights.hypothesis.push("⚠️ Insurance claim analysis failed.");
        }
    }

    // 8. Medication prescription trends
    if (medicationCol && dateCol) {
        try {
            const meds = df[medicationCol].values;
            const dates = df[dateCol].values;
            const records = [];

            for (let i = 0; i < meds.length; i++) {
                const date = new Date(dates[i]).toISOString().split('T')[0];
                const drugs = String(meds[i]).split(',').map(d => d.trim());
                for (const drug of drugs) {
                    records.push({ date, drug });
                }
            }

            const medDF = new dfd.DataFrame(records);
            const grouped = medDF.groupby(["date", "drug"]).col(["drug"]).count();
            grouped.rename({ "drug_count": "count" }, { inplace: true });

            insights.trends.medication_trends = toRowJSON(grouped);
            insights.hypothesis.push("💊 Medication prescription frequency over time analyzed.");
        } catch (e) {
            insights.hypothesis.push("⚠️ Medication trend analysis failed.");
        }
    }

    // 9. Forecasting future admissions
    if (admissionCol && dateCol && df.shape[0] >= 5) {
        try {
            const subset = df.loc({ columns: [dateCol, admissionCol] }).dropNa();
            const rawDates = subset[dateCol].values;
            const parsedDates = rawDates.map(v => new Date(v)).filter(d => !isNaN(d));
            const y = cleanNum(subset[admissionCol].values);
            const x = parsedDates.map((_, i) => i);

            if (x.length === y.length && x.length >= 3) {
                const model = new mlr(x, y);
                const next = x.length;
                const forecast = model.predict(next);
                insights.forecasts.admissions_next_period = forecast.toFixed(2);
                insights.hypothesis.push(`🔮 Forecasted admissions for next period: ${forecast.toFixed(2)}`);
            } else {
                insights.hypothesis.push("⚠️ Not enough clean data to forecast admissions.");
            }
        } catch (e) {
            insights.hypothesis.push("⚠️ Forecasting failed for admissions.");
        }
    }

    // 10. Totals
    if (admissionCol) {
        try {
            const admissions = cleanNum(df[admissionCol].values);
            insights.totals.total_admissions = safeSum(admissions);
            insights.totals.avg_admissions = safeMean(admissions).toFixed(2);
            insights.totals.max_admissions = safeMax(admissions);
            insights.hypothesis.push("📊 Totals for admissions calculated.");
        } catch (e) {
            insights.hypothesis.push("⚠️ Failed to calculate totals.");
        }
    }

    // 11. Correlation between beds and admissions
    if (bedCol && admissionCol) {
        try {
            const x = cleanNum(df[bedCol].values);
            const y = cleanNum(df[admissionCol].values);

            if (x.length === y.length && x.length >= 3) {
                const xMean = safeMean(x);
                const yMean = safeMean(y);
                const covariance = x.reduce((acc, xi, i) => acc + ((xi - xMean) * (y[i] - yMean)), 0);
                const xStd = Math.sqrt(x.reduce((acc, xi) => acc + Math.pow(xi - xMean, 2), 0));
                const yStd = Math.sqrt(y.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0));
                const correlation = covariance / (xStd * yStd);
                insights.correlations.push({
                    between: `${bedCol} & ${admissionCol}`,
                    correlation: correlation.toFixed(3)
                });
                insights.hypothesis.push("📈 Correlation between bed occupancy and admissions analyzed.");
            }
        } catch (e) {
            insights.hypothesis.push("⚠️ Correlation computation failed.");
        }
    }

    return insights;
}

module.exports = { getHealthcareInsights };
