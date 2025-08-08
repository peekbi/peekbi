const dfd = require("danfojs-node");
const { groupByAndAggregate, trendAnalysis, correlation, detectOutliers } = require("../helper");
const { safeSum, safeMean, safeMedian, safeMin, safeMax, safeStandardDeviation } = require("../utils/statsUtils");
const { SimpleLinearRegression } = require("ml-regression");

/**
 * Enhanced Retail Insights Generator
 * More robust, dynamic, and informative analysis
 */

class EnhancedRetailInsights {
    constructor() {
        this.columnMappings = {
            quantity: ['qty', 'quantity', 'units sold', 'unitsold', 'sold quantity', 'sold_qty', 'order quantity', 'order_qty', 'qty sold', 'quantity sold'],
            unitPrice: ['unit price', 'unitprice', 'unit cost', 'unitcost', 'price', 'price per unit', 'rate', 'cost per item', 'item price'],
            sales: ['total', 'amount', 'sales', 'sale', 'revenue', 'gross sale', 'net sale', 'invoice value', 'total revenue', 'totalamount', 'total price', 'total_price', 'order value'],
            profit: ['profit', 'gross profit', 'net profit', 'profit margin', 'profit ($)', 'profit amount', 'margin'],
            cost: ['cost', 'purchase cost', 'total cost', 'purchase price', 'cost per unit', 'unit cost'],
            category: ['category', 'product', 'item', 'brand', 'segment', 'product category', 'sub category', 'subcategory', 'product name'],
            region: ['region', 'area', 'zone', 'territory', 'location', 'market', 'sales channel', 'channel'],
            date: ['date', 'order date', 'timestamp', 'sale date', 'datetime', 'transaction date'],
            customer: ['customer', 'customer id', 'client', 'user', 'customer name', 'client id', 'user id', 'order id'],
            size: ['size', 'product size', 'item size'],
            returnFlag: ['return', 'returned', 'is return', 'is_return', 'returned (y/n)', 'return status', 'was returned', 'isreturned'],
            promotionFlag: ['promo', 'discount', 'promotion', 'promotion applied (y/n)', 'is_discounted', 'discount applied', 'discountflag']
        };
    }

    // Enhanced column detection with fuzzy matching
    detectColumns(df) {
        const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedCols = df.columns.map(col => ({ original: col, normalized: normalize(col) }));

        const detected = {};

        for (const [type, aliases] of Object.entries(this.columnMappings)) {
            for (const alias of aliases) {
                const normalizedAlias = normalize(alias);
                const match = normalizedCols.find(col =>
                    col.normalized === normalizedAlias ||
                    col.normalized.includes(normalizedAlias) ||
                    normalizedAlias.includes(col.normalized)
                );
                if (match) {
                    detected[type] = match.original;
                    break;
                }
            }
        }

        // Fallback to numeric columns for missing mappings
        const numericCols = this.getNumericColumns(df);
        if (!detected.quantity && numericCols.length > 0) detected.quantity = numericCols[0];
        if (!detected.unitPrice && numericCols.length > 1) detected.unitPrice = numericCols[1];
        if (!detected.sales && numericCols.length > 2) detected.sales = numericCols[2];
        if (!detected.profit && numericCols.length > 3) detected.profit = numericCols[3];

        // Fix sales column detection - should prioritize Revenue over Sales Channel
        const revenueCol = df.columns.find(col =>
            normalize(col).includes('revenue') ||
            normalize(col).includes('total') ||
            normalize(col).includes('amount')
        );
        if (revenueCol) detected.sales = revenueCol;

        // Date column detection with validation
        if (!detected.date) {
            detected.date = this.detectDateColumn(df);
        }

        return detected;
    }

    getNumericColumns(df) {
        return df.columns.filter(col => {
            const sample = df[col].values.slice(0, 10);
            const numericCount = sample.filter(v => !isNaN(parseFloat(v))).length;
            return numericCount / sample.length > 0.7; // 70% numeric threshold
        });
    }

    detectDateColumn(df, threshold = 0.5) {
        for (const col of df.columns) {
            const sample = df[col].values.slice(0, 20);
            const validDates = sample.filter(v => !isNaN(Date.parse(v))).length;
            if ((validDates / sample.length) >= threshold) {
                return col;
            }
        }
        return null;
    }

