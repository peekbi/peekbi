const dfd = require("danfojs-node");
const mlr = require("ml-regression").SimpleLinearRegression;
const { safeSum, safeMean, safeMax, safeMedian } = require("../utils/statsUtils");
const { groupByAndAggregate, trendAnalysis } = require("../helper");

// 🧼 Clean number values
function cleanNum(vals) {
    return Array.isArray(vals)
        ? vals.map(v => parseFloat(v)).filter(v => !isNaN(v))
        : [];
}

// 🔍 Fuzzy column matcher
function fuzzyMatch(df, keywords, type = "string") {
    const columns = df.columns;
    const normalized = columns.map(c => c.toLowerCase().replace(/\s|_/g, ''));
    for (const key of keywords) {
        const k = key.toLowerCase();
        for (let i = 0; i < normalized.length; i++) {
            const col = columns[i];
            const series = df[col];
            if (normalized[i].includes(k)) {
                if (type === "number" && !series.values.some(v => !isNaN(parseFloat(v)))) continue;
                return col;
            }
        }
    }
    return null;
}

// 🧠 First numeric column fallback
function getFirstNumericCol(df) {
    for (const col of df.columns) {
        const vals = df[col].values;
        if (vals.some(v => !isNaN(parseFloat(v)))) return col;
    }
    return null;
}

// 📊 Auto breakdown by categorical columns
function dynamicBreakdown(df, valueCol, insights) {
    df.columns.forEach(col => {
        if (col === valueCol) return;
        const series = df[col];
        if (!series || series.dtypes !== "object") return;

        const uniqueCount = new Set(series.values).size;
        if (uniqueCount < 50 && uniqueCount > 1) {
            try {
                const grouped = groupByAndAggregate(df, col, valueCol, "sum");
                const sorted = grouped.sortValues(valueCol, { ascending: false });

                const topRows = dfd.toJSON(sorted.head(3), { format: "row" });
                const bottomRows = dfd.toJSON(sorted.tail(3), { format: "row" });
                const allRows = dfd.toJSON(sorted, { format: "row" });

                const key = col.toLowerCase().replace(/\s+/g, '_');
                insights.highPerformers[`top_${key}`] = topRows;
                insights.lowPerformers[`bottom_${key}`] = bottomRows;
                insights.totals[`cases_by_${key}`] = allRows;
                insights.hypothesis.push(`📌 Insight breakdown by '${col}' with ${uniqueCount} unique values.`);
            } catch (err) {
                insights.hypothesis.push(`⚠️ Failed breakdown on '${col}': ${err.message}`);
            }
        }
    });
}

