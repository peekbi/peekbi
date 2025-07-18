const dfd = require("danfojs-node");
const mlr = require("ml-regression").SimpleLinearRegression;
const { safeSum, safeMean, safeMax, safeMedian } = require("../utils/statsUtils");
const { groupByAndAggregate, trendAnalysis } = require("../helper");

function cleanNum(vals) {
    return Array.isArray(vals)
        ? vals.map(v => parseFloat(v)).filter(v => !isNaN(v))
        : [];
}

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

function getEducationInsights(df) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        hypothesis: [],
        totals: {},
        trends: [],
    };
    const numericCols = getNumericCols(df);
    const scoreCol = fuzzyMatch(df, ["score", "marks", "grade", "result", "performance"], "number") || getFirstNumericCol(df);
    const studentCol = fuzzyMatch(df, ["student", "name", "learner"]);
    const subjectCol = fuzzyMatch(df, ["subject", "course", "class"]);
    const dateCol = fuzzyMatch(df, ["year", "date", "month", "timestamp"]) || getFirstDateCol(df);
    const attendanceCol = fuzzyMatch(df, ["attendance", "present", "absent", "attendancerate"], "number");
    const completionCol = fuzzyMatch(df, ["completion", "status", "coursecompleted", "completionrate"], "number");
    const resourceCol = fuzzyMatch(df, ["resource", "usage", "time", "hour", "videos"], "number");
    const teacherCol = fuzzyMatch(df, ["teacher", "instructor", "faculty"]);
    const budgetCol = fuzzyMatch(df, ["budget", "cost", "expenditure"], "number") || numericCols[1] || numericCols[0] || null;;
    const alumniCol = fuzzyMatch(df, ["alumni", "employed", "career", "placement"]) || numericCols[numericCols.length - 1] || null;
    const infrastructureCol = fuzzyMatch(df, ["lab", "library", "facility", "infrastructure"], "number");
    const enrollmentCol = fuzzyMatch(df, ["enrollment", "registered", "join"], "number") || numericCols[2] || numericCols[2] || numericCols[1] || numericCols[0] || null;;
    const dropoutCol = fuzzyMatch(df, ["dropout", "retention", "left"], "number") || numericCols[3] || numericCols[2] || numericCols[1] || numericCols[0] || null;;

    const scores = cleanNum(df[scoreCol]?.values ?? []) || getFirstNumericCol(df);

    insights.kpis.total_score = safeSum(scores);
    insights.kpis.avg_score = safeMean(scores);
    insights.kpis.median_score = safeMedian(scores);
    insights.kpis.max_score = safeMax(scores);

    if (studentCol) {
        const grouped = groupByAndAggregate(df, studentCol, scoreCol, "mean").sortValues(scoreCol, { ascending: false });
        insights.highPerformers.top_students = dfd.toJSON(grouped.head(3), { format: "row" });
        insights.lowPerformers.bottom_students = dfd.toJSON(grouped.tail(3), { format: "row" });
        insights.totals.performance_by_student = dfd.toJSON(grouped, { format: "row" });
    }

    if (subjectCol) {
        const grouped = groupByAndAggregate(df, subjectCol, scoreCol, "mean").sortValues(scoreCol, { ascending: false });
        insights.highPerformers.top_subjects = dfd.toJSON(grouped.head(3), { format: "row" });
        insights.lowPerformers.bottom_subjects = dfd.toJSON(grouped.tail(3), { format: "row" });
        insights.totals.performance_by_subject = dfd.toJSON(grouped, { format: "row" });
    }

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
        }
    }

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
            }
        } catch { }
    }

    if (attendanceCol) {
        const attendanceVals = cleanNum(df[attendanceCol].values);
        insights.kpis.attendance_rate_avg = (safeMean(attendanceVals) || 0).toFixed(2) + "%";

        if (subjectCol) {
            const grp = groupByAndAggregate(df, subjectCol, attendanceCol, "mean")
                .sortValues(attendanceCol, { ascending: false });
            insights.totals.attendance_by_subject = dfd.toJSON(grp, { format: "row" });
        }

        // Correlation: Attendance vs Score
        if (scoreCol) {
            const cleanDf = df.loc({ columns: [attendanceCol, scoreCol] }).dropNa();
            const X = cleanNum(cleanDf[attendanceCol].values);
            const y = cleanNum(cleanDf[scoreCol].values);
            if (X.length === y.length && X.length >= 3) {
                const model = new mlr(X, y);
                insights.kpis.attendance_performance_slope = model.slope.toFixed(4);
            }
        }
    }

    if (completionCol) {
        const vals = cleanNum(df[completionCol].values);
        insights.kpis.avg_completion_rate = safeMean(vals).toFixed(2) + "%";

        if (subjectCol) {
            const grp = groupByAndAggregate(df, subjectCol, completionCol, "mean")
                .sortValues(completionCol, { ascending: false });
            insights.totals.completion_by_subject = dfd.toJSON(grp, { format: "row" });
        }
    }

    if (resourceCol) {
        const vals = cleanNum(df[resourceCol].values);
        insights.kpis.avg_resource_usage = safeMean(vals).toFixed(2);
        insights.kpis.max_resource_usage = safeMax(vals);

        if (studentCol) {
            const grp = groupByAndAggregate(df, studentCol, resourceCol, "mean").sortValues(resourceCol, { ascending: false });
            insights.highPerformers.top_resource_users = dfd.toJSON(grp.head(3), { format: "row" });
            insights.lowPerformers.bottom_resource_users = dfd.toJSON(grp.tail(3), { format: "row" });
            insights.totals.resource_usage_by_student = dfd.toJSON(grp, { format: "row" });
        }
    }

    if (teacherCol && scoreCol) {
        const grp = groupByAndAggregate(df, teacherCol, scoreCol, "mean").sortValues(scoreCol, { ascending: false });
        insights.totals.performance_by_teacher = dfd.toJSON(grp, { format: "row" });
    }

    if (budgetCol) {
        const vals = cleanNum(df[budgetCol].values);
        insights.kpis.total_budget = safeSum(vals);
        insights.kpis.avg_budget_spent = safeMean(vals);
    }

    if (infrastructureCol) {
        const vals = cleanNum(df[infrastructureCol].values);
        insights.kpis.infrastructure_usage_avg = safeMean(vals).toFixed(2);
    }

    if (alumniCol) {
        const vals = cleanNum(df[alumniCol].values);
        insights.kpis.alumni_employment_rate = (safeMean(vals) || 0).toFixed(2) + "%";
    }

    if (enrollmentCol) {
        const vals = cleanNum(df[enrollmentCol].values);
        insights.kpis.total_enrollments = safeSum(vals);
    }

    if (dropoutCol) {
        const vals = cleanNum(df[dropoutCol].values);
        insights.kpis.dropout_rate = (safeMean(vals) || 0).toFixed(2) + "%";
        insights.kpis.retention_rate = (100 - safeMean(vals)).toFixed(2) + "%";
    }

    if (!scoreCol) {
        insights.hypothesis.push("⚠️ Could not detect a score/grade column.");
    } else {
        dynamicBreakdown(df, scoreCol, insights);
        if (insights.hypothesis.length === 0) {
            insights.hypothesis.push("⚠️ No breakdown hypotheses added. Check if your categorical columns have too many or too few unique values.");
        }
    }


    return insights;
}

module.exports = { getEducationInsights };