    // Enhanced data cleaning and validation
    cleanAndValidateData(df, columns) {
        const cleanedData = {};

        for (const [type, colName] of Object.entries(columns)) {
            if (!colName || !df.columns.includes(colName)) continue;

            const values = df[colName].values;

            switch (type) {
                case 'quantity':
                case 'unitPrice':
                case 'sales':
                case 'profit':
                    cleanedData[type] = values.map(v => {
                        const num = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
                        return isNaN(num) ? 0 : num;
                    });
                    break;
                case 'date':
                    cleanedData[type] = values.map(v => {
                        const date = new Date(v);
                        return isNaN(date.getTime()) ? null : date;
                    }).filter(d => d !== null);
                    break;
                default:
                    cleanedData[type] = values;
            }
        }

        return cleanedData;
    }

    // Advanced KPI calculations
    calculateAdvancedKPIs(data, columns) {
        const kpis = {};

        if (data.sales) {
            const salesData = data.sales;
            kpis.total_sales = safeSum(salesData);
            kpis.avg_sales = safeMean(salesData);
            kpis.median_sales = safeMedian(salesData);
            kpis.min_sales = safeMin(salesData);
            kpis.max_sales = safeMax(salesData);
            kpis.sales_std_dev = safeStandardDeviation(salesData);
            kpis.sales_variance = Math.pow(kpis.sales_std_dev, 2);

            // Coefficient of variation (volatility measure)
            kpis.sales_coefficient_of_variation = kpis.avg_sales > 0 ?
                (kpis.sales_std_dev / kpis.avg_sales * 100).toFixed(2) : 0;
        }

        if (data.profit) {
            const profitData = data.profit;
            kpis.total_profit = safeSum(profitData);
            kpis.avg_profit = safeMean(profitData);
            kpis.profit_margin_percent = data.sales ?
                ((kpis.total_profit / kpis.total_sales) * 100).toFixed(2) : 0;

            // Profit consistency
            kpis.profit_std_dev = safeStandardDeviation(profitData);
            kpis.profitable_transactions_percent = profitData.length > 0 ?
                ((profitData.filter(p => p > 0).length / profitData.length) * 100).toFixed(2) : 0;
        }

        if (data.quantity) {
            const qtyData = data.quantity;
            kpis.total_units_sold = safeSum(qtyData);
            kpis.avg_units_per_order = safeMean(qtyData);
            kpis.max_units_per_order = safeMax(qtyData);
        }

        // Calculate average order value
        if (data.sales && data.sales.length > 0) {
            kpis.avg_order_value = (kpis.total_sales / data.sales.length).toFixed(2);
        }

        return kpis;
    }

    // Enhanced performance analysis
    analyzePerformance(df, columns, data) {
        const performance = {
            highPerformers: {},
            lowPerformers: {},
            insights: []
        };

        // Category performance analysis
        if (columns.category && columns.sales) {
            const categoryPerf = groupByAndAggregate(df, columns.category, columns.sales, "sum");
            if (categoryPerf) {
                categoryPerf.sortValues(columns.sales, { ascending: false, inplace: true });
                const categoryData = this.dfToRowObjects(categoryPerf);

                performance.highPerformers.top_categories = categoryData.slice(0, 5);
                performance.lowPerformers.bottom_categories = categoryData.slice(-3);

                // Performance insights
                const topCategory = categoryData[0];
                const bottomCategory = categoryData[categoryData.length - 1];
                const performanceGap = topCategory[columns.sales] / bottomCategory[columns.sales];

                performance.insights.push({
                    type: "category_performance",
                    message: `Top category "${topCategory[columns.category]}" outperforms bottom category by ${performanceGap.toFixed(1)}x`,
                    impact: performanceGap > 5 ? "high" : performanceGap > 2 ? "medium" : "low"
                });
            }
        }

        // Size analysis (if available)
        if (columns.size && columns.sales) {
            const sizePerf = groupByAndAggregate(df, columns.size, columns.sales, "sum");
            if (sizePerf) {
                sizePerf.sortValues(columns.sales, { ascending: false, inplace: true });
                performance.highPerformers.top_sizes = this.dfToRowObjects(sizePerf).slice(0, 3);
            }
        }

        // Channel analysis (if region represents sales channel)
        if (columns.region && columns.sales) {
            const channelPerf = groupByAndAggregate(df, columns.region, columns.sales, "sum");
            if (channelPerf) {
                const channelData = this.dfToRowObjects(channelPerf);
                performance.highPerformers.top_channels = channelData;

                // Channel insights
                const onlineData = channelData.find(c =>
                    String(c[columns.region]).toLowerCase().includes('online')
                );
                const offlineData = channelData.find(c =>
                    String(c[columns.region]).toLowerCase().includes('offline')
                );

                if (onlineData && offlineData) {
                    const channelRatio = onlineData[columns.sales] / offlineData[columns.sales];
                    performance.insights.push({
                        type: "channel_performance",
                        message: channelRatio > 1 ?
                            `Online sales outperform offline by ${((channelRatio - 1) * 100).toFixed(1)}%` :
                            `Offline sales outperform online by ${((1 / channelRatio - 1) * 100).toFixed(1)}%`,
                        impact: Math.abs(channelRatio - 1) > 0.2 ? "medium" : "low"
                    });
                }
            }
        }

        return performance;
    }