// 🎓 Main Insight Function
function getEducationInsights(df) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        hypothesis: [],
        totals: {},
        trends: [],
    };

    // Key columns detection
    const scoreCol = fuzzyMatch(df, ["score", "marks", "grade", "result", "performance"], "number") || getFirstNumericCol(df);
    const studentCol = fuzzyMatch(df, ["student", "name", "learner"]);
    const subjectCol = fuzzyMatch(df, ["subject", "course", "class"]);
    const dateCol = fuzzyMatch(df, ["year", "date", "month", "timestamp"]);

    if (!scoreCol) insights.hypothesis.push("⚠️ No numeric score column detected.");
    else insights.hypothesis.push(`✅ Score column used: "${scoreCol}"`);

    const scores = cleanNum(df[scoreCol]?.values ?? []);

    // 🎯 KPIs
    insights.kpis.total_score = safeSum(scores);
    insights.kpis.avg_score = safeMean(scores);
    insights.kpis.median_score = safeMedian(scores);
    insights.kpis.max_score = safeMax(scores);

    if (scores.length > 0) insights.hypothesis.push("📊 Basic performance KPIs computed.");

    // 👨‍🎓 Student performance
    if (studentCol) {
        const grouped = groupByAndAggregate(df, studentCol, scoreCol, "mean").sortValues(scoreCol, { ascending: false });
        insights.highPerformers.top_students = dfd.toJSON(grouped.head(3), { format: "row" });
        insights.lowPerformers.bottom_students = dfd.toJSON(grouped.tail(3), { format: "row" });
        insights.totals.performance_by_student = dfd.toJSON(grouped, { format: "row" });
        insights.hypothesis.push("👨‍🎓 Student-level performance analyzed.");
    }

    // 📚 Subject performance
    if (subjectCol) {
        const grouped = groupByAndAggregate(df, subjectCol, scoreCol, "mean").sortValues(scoreCol, { ascending: false });
        insights.highPerformers.top_subjects = dfd.toJSON(grouped.head(3), { format: "row" });
        insights.lowPerformers.bottom_subjects = dfd.toJSON(grouped.tail(3), { format: "row" });
        insights.totals.performance_by_subject = dfd.toJSON(grouped, { format: "row" });
        insights.hypothesis.push("📚 Subject/course-level insights added.");
    }

    // 📈 Trend analysis
    if (dateCol && scoreCol) {
        const trend = trendAnalysis(df, dateCol, scoreCol);
        insights.trends = trend;

        const values = trend.map(row => row.avg);
        const growthRates = [];
        for (let i = 1; i < values.length; i++) {
            const prev = values[i - 1];
            const now = values[i];
            if (prev && now) {
                const rate = ((now - prev) / prev) * 100;
                if (!isNaN(rate)) growthRates.push(rate);
            }
        }

        if (growthRates.length > 0) {
            insights.kpis.avg_growth_rate = safeMean(growthRates).toFixed(2) + "%";
            insights.hypothesis.push("📈 Time-based academic trend computed.");
        }
    }

    // 🔮 Forecasting
    if (dateCol && scoreCol && df.shape[0] >= 3) {
        try {
            const subset = df.loc({ columns: [dateCol, scoreCol] }).dropNa();
            const years = subset[dateCol].values.map(y => parseInt(y)).filter(y => !isNaN(y));
            const values = cleanNum(subset[scoreCol].values);

            if (years.length === values.length && years.length >= 3) {
                const reg = new mlr(years, values);
                const next = Math.max(...years) + 1;
                const pred = reg.predict(next);
                insights.kpis.predicted_next_year_score = pred.toFixed(2);
                insights.hypothesis.push(`🔮 Forecast: ~${pred.toFixed(2)} score in ${next}`);
            }
        } catch {
            insights.hypothesis.push("⚠️ Forecast skipped due to time data issues.");
        }
    }

    // 📋 Attendance analysis
    const attendanceCol = fuzzyMatch(df, ["attendance", "present", "absent", "attendancerate"], "number");
    if (attendanceCol) {
        const attendanceVals = cleanNum(df[attendanceCol].values);
        insights.kpis.attendance_rate_avg = (safeMean(attendanceVals) || 0).toFixed(2) + "%";
        insights.hypothesis.push(`📋 Average attendance rate from '${attendanceCol}' computed.`);

        if (subjectCol) {
            const grp = groupByAndAggregate(df, subjectCol, attendanceCol, "mean")
                .sortValues(attendanceCol, { ascending: false });
            insights.totals.attendance_by_subject = dfd.toJSON(grp, { format: "row" });
            insights.hypothesis.push("🏫 Attendance breakdown by subject added.");
        }
    }

    // 🎓 Course completion rate
    const completionCol = fuzzyMatch(df, ["completion", "status", "coursecompleted", "completionrate"], "number");
    if (completionCol) {
        const completionVals = cleanNum(df[completionCol].values);
        insights.kpis.avg_completion_rate = (safeMean(completionVals) || 0).toFixed(2) + "%";
        insights.hypothesis.push(`🎓 Average course completion rate from '${completionCol}' computed.`);

        if (subjectCol) {
            const grp = groupByAndAggregate(df, subjectCol, completionCol, "mean")
                .sortValues(completionCol, { ascending: false });
            insights.totals.completion_by_subject = dfd.toJSON(grp, { format: "row" });
            insights.hypothesis.push("📚 Completion rate by subject added.");
        }
    }

    // 📖 Resource usage metrics
    const resourceCol = fuzzyMatch(df, ["resource", "usage", "time", "hour", "videos"], "number");
    if (resourceCol) {
        const usageVals = cleanNum(df[resourceCol].values);
        insights.kpis.avg_resource_usage = safeMean(usageVals).toFixed(2);
        insights.kpis.max_resource_usage = safeMax(usageVals);
        insights.hypothesis.push(`📖 Resource usage (from '${resourceCol}') KPIs computed.`);

        if (studentCol) {
            const grp = groupByAndAggregate(df, studentCol, resourceCol, "mean")
                .sortValues(resourceCol, { ascending: false });
            insights.highPerformers.top_resource_users = dfd.toJSON(grp.head(3), { format: "row" });
            insights.lowPerformers.bottom_resource_users = dfd.toJSON(grp.tail(3), { format: "row" });
            insights.totals.resource_usage_by_student = dfd.toJSON(grp, { format: "row" });
            insights.hypothesis.push("📈 Resource usage by student analyzed.");
        }
    }

    // 🔍 Smart breakdowns
    if (scoreCol) dynamicBreakdown(df, scoreCol, insights);

    // ⚠️ Fallback
    if (insights.hypothesis.length === 0) {
        insights.hypothesis.push("⚠️ No patterns detected. Add columns like score, date, subject, or attendance.");
    }

    return insights;
}

module.exports = { getEducationInsights };
