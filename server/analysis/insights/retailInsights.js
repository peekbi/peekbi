const dfd = require("danfojs-node");
const { groupByAndAggregate, trendAnalysis } = require("../helper");
const { safeSum, safeMean, safeMedian, safeMax } = require("../utils/statsUtils");
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

function getEducationInsights(df) {
    const insights = {
        kpis: {},
        highPerformers: {},
        lowPerformers: {},
        totals: {},
        trends: [],
        hypothesis: [],
    };

    const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, "");
    const clean = arr => arr.map(v => parseFloat(v)).filter(v => !isNaN(v));

    const fuzzyMatch = (keywords, type = "string") => {
        const normCols = df.columns.map(c => normalize(c));
        for (const keyword of keywords.map(normalize)) {
            for (let i = 0; i < normCols.length; i++) {
                const col = df.columns[i];
                const vals = df[col].values;
                if (normCols[i].includes(keyword)) {
                    if (type === "number" && vals.every(v => isNaN(parseFloat(v)))) continue;
                    return col;
                }
            }
        }
        return null;
    };

    // Match relevant columns
    const scoreCol = fuzzyMatch(["score", "grade", "mark", "result"], "number");
    const studentCol = fuzzyMatch(["student", "learner", "name"]);
    const subjectCol = fuzzyMatch(["subject", "course", "class"]);
    const dateCol = fuzzyMatch(["date", "year", "month"]);
    const attendanceCol = fuzzyMatch(["attendance", "present", "attendancerate"], "number");
    const completionCol = fuzzyMatch(["completion", "status", "completionrate"], "number");
    const alumniCol = fuzzyMatch(["alumni", "career", "placement"], "number");
    const budgetCol = fuzzyMatch(["budget", "expenditure", "cost"], "number");
    const infraCol = fuzzyMatch(["lab", "library", "facility", "infrastructure"], "number");
    const dropoutCol = fuzzyMatch(["dropout", "retention"], "number");
    const enrollmentCol = fuzzyMatch(["enrollment", "registered"], "number");
    const teacherCol = fuzzyMatch(["teacher", "faculty", "instructor"]);

    let foundSomething = false;

    // Core KPIs
    if (scoreCol) {
        const scores = clean(df[scoreCol]?.values || []);
        insights.kpis.total_score = safeSum(scores);
        insights.kpis.avg_score = safeMean(scores);
        insights.kpis.median_score = safeMedian(scores);
        insights.kpis.max_score = safeMax(scores);
        foundSomething = true;
    }

    // Performance by Subject
    if (subjectCol && scoreCol) {
        const grp = groupByAndAggregate(df, subjectCol, scoreCol, "mean").sortValues(scoreCol, { ascending: false });
        const rows = dfToRowObjects(grp);
        insights.highPerformers.top_subjects = rows.slice(0, 3);
        insights.lowPerformers.bottom_subjects = rows.slice(-3);
        insights.totals.performance_by_subject = rows;
        insights.hypothesis.push("📌 Student performance trends by subject.");
        foundSomething = true;
    }

    // Dropout & Retention
    if (dropoutCol) {
        const vals = clean(df[dropoutCol].values);
        const avg = safeMean(vals);
        insights.kpis.dropout_rate = avg.toFixed(2) + "%";
        insights.kpis.retention_rate = (100 - avg).toFixed(2) + "%";
        insights.hypothesis.push("📌 Dropout and retention rates analyzed.");
        foundSomething = true;
    }

    // Enrollment Trends
    if (enrollmentCol) {
        const vals = clean(df[enrollmentCol].values);
        insights.kpis.total_enrollments = safeSum(vals);
        insights.hypothesis.push("📌 Course popularity and enrollment trends.");
        foundSomething = true;
    }

    // Teacher Performance
    if (teacherCol && scoreCol) {
        const grp = groupByAndAggregate(df, teacherCol, scoreCol, "mean").sortValues(scoreCol, { ascending: false });
        insights.totals.performance_by_teacher = dfToRowObjects(grp);
        insights.hypothesis.push("📌 Teacher-student performance correlation.");
        foundSomething = true;
    }

    // Budget
    if (budgetCol) {
        const vals = clean(df[budgetCol].values);
        insights.kpis.total_budget = safeSum(vals);
        insights.kpis.avg_budget_spent = safeMean(vals);
        insights.hypothesis.push("📌 Budget utilization effectiveness.");
        foundSomething = true;
    }

    // Infrastructure
    if (infraCol) {
        const vals = clean(df[infraCol].values);
        insights.kpis.infrastructure_usage_avg = safeMean(vals).toFixed(2);
        insights.hypothesis.push("📌 Infrastructure usage analyzed.");
        foundSomething = true;
    }

    // Alumni Career
    if (alumniCol) {
        const vals = clean(df[alumniCol].values);
        insights.kpis.alumni_employment_rate = safeMean(vals).toFixed(2) + "%";
        insights.hypothesis.push("📌 Alumni career tracking.");
        foundSomething = true;
    }

    // Attendance vs Score
    if (attendanceCol && scoreCol) {
        const x = clean(df[attendanceCol].values);
        const y = clean(df[scoreCol]?.values || []);
        if (x.length === y.length && x.length >= 3) {
            const reg = new SimpleLinearRegression(x, y);
            insights.kpis.attendance_performance_slope = reg.slope.toFixed(4);
        }
        insights.kpis.attendance_rate_avg = safeMean(x).toFixed(2) + "%";
        insights.hypothesis.push("📌 Attendance impact on grades.");
        foundSomething = true;
    }

    // Score Trends
    if (dateCol && scoreCol) {
        const trends = trendAnalysis(df, dateCol, scoreCol);
        insights.trends = trends;
        foundSomething = true;
    }

    // Fallback hypothesis if nothing was detected
    if (!foundSomething) {
        insights.hypothesis.push("⚠️ No patterns detected. Add columns like score, date, subject, or attendance.");
    }

    return insights;
}

module.exports = { getEducationInsights };