    // Advanced trend analysis
    analyzeTrends(df, columns, data) {
        const trends = {};

        if (columns.date && columns.sales) {
            // Daily trends
            const dailyTrends = trendAnalysis(df, columns.date, columns.sales);
            trends.daily = dailyTrends;

            // Monthly aggregation
            const monthlyData = this.aggregateByPeriod(dailyTrends, 'month');
            trends.monthly = monthlyData;

            // Seasonal analysis
            const seasonalAnalysis = this.analyzeSeasonality(dailyTrends);
            trends.seasonal = seasonalAnalysis;

            // Growth rate calculation
            if (dailyTrends.length >= 2) {
                const firstPeriod = dailyTrends[0].total;
                const lastPeriod = dailyTrends[dailyTrends.length - 1].total;
                const growthRate = ((lastPeriod - firstPeriod) / firstPeriod * 100).toFixed(2);
                trends.overall_growth_rate = growthRate;
            }
        }

        return trends;
    }

    // Seasonal analysis
    analyzeSeasonality(dailyData) {
        const seasonalData = { spring: [], summer: [], fall: [], winter: [] };

        dailyData.forEach(day => {
            const date = new Date(day.date);
            const month = date.getMonth() + 1;

            if (month >= 3 && month <= 5) seasonalData.spring.push(day.total);
            else if (month >= 6 && month <= 8) seasonalData.summer.push(day.total);
            else if (month >= 9 && month <= 11) seasonalData.fall.push(day.total);
            else seasonalData.winter.push(day.total);
        });

        return {
            spring_avg: safeMean(seasonalData.spring).toFixed(2),
            summer_avg: safeMean(seasonalData.summer).toFixed(2),
            fall_avg: safeMean(seasonalData.fall).toFixed(2),
            winter_avg: safeMean(seasonalData.winter).toFixed(2),
            peak_season: this.findPeakSeason(seasonalData)
        };
    }

    findPeakSeason(seasonalData) {
        const averages = {
            spring: safeMean(seasonalData.spring),
            summer: safeMean(seasonalData.summer),
            fall: safeMean(seasonalData.fall),
            winter: safeMean(seasonalData.winter)
        };

        return Object.keys(averages).reduce((a, b) => averages[a] > averages[b] ? a : b);
    }

    // Advanced customer analysis
    analyzeCustomers(df, columns, data) {
        const customerAnalysis = {};

        if (columns.customer && columns.sales) {
            // Customer frequency and value
            const customerData = {};

            for (let i = 0; i < df.shape[0]; i++) {
                const customerId = df[columns.customer].values[i];
                const saleValue = parseFloat(df[columns.sales].values[i]) || 0;

                if (!customerData[customerId]) {
                    customerData[customerId] = { frequency: 0, totalValue: 0, orders: [] };
                }

                customerData[customerId].frequency += 1;
                customerData[customerId].totalValue += saleValue;
                customerData[customerId].orders.push(saleValue);
            }

            // Calculate customer metrics
            const customerMetrics = Object.entries(customerData).map(([id, data]) => ({
                customer_id: id,
                frequency: data.frequency,
                total_value: data.totalValue.toFixed(2),
                avg_order_value: (data.totalValue / data.frequency).toFixed(2),
                customer_lifetime_value: data.totalValue.toFixed(2)
            }));

            // Sort by different metrics
            customerAnalysis.top_by_frequency = customerMetrics
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 5);

            customerAnalysis.top_by_value = customerMetrics
                .sort((a, b) => parseFloat(b.total_value) - parseFloat(a.total_value))
                .slice(0, 5);

            customerAnalysis.top_by_avg_order = customerMetrics
                .sort((a, b) => parseFloat(b.avg_order_value) - parseFloat(a.avg_order_value))
                .slice(0, 5);

            // Customer segmentation
            customerAnalysis.segments = this.segmentCustomers(customerMetrics);
        }

        return customerAnalysis;
    }

    // Customer segmentation (RFM-like analysis)
    segmentCustomers(customerMetrics) {
        const segments = { vip: [], regular: [], occasional: [], at_risk: [] };

        const avgFreq = safeMean(customerMetrics.map(c => c.frequency));
        const avgValue = safeMean(customerMetrics.map(c => parseFloat(c.total_value)));

        customerMetrics.forEach(customer => {
            const freq = customer.frequency;
            const value = parseFloat(customer.total_value);

            if (freq > avgFreq && value > avgValue) {
                segments.vip.push(customer);
            } else if (freq > avgFreq || value > avgValue) {
                segments.regular.push(customer);
            } else if (freq > 1) {
                segments.occasional.push(customer);
            } else {
                segments.at_risk.push(customer);
            }
        });

        return {
            vip_customers: segments.vip.length,
            regular_customers: segments.regular.length,
            occasional_customers: segments.occasional.length,
            at_risk_customers: segments.at_risk.length,
            vip_list: segments.vip.slice(0, 3)
        };
    }

    // Enhanced hypothesis generation
    generateAdvancedHypotheses(insights) {
        const hypotheses = [];

        // Performance-based hypotheses
        if (insights.performance.insights) {
            insights.performance.insights.forEach(insight => {
                if (insight.impact === 'high') {
                    hypotheses.push({
                        category: 'performance',
                        hypothesis: insight.message,
                        confidence: 'high',
                        recommendation: this.getRecommendation(insight.type, insight)
                    });
                }
            });
        }

        // Trend-based hypotheses
        if (insights.trends.overall_growth_rate) {
            const growthRate = parseFloat(insights.trends.overall_growth_rate);
            if (growthRate > 10) {
                hypotheses.push({
                    category: 'growth',
                    hypothesis: `Business is experiencing strong growth at ${growthRate}% over the analysis period`,
                    confidence: 'high',
                    recommendation: 'Scale operations and inventory to meet growing demand'
                });
            } else if (growthRate < -10) {
                hypotheses.push({
                    category: 'decline',
                    hypothesis: `Business is declining at ${Math.abs(growthRate)}% - immediate action needed`,
                    confidence: 'high',
                    recommendation: 'Investigate causes and implement recovery strategies'
                });
            }
        }

        // Seasonal hypotheses
        if (insights.trends.seasonal) {
            const seasonal = insights.trends.seasonal;
            hypotheses.push({
                category: 'seasonality',
                hypothesis: `${seasonal.peak_season} is the peak season for sales`,
                confidence: 'medium',
                recommendation: `Increase inventory and marketing efforts during ${seasonal.peak_season}`
            });
        }

        // Customer hypotheses
        if (insights.customer.segments) {
            const segments = insights.customer.segments;
            const vipRatio = segments.vip_customers / (segments.vip_customers + segments.regular_customers + segments.occasional_customers + segments.at_risk_customers);

            if (vipRatio < 0.1) {
                hypotheses.push({
                    category: 'customer_retention',
                    hypothesis: 'Low VIP customer ratio suggests need for better customer retention strategies',
                    confidence: 'medium',
                    recommendation: 'Implement loyalty programs and personalized marketing'
                });
            }
        }

        return hypotheses;
    }

    getRecommendation(type, insight) {
        const recommendations = {
            'category_performance': 'Focus marketing and inventory on top-performing categories',
            'channel_performance': 'Optimize the underperforming channel or reallocate resources',
            'seasonal_trends': 'Adjust inventory and marketing based on seasonal patterns',
            'customer_segments': 'Develop targeted strategies for each customer segment'
        };

        return recommendations[type] || 'Analyze further and develop targeted strategies';
    }

    // Utility functions
    dfToRowObjects(df) {
        return df.values.map(row => {
            const obj = {};
            df.columns.forEach((col, idx) => {
                obj[col] = row[idx];
            });
            return obj;
        });
    }

    aggregateByPeriod(dailyData, period) {
        const grouped = {};

        dailyData.forEach(day => {
            const date = new Date(day.date);
            let key;

            if (period === 'month') {
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            } else if (period === 'quarter') {
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                key = `${date.getFullYear()}-Q${quarter}`;
            }

            if (!grouped[key]) {
                grouped[key] = { total: 0, count: 0, dates: [] };
            }

            grouped[key].total += day.total;
            grouped[key].count += day.count;
            grouped[key].dates.push(day.date);
        });

        return Object.entries(grouped).map(([period, data]) => ({
            period,
            total: parseFloat(data.total.toFixed(2)),
            avg: parseFloat((data.total / data.count).toFixed(2)),
            transaction_count: data.count
        }));
    }

    // Main analysis function
    generateEnhancedInsights(df) {
        try {
            // Step 1: Detect columns
            const columns = this.detectColumns(df);
            console.log("Detected columns:", columns);

            // Step 2: Clean and validate data
            const cleanData = this.cleanAndValidateData(df, columns);

            // Step 3: Generate comprehensive insights
            const insights = {
                metadata: {
                    total_records: df.shape[0],
                    date_range: this.getDateRange(cleanData.date),
                    detected_columns: columns,
                    data_quality_score: this.calculateDataQuality(df, columns)
                },
                kpis: this.calculateAdvancedKPIs(cleanData, columns),
                performance: this.analyzePerformance(df, columns, cleanData),
                trends: this.analyzeTrends(df, columns, cleanData),
                customer: this.analyzeCustomers(df, columns, cleanData),
                outliers: this.detectOutliers(cleanData),
                correlations: this.calculateCorrelations(df, columns),
                hypotheses: []
            };

            // Step 4: Generate advanced hypotheses
            insights.hypotheses = this.generateAdvancedHypotheses(insights);

            return insights;

        } catch (error) {
            console.error("Error in enhanced insights generation:", error);
            return {
                error: error.message,
                stack: error.stack,
                metadata: { error: true },
                kpis: {},
                performance: { highPerformers: {}, lowPerformers: {}, insights: [] },
                trends: {},
                customer: {},
                outliers: {},
                correlations: {},
                hypotheses: []
            };
        }
    }

    getDateRange(dates) {
        if (!dates || dates.length === 0) return null;

        const validDates = dates.filter(d => d instanceof Date);
        if (validDates.length === 0) return null;

        const minDate = new Date(Math.min(...validDates));
        const maxDate = new Date(Math.max(...validDates));

        return {
            start: minDate.toISOString().split('T')[0],
            end: maxDate.toISOString().split('T')[0],
            days: Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
        };
    }

    calculateDataQuality(df, columns) {
        let score = 0;
        let maxScore = 0;

        // Check for essential columns
        const essentialCols = ['sales', 'date', 'category'];
        essentialCols.forEach(col => {
            maxScore += 20;
            if (columns[col]) score += 20;
        });

        // Check for data completeness
        Object.values(columns).forEach(colName => {
            if (colName && df.columns.includes(colName)) {
                maxScore += 10;
                const nullCount = df[colName].values.filter(v => v === null || v === undefined || v === '').length;
                const completeness = 1 - (nullCount / df.shape[0]);
                score += completeness * 10;
            }
        });

        return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    }

    detectOutliers(cleanData) {
        const outliers = {};

        ['sales', 'profit', 'quantity'].forEach(field => {
            if (cleanData[field]) {
                const fieldOutliers = detectOutliers(cleanData[field]);
                if (fieldOutliers.length > 0) {
                    outliers[field] = {
                        count: fieldOutliers.length,
                        values: fieldOutliers.slice(0, 5), // Show top 5 outliers
                        percentage: ((fieldOutliers.length / cleanData[field].length) * 100).toFixed(2)
                    };
                }
            }
        });

        return outliers;
    }

    calculateCorrelations(df, columns) {
        const correlations = {};
        const numericFields = ['quantity', 'unitPrice', 'sales', 'profit'];

        for (let i = 0; i < numericFields.length; i++) {
            for (let j = i + 1; j < numericFields.length; j++) {
                const field1 = numericFields[i];
                const field2 = numericFields[j];

                if (columns[field1] && columns[field2]) {
                    const corr = correlation(df, columns[field1], columns[field2]);
                    correlations[`${field1}_vs_${field2}`] = corr;
                }
            }
        }

        return correlations;
    }
}

// Export the enhanced insights function
function getEnhancedRetailInsights(df) {
    const analyzer = new EnhancedRetailInsights();
    return analyzer.generateEnhancedInsights(df);
}

module.exports = { getEnhancedRetailInsights, EnhancedRetailInsights };