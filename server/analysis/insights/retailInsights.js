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
        // Enhanced sections - keeping existing structure intact
        advanced_kpis: {},
        performance_metrics: {},
        seasonal_analysis: {},
        customer_segments: {},
        product_analysis: {},
        channel_analysis: {},
        profitability_analysis: {},
        risk_analysis: {},
        forecasting: {},
        recommendations: {},
        data_quality: {},
        outliers: {},
        correlations: {},
        benchmarks: {},
        alerts: []
    };

    df.columns = df.columns.map(col => col.trim());
    const normalize = str => str.toLowerCase().replace(/[^a-z0-9]/g, '');
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
    const numericCols = getNumericCols(df);
    const rawCols = {
        quantity: ['qty', 'quantity', 'units sold', 'unitsold', 'sold quantity', 'sold_qty', 'order quantity', 'order_qty', 'qty sold', 'quantity sold', 'units', 'pieces', 'count', 'items', 'volume', 'units_sold', 'item_count', 'product_quantity', 'order_units', 'sold_units', 'total_units', 'unit_count', 'item_qty', 'product_qty', 'order_qty_sold', 'transaction_qty', 'purchase_qty', 'sale_qty', 'inventory_sold', 'stock_sold'],
        unitPrice: ['unit price', 'unitprice', 'unit cost', 'unitcost', 'price', 'price per unit', 'rate', 'cost per item', 'item price', 'per_unit_price', 'single_price', 'individual_price', 'piece_price', 'unit_rate', 'item_rate', 'product_price', 'selling_price', 'list_price', 'retail_price', 'base_price', 'standard_price', 'regular_price', 'msrp', 'srp', 'unit_selling_price', 'price_per_piece', 'cost_per_piece', 'individual_cost', 'per_item_cost'],
        sales: ['total', 'amount', 'sales', 'sale', 'revenue', 'gross sale', 'net sale', 'invoice value', 'total revenue', 'totalamount', 'total price', 'total_price', 'order value', 'transaction_amount', 'sale_amount', 'gross_revenue', 'net_revenue', 'total_sales', 'sales_amount', 'revenue_total', 'invoice_total', 'order_total', 'transaction_total', 'billing_amount', 'charge_amount', 'payment_amount', 'receipt_total', 'purchase_amount', 'order_amount', 'sale_value', 'transaction_value', 'gross_amount', 'net_amount', 'subtotal', 'line_total'],
        profit: ['profit', 'gross profit', 'net profit', 'profit margin', 'profit ($)', 'profit amount', 'margin', 'earnings', 'net_profit', 'gross_profit', 'profit_amount', 'profit_value', 'margin_amount', 'contribution', 'contribution_margin', 'operating_profit', 'ebitda', 'net_earnings', 'profit_loss', 'pl', 'bottom_line', 'net_income', 'operating_income', 'gross_margin', 'profit_percentage', 'margin_percentage', 'profitability', 'return'],
        cost: ['cost', 'purchase cost', 'total cost', 'purchase price', 'cost per unit', 'unit cost', 'cogs', 'cost_of_goods_sold', 'product_cost', 'item_cost', 'acquisition_cost', 'procurement_cost', 'wholesale_cost', 'supplier_cost', 'vendor_cost', 'manufacturing_cost', 'production_cost', 'material_cost', 'direct_cost', 'variable_cost', 'unit_cogs', 'cost_price', 'buy_price', 'landed_cost', 'total_cogs', 'inventory_cost', 'stock_cost', 'purchase_value', 'cost_amount'],
        loss: ['loss', 'net loss', 'negative profit', 'deficit', 'shortfall', 'loss_amount', 'net_loss', 'operating_loss', 'gross_loss', 'financial_loss', 'revenue_loss', 'profit_loss', 'negative_margin', 'loss_value', 'deficit_amount', 'red_ink', 'negative_earnings', 'loss_total', 'write_off', 'impairment', 'markdown', 'shrinkage', 'wastage', 'spoilage', 'damage_cost', 'obsolescence', 'inventory_loss', 'stock_loss'],
        category: ['category', 'product', 'item', 'brand', 'segment', 'product category', 'sub category', 'subcategory', 'product name', 'item_category', 'product_type', 'item_type', 'product_line', 'product_family', 'brand_name', 'manufacturer', 'supplier', 'vendor', 'product_group', 'item_group', 'classification', 'type', 'kind', 'style', 'model', 'variant', 'sku_category', 'merchandise', 'goods', 'commodity', 'article', 'product_segment', 'business_unit', 'division', 'department'],
        region: ['region', 'area', 'zone', 'territory', 'location', 'market', 'sales channel', 'channel', 'geography', 'district', 'state', 'province', 'country', 'city', 'branch', 'store', 'outlet', 'warehouse', 'facility', 'site', 'office', 'hub', 'center', 'depot', 'distribution_center', 'sales_region', 'market_area', 'trade_area', 'catchment', 'territory_name', 'region_name', 'location_name', 'store_location', 'branch_location', 'sales_territory', 'market_segment', 'geographic_area'],
        date: ['date', 'order date', 'timestamp', 'sale date', 'datetime', 'transaction date', 'purchase_date', 'invoice_date', 'billing_date', 'payment_date', 'delivery_date', 'ship_date', 'created_date', 'modified_date', 'updated_date', 'processed_date', 'completed_date', 'closed_date', 'order_datetime', 'transaction_datetime', 'sale_datetime', 'purchase_datetime', 'time', 'period', 'fiscal_date', 'business_date', 'trade_date', 'settlement_date', 'value_date', 'effective_date', 'start_date', 'end_date', 'due_date'],
        customer: ['customer', 'customer id', 'client', 'user', 'customer name', 'client id', 'user id', 'order id', 'customer_id', 'client_id', 'user_id', 'order_id', 'account_id', 'member_id', 'subscriber_id', 'buyer_id', 'purchaser_id', 'consumer_id', 'patron_id', 'guest_id', 'visitor_id', 'contact_id', 'lead_id', 'prospect_id', 'account', 'member', 'subscriber', 'buyer', 'purchaser', 'consumer', 'patron', 'guest', 'visitor', 'contact', 'lead', 'prospect', 'customer_code', 'client_code', 'account_number', 'customer_number'],
        size: ['size', 'product size', 'item size', 'clothing_size', 'apparel_size', 'garment_size', 'shoe_size', 'footwear_size', 'dimension', 'measurement', 'scale', 'fit', 'cut', 'length', 'width', 'height', 'depth', 'diameter', 'circumference', 'capacity', 'volume', 'weight', 'mass', 'quantity_size', 'package_size', 'container_size', 'bottle_size', 'can_size', 'box_size', 'bag_size', 'pack_size', 'portion_size', 'serving_size'],
        returnFlag: ['return', 'returned', 'is return', 'is_return', 'returned (y/n)', 'return status', 'was returned', 'isreturned', 'return_flag', 'returned_flag', 'is_returned', 'return_indicator', 'refund', 'refunded', 'is_refund', 'refund_flag', 'exchange', 'exchanged', 'is_exchange', 'exchange_flag', 'cancelled', 'canceled', 'is_cancelled', 'cancel_flag', 'void', 'voided', 'is_void', 'void_flag', 'reversed', 'is_reversed', 'reversal_flag', 'chargeback', 'disputed', 'complaint'],
        promotionFlag: ['promo', 'discount', 'promotion', 'promotion applied (y/n)', 'is_discounted', 'discount applied', 'discountflag', 'promotion_flag', 'discount_flag', 'promo_flag', 'is_promotion', 'is_promo', 'has_discount', 'has_promotion', 'coupon', 'coupon_used', 'voucher', 'voucher_used', 'offer', 'offer_applied', 'deal', 'deal_applied', 'sale', 'on_sale', 'clearance', 'markdown', 'rebate', 'cashback', 'loyalty_discount', 'member_discount', 'bulk_discount', 'quantity_discount', 'seasonal_discount', 'promotional_price', 'special_offer', 'campaign', 'marketing_campaign']
    };

    const safeMatch = possible => {
        const normalizedCols = df.columns.map(normalize);
        const colMap = Object.fromEntries(df.columns.map((col, i) => [normalizedCols[i], col]));

        // Exact match first
        for (const alias of possible) {
            const norm = normalize(alias);
            if (colMap[norm]) return colMap[norm];
        }

        // Partial match (contains)
        for (const alias of possible) {
            const norm = normalize(alias);
            const partialMatch = Object.keys(colMap).find(col =>
                col.includes(norm) || norm.includes(col)
            );
            if (partialMatch) return colMap[partialMatch];
        }

        return undefined;
    };

    const colMatch = type => safeMatch(rawCols[type]);

    // Enhanced column detection with confidence scoring
    const detectColumnWithConfidence = (type) => {
        const possible = rawCols[type] || [];
        const normalizedCols = df.columns.map(col => ({ original: col, normalized: normalize(col) }));

        let bestMatch = null;
        let bestScore = 0;

        for (const alias of possible) {
            const normalizedAlias = normalize(alias);
            for (const col of normalizedCols) {
                let score = 0;

                // Exact match gets highest score
                if (col.normalized === normalizedAlias) {
                    score = 100;
                }
                // Contains match
                else if (col.normalized.includes(normalizedAlias)) {
                    score = 80;
                }
                // Reverse contains
                else if (normalizedAlias.includes(col.normalized)) {
                    score = 70;
                }
                // Fuzzy similarity (simple)
                else {
                    const similarity = calculateSimilarity(col.normalized, normalizedAlias);
                    if (similarity > 0.6) score = similarity * 60;
                }

                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = col.original;
                }
            }
        }

        return { column: bestMatch, confidence: bestScore };
    };

    const calculateSimilarity = (str1, str2) => {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        const editDistance = getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    };

    const getEditDistance = (str1, str2) => {
        const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));

        for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j - 1][i] + 1,
                    matrix[j][i - 1] + 1,
                    matrix[j - 1][i - 1] + cost
                );
            }
        }

        return matrix[str2.length][str1.length];
    };

    // Enhanced column detection with confidence scoring
    const columnDetection = {
        quantity: detectColumnWithConfidence("quantity"),
        unitPrice: detectColumnWithConfidence("unitPrice"),
        sales: detectColumnWithConfidence("sales"),
        profit: detectColumnWithConfidence("profit"),
        cost: detectColumnWithConfidence("cost"),
        loss: detectColumnWithConfidence("loss"),
        category: detectColumnWithConfidence("category"),
        region: detectColumnWithConfidence("region"),
        date: detectColumnWithConfidence("date"),
        customer: detectColumnWithConfidence("customer"),
        size: detectColumnWithConfidence("size"),
        returnFlag: detectColumnWithConfidence("returnFlag"),
        promotionFlag: detectColumnWithConfidence("promotionFlag")
    };

    // Store detection confidence for data quality assessment
    insights.data_quality.column_detection_confidence = {};
    Object.entries(columnDetection).forEach(([type, detection]) => {
        insights.data_quality.column_detection_confidence[type] = {
            column: detection.column,
            confidence: detection.confidence,
            detected: detection.confidence > 50
        };
    });

    // Column detection with fallbacks (keeping original structure)
    const quantityCol = columnDetection.quantity.column || colMatch("quantity") || numericCols[1];
    const unitPriceCol = columnDetection.unitPrice.column || colMatch("unitPrice") || numericCols[2];
    let salesCol = columnDetection.sales.column || colMatch("sales") || numericCols[3];
    let profitCol = columnDetection.profit.column || colMatch("profit") || numericCols[4];
    let costCol = columnDetection.cost.column || colMatch("cost") || numericCols[3];
    let lossCol = columnDetection.loss.column || colMatch("loss") || numericCols[6];
    const categoryCol = columnDetection.category.column || colMatch("category") || numericCols[7];
    const regionCol = columnDetection.region.column || colMatch("region") || numericCols[8];
    const dateCol = columnDetection.date.column || colMatch("date") || getFirstDateCol(df);
    const customerCol = columnDetection.customer.column || colMatch("customer") || getFirstNumericCol(df);
    const sizeCol = columnDetection.size.column || colMatch("size");
    const returnCol = columnDetection.returnFlag.column || colMatch("returnFlag") || numericCols[numericCols.length - 1];
    const promoCol = columnDetection.promotionFlag.column || colMatch("promotionFlag") || numericCols[numericCols.length - 2];

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
    const unitPriceVals = cleanNumeric(df[unitPriceCol]?.values || []);
    const costVals = cleanNumeric(df[costCol]?.values || []);

    // Enhanced data quality assessment
    const assessDataQuality = () => {
        const totalRecords = df.shape[0];
        let qualityScore = 0;
        let maxScore = 0;
        const issues = [];
        const metrics = {};

        // Essential columns presence (40% of score)
        const essentialCols = [
            { col: salesCol, name: 'sales', weight: 15 },
            { col: dateCol, name: 'date', weight: 10 },
            { col: categoryCol, name: 'category', weight: 8 },
            { col: customerCol, name: 'customer', weight: 7 }
        ];

        essentialCols.forEach(({ col, name, weight }) => {
            maxScore += weight;
            if (col && df.columns.includes(col)) {
                const nullCount = df[col].values.filter(v => v === null || v === undefined || v === '').length;
                const completeness = 1 - (nullCount / totalRecords);
                qualityScore += completeness * weight;
                metrics[`${name}_completeness`] = (completeness * 100).toFixed(2) + '%';

                if (completeness < 0.9) {
                    issues.push(`${name} column has ${((1 - completeness) * 100).toFixed(1)}% missing values`);
                }
            } else {
                issues.push(`${name} column not detected`);
            }
        });

        // Data consistency (30% of score)
        maxScore += 30;
        let consistencyScore = 0;

        // Check for negative values where they shouldn't be
        if (salesVals.length > 0) {
            const negativeCount = salesVals.filter(v => v < 0).length;
            if (negativeCount === 0) consistencyScore += 10;
            else issues.push(`${negativeCount} negative sales values found`);
        }

        if (quantityVals.length > 0) {
            const negativeQty = quantityVals.filter(v => v < 0).length;
            const zeroQty = quantityVals.filter(v => v === 0).length;
            if (negativeQty === 0) consistencyScore += 5;
            else issues.push(`${negativeQty} negative quantity values found`);

            if (zeroQty / quantityVals.length < 0.1) consistencyScore += 5;
            else issues.push(`${((zeroQty / quantityVals.length) * 100).toFixed(1)}% zero quantity transactions`);
        }

        // Date consistency
        if (dateCol && df.columns.includes(dateCol)) {
            const dates = df[dateCol].values.map(d => new Date(d)).filter(d => !isNaN(d.getTime()));
            if (dates.length > 0) {
                const sortedDates = dates.sort((a, b) => a - b);
                const dateRange = (sortedDates[sortedDates.length - 1] - sortedDates[0]) / (1000 * 60 * 60 * 24);
                consistencyScore += 10;
                metrics.date_range_days = Math.ceil(dateRange);

                if (dateRange > 365 * 3) {
                    issues.push('Data spans more than 3 years - consider time-based analysis');
                }
            }
        }

        qualityScore += consistencyScore;

        // Data richness (30% of score)
        maxScore += 30;
        let richnessScore = 0;

        const optionalCols = [profitCol, costCol, sizeCol, returnCol, promoCol];
        const detectedOptional = optionalCols.filter(col => col && df.columns.includes(col)).length;
        richnessScore += (detectedOptional / optionalCols.length) * 20;

        // Unique values diversity
        if (categoryCol && df.columns.includes(categoryCol)) {
            const uniqueCategories = new Set(df[categoryCol].values).size;
            if (uniqueCategories > 1) richnessScore += 5;
            metrics.unique_categories = uniqueCategories;
        }

        if (customerCol && df.columns.includes(customerCol)) {
            const uniqueCustomers = new Set(df[customerCol].values).size;
            const customerDiversity = uniqueCustomers / totalRecords;
            if (customerDiversity > 0.1) richnessScore += 5;
            metrics.unique_customers = uniqueCustomers;
            metrics.customer_diversity = (customerDiversity * 100).toFixed(2) + '%';
        }

        qualityScore += richnessScore;

        const finalScore = maxScore > 0 ? Math.round((qualityScore / maxScore) * 100) : 0;

        return {
            overall_score: finalScore,
            grade: finalScore >= 90 ? 'A' : finalScore >= 80 ? 'B' : finalScore >= 70 ? 'C' : finalScore >= 60 ? 'D' : 'F',
            total_records: totalRecords,
            issues: issues,
            metrics: metrics,
            recommendations: generateDataQualityRecommendations(finalScore, issues)
        };
    };

    const generateDataQualityRecommendations = (score, issues) => {
        const recommendations = [];

        if (score < 70) {
            recommendations.push('Consider data cleansing and validation processes');
        }

        if (issues.some(issue => issue.includes('missing values'))) {
            recommendations.push('Implement data completeness checks at source');
        }

        if (issues.some(issue => issue.includes('negative'))) {
            recommendations.push('Add data validation rules to prevent invalid values');
        }

        if (issues.some(issue => issue.includes('not detected'))) {
            recommendations.push('Standardize column naming conventions across data sources');
        }

        return recommendations;
    };

    insights.data_quality = { ...insights.data_quality, ...assessDataQuality() };

    // Core KPIs (keeping existing structure)
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

        // Advanced KPIs (new section)
        insights.advanced_kpis = {
            // Statistical measures
            sales_std_dev: Math.sqrt(salesVals.reduce((sum, val) => sum + Math.pow(val - safeMean(salesVals), 2), 0) / salesVals.length).toFixed(2),
            sales_variance: (salesVals.reduce((sum, val) => sum + Math.pow(val - safeMean(salesVals), 2), 0) / salesVals.length).toFixed(2),
            sales_coefficient_of_variation: safeMean(salesVals) > 0 ? ((Math.sqrt(salesVals.reduce((sum, val) => sum + Math.pow(val - safeMean(salesVals), 2), 0) / salesVals.length) / safeMean(salesVals)) * 100).toFixed(2) : 0,

            // Range measures
            sales_min: Math.min(...salesVals).toFixed(2),
            sales_max: Math.max(...salesVals).toFixed(2),
            sales_range: (Math.max(...salesVals) - Math.min(...salesVals)).toFixed(2),

            // Percentiles
            sales_25th_percentile: calculatePercentile(salesVals, 25).toFixed(2),
            sales_75th_percentile: calculatePercentile(salesVals, 75).toFixed(2),
            sales_90th_percentile: calculatePercentile(salesVals, 90).toFixed(2),

            // Business metrics
            total_transactions: df.shape[0],
            avg_items_per_transaction: quantityVals.length > 0 ? safeMean(quantityVals).toFixed(2) : 0,
            total_items_sold: quantityVals.length > 0 ? safeSum(quantityVals) : 0,

            // Profitability metrics
            profitable_transactions: profitVals.filter(p => p > 0).length,
            profitable_transaction_rate: ((profitVals.filter(p => p > 0).length / profitVals.length) * 100).toFixed(2),
            avg_profit_per_transaction: safeMean(profitVals).toFixed(2),
            profit_per_item: quantityVals.length > 0 && profitVals.length > 0 ? (safeSum(profitVals) / safeSum(quantityVals)).toFixed(2) : 0,

            // Revenue concentration
            revenue_concentration_top_10_percent: calculateRevenueConcentration(salesVals, 0.1).toFixed(2),
            revenue_concentration_top_20_percent: calculateRevenueConcentration(salesVals, 0.2).toFixed(2),

            // Growth indicators (if date available)
            ...(dateCol && calculateGrowthMetrics(df, dateCol, salesCol, salesVals))
        };

        // Performance metrics
        insights.performance_metrics = {
            sales_velocity: dateCol ? calculateSalesVelocity(df, dateCol, salesVals) : null,
            transaction_frequency: dateCol ? calculateTransactionFrequency(df, dateCol) : null,
            seasonal_index: dateCol ? calculateSeasonalIndex(df, dateCol, salesCol) : null,
            performance_consistency: calculatePerformanceConsistency(salesVals),
            efficiency_ratios: calculateEfficiencyRatios(salesVals, profitVals, costVals, quantityVals)
        };
    }

    // Helper functions for advanced calculations
    function calculatePercentile(arr, percentile) {
        const sorted = [...arr].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        const weight = index % 1;

        if (upper >= sorted.length) return sorted[sorted.length - 1];
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    function calculateRevenueConcentration(salesVals, topPercent) {
        const sorted = [...salesVals].sort((a, b) => b - a);
        const topCount = Math.ceil(sorted.length * topPercent);
        const topRevenue = sorted.slice(0, topCount).reduce((sum, val) => sum + val, 0);
        const totalRevenue = sorted.reduce((sum, val) => sum + val, 0);
        return totalRevenue > 0 ? (topRevenue / totalRevenue) * 100 : 0;
    }

    function calculateGrowthMetrics(df, dateCol, salesCol, salesVals) {
        try {
            const dateValues = df[dateCol].values.map(d => new Date(d)).filter(d => !isNaN(d.getTime()));
            if (dateValues.length < 2) return {};

            const sortedDates = dateValues.sort((a, b) => a - b);
            const dateRange = (sortedDates[sortedDates.length - 1] - sortedDates[0]) / (1000 * 60 * 60 * 24);

            // Simple growth calculation
            const firstPeriodSales = salesVals.slice(0, Math.ceil(salesVals.length / 4));
            const lastPeriodSales = salesVals.slice(-Math.ceil(salesVals.length / 4));

            const firstPeriodAvg = safeMean(firstPeriodSales);
            const lastPeriodAvg = safeMean(lastPeriodSales);

            const growthRate = firstPeriodAvg > 0 ? ((lastPeriodAvg - firstPeriodAvg) / firstPeriodAvg * 100) : 0;

            return {
                analysis_period_days: Math.ceil(dateRange),
                estimated_growth_rate_percent: growthRate.toFixed(2),
                daily_avg_sales: (safeSum(salesVals) / dateRange).toFixed(2)
            };
        } catch {
            return {};
        }
    }

    function calculateSalesVelocity(df, dateCol, salesVals) {
        try {
            const dates = df[dateCol].values.map(d => new Date(d)).filter(d => !isNaN(d.getTime()));
            if (dates.length < 2) return null;

            const sortedDates = dates.sort((a, b) => a - b);
            const daysDiff = (sortedDates[sortedDates.length - 1] - sortedDates[0]) / (1000 * 60 * 60 * 24);

            return {
                sales_per_day: (safeSum(salesVals) / daysDiff).toFixed(2),
                transactions_per_day: (salesVals.length / daysDiff).toFixed(2)
            };
        } catch {
            return null;
        }
    }

    function calculateTransactionFrequency(df, dateCol) {
        try {
            const dates = df[dateCol].values.map(d => new Date(d).toDateString());
            const dailyCounts = {};
            dates.forEach(date => {
                dailyCounts[date] = (dailyCounts[date] || 0) + 1;
            });

            const counts = Object.values(dailyCounts);
            return {
                avg_transactions_per_active_day: safeMean(counts).toFixed(2),
                max_transactions_per_day: Math.max(...counts),
                active_days: counts.length
            };
        } catch {
            return null;
        }
    }

    function calculateSeasonalIndex(df, dateCol, salesCol) {
        try {
            const monthlyData = {};

            for (let i = 0; i < df.shape[0]; i++) {
                const date = new Date(df[dateCol].values[i]);
                const sales = parseFloat(df[salesCol].values[i]) || 0;

                if (!isNaN(date.getTime())) {
                    const month = date.getMonth();
                    if (!monthlyData[month]) monthlyData[month] = [];
                    monthlyData[month].push(sales);
                }
            }

            const monthlyAvgs = {};
            Object.keys(monthlyData).forEach(month => {
                monthlyAvgs[month] = safeMean(monthlyData[month]);
            });

            const overallAvg = safeMean(Object.values(monthlyAvgs));
            const seasonalIndices = {};

            Object.keys(monthlyAvgs).forEach(month => {
                seasonalIndices[month] = overallAvg > 0 ? (monthlyAvgs[month] / overallAvg).toFixed(2) : 1;
            });

            return seasonalIndices;
        } catch {
            return null;
        }
    }

    function calculatePerformanceConsistency(salesVals) {
        if (salesVals.length < 2) return null;

        const mean = safeMean(salesVals);
        const stdDev = Math.sqrt(salesVals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / salesVals.length);

        return {
            consistency_score: mean > 0 ? ((1 - (stdDev / mean)) * 100).toFixed(2) : 0,
            volatility_level: stdDev / mean > 0.5 ? 'High' : stdDev / mean > 0.3 ? 'Medium' : 'Low'
        };
    }

    function calculateEfficiencyRatios(salesVals, profitVals, costVals, quantityVals) {
        const ratios = {};

        if (salesVals.length > 0 && profitVals.length > 0) {
            ratios.profit_to_sales_ratio = (safeSum(profitVals) / safeSum(salesVals)).toFixed(4);
        }

        if (salesVals.length > 0 && costVals.length > 0) {
            ratios.sales_to_cost_ratio = (safeSum(salesVals) / safeSum(costVals)).toFixed(4);
        }

        if (quantityVals.length > 0 && salesVals.length > 0) {
            ratios.revenue_per_unit = (safeSum(salesVals) / safeSum(quantityVals)).toFixed(2);
        }

        if (quantityVals.length > 0 && profitVals.length > 0) {
            ratios.profit_per_unit = (safeSum(profitVals) / safeSum(quantityVals)).toFixed(2);
        }

        return ratios;
    }

    // Top and low performers by category (keeping existing structure)
    if (categoryCol && salesCol) {
        const catGroup = groupByAndAggregate(df, categoryCol, salesCol, "sum");
        if (catGroup) {
            catGroup.sortValues(salesCol, { ascending: false, inplace: true });
            const json = dfToRowObjects(catGroup);
            insights.highPerformers.top_products = json.slice(0, 5);
            insights.lowPerformers.low_products = json.slice(-3);

            // Enhanced product analysis
            insights.product_analysis = {
                category_performance: json,
                category_metrics: calculateCategoryMetrics(df, categoryCol, salesCol, profitCol, quantityCol),
                product_diversity: {
                    total_categories: json.length,
                    category_concentration: calculateCategoryConcentration(json, salesCol),
                    performance_spread: calculatePerformanceSpread(json, salesCol)
                }
            };

            // Size analysis if available
            if (sizeCol && df.columns.includes(sizeCol)) {
                const sizeGroup = groupByAndAggregate(df, sizeCol, salesCol, "sum");
                if (sizeGroup) {
                    sizeGroup.sortValues(salesCol, { ascending: false, inplace: true });
                    insights.product_analysis.size_performance = dfToRowObjects(sizeGroup);
                }
            }
        }
    }

    function calculateCategoryMetrics(df, categoryCol, salesCol, profitCol, quantityCol) {
        const categories = {};

        for (let i = 0; i < df.shape[0]; i++) {
            const category = df[categoryCol].values[i];
            const sales = parseFloat(df[salesCol].values[i]) || 0;
            const profit = profitCol ? parseFloat(df[profitCol].values[i]) || 0 : 0;
            const quantity = quantityCol ? parseFloat(df[quantityCol].values[i]) || 0 : 0;

            if (!categories[category]) {
                categories[category] = {
                    sales: [],
                    profits: [],
                    quantities: [],
                    transactions: 0
                };
            }

            categories[category].sales.push(sales);
            categories[category].profits.push(profit);
            categories[category].quantities.push(quantity);
            categories[category].transactions++;
        }

        const metrics = {};
        Object.keys(categories).forEach(category => {
            const data = categories[category];
            metrics[category] = {
                total_sales: safeSum(data.sales).toFixed(2),
                avg_sales_per_transaction: safeMean(data.sales).toFixed(2),
                total_profit: safeSum(data.profits).toFixed(2),
                profit_margin: safeSum(data.sales) > 0 ? ((safeSum(data.profits) / safeSum(data.sales)) * 100).toFixed(2) : 0,
                total_quantity: safeSum(data.quantities),
                avg_quantity_per_transaction: safeMean(data.quantities).toFixed(2),
                transaction_count: data.transactions,
                sales_consistency: calculateConsistency(data.sales)
            };
        });

        return metrics;
    }

    function calculateCategoryConcentration(categoryData, salesCol) {
        const totalSales = categoryData.reduce((sum, cat) => sum + parseFloat(cat[salesCol] || 0), 0);
        const topCategory = categoryData[0];
        const top3Sales = categoryData.slice(0, 3).reduce((sum, cat) => sum + parseFloat(cat[salesCol] || 0), 0);

        return {
            top_category_share: totalSales > 0 ? ((parseFloat(topCategory[salesCol]) / totalSales) * 100).toFixed(2) : 0,
            top_3_categories_share: totalSales > 0 ? ((top3Sales / totalSales) * 100).toFixed(2) : 0,
            herfindahl_index: calculateHerfindahlIndex(categoryData, salesCol, totalSales)
        };
    }

    function calculatePerformanceSpread(categoryData, salesCol) {
        const sales = categoryData.map(cat => parseFloat(cat[salesCol] || 0));
        const max = Math.max(...sales);
        const min = Math.min(...sales);
        const mean = safeMean(sales);

        return {
            performance_ratio: min > 0 ? (max / min).toFixed(2) : 'N/A',
            performance_gap: (max - min).toFixed(2),
            coefficient_of_variation: mean > 0 ? ((Math.sqrt(sales.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / sales.length) / mean) * 100).toFixed(2) : 0
        };
    }

    function calculateHerfindahlIndex(categoryData, salesCol, totalSales) {
        if (totalSales === 0) return 0;

        const hhi = categoryData.reduce((sum, cat) => {
            const share = parseFloat(cat[salesCol] || 0) / totalSales;
            return sum + (share * share);
        }, 0);

        return (hhi * 10000).toFixed(0); // Convert to standard HHI scale
    }

    function calculateConsistency(values) {
        if (values.length < 2) return 'N/A';

        const mean = safeMean(values);
        const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);
        const cv = mean > 0 ? stdDev / mean : 0;

        return cv < 0.3 ? 'High' : cv < 0.6 ? 'Medium' : 'Low';
    }

    // Region performance
    if (regionCol && salesCol) {
        const regGroup = groupByAndAggregate(df, regionCol, salesCol, "sum");
        if (regGroup) {
            insights.totals.sales_by_region = dfToRowObjects(regGroup);
        }
    }

    // Enhanced sales trends over time (keeping existing structure)
    if (salesCol && dateCol) {
        try {
            const trend = trendAnalysis(df, dateCol, salesCol);
            if (trend?.length) {
                insights.trends.daily = trend;

                // Enhanced seasonal analysis
                insights.seasonal_analysis = {
                    monthly_patterns: calculateMonthlyPatterns(df, dateCol, salesCol),
                    weekly_patterns: calculateWeeklyPatterns(df, dateCol, salesCol),
                    seasonal_indices: calculateSeasonalIndices(df, dateCol, salesCol),
                    trend_decomposition: decomposeTrend(trend),
                    peak_periods: identifyPeakPeriods(trend),
                    cyclical_patterns: identifyCyclicalPatterns(trend)
                };

                // Enhanced forecasting
                insights.forecasting = {
                    trend_forecast: generateTrendForecast(trend),
                    seasonal_forecast: generateSeasonalForecast(df, dateCol, salesCol),
                    confidence_intervals: calculateForecastConfidence(trend),
                    forecast_accuracy_metrics: calculateForecastAccuracy(trend)
                };
            }
        } catch { }
    }

    function calculateMonthlyPatterns(df, dateCol, salesCol) {
        const monthlyData = {};
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let i = 0; i < df.shape[0]; i++) {
            const date = new Date(df[dateCol].values[i]);
            const sales = parseFloat(df[salesCol].values[i]) || 0;

            if (!isNaN(date.getTime())) {
                const month = date.getMonth();
                if (!monthlyData[month]) monthlyData[month] = [];
                monthlyData[month].push(sales);
            }
        }

        const patterns = [];
        for (let month = 0; month < 12; month++) {
            const data = monthlyData[month] || [];
            patterns.push({
                month: monthNames[month],
                month_number: month + 1,
                avg_sales: data.length > 0 ? safeMean(data).toFixed(2) : 0,
                total_sales: data.length > 0 ? safeSum(data).toFixed(2) : 0,
                transaction_count: data.length,
                sales_variance: data.length > 1 ? (data.reduce((sum, val) => sum + Math.pow(val - safeMean(data), 2), 0) / data.length).toFixed(2) : 0
            });
        }

        return patterns;
    }

    function calculateWeeklyPatterns(df, dateCol, salesCol) {
        const weeklyData = {};
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (let i = 0; i < df.shape[0]; i++) {
            const date = new Date(df[dateCol].values[i]);
            const sales = parseFloat(df[salesCol].values[i]) || 0;

            if (!isNaN(date.getTime())) {
                const dayOfWeek = date.getDay();
                if (!weeklyData[dayOfWeek]) weeklyData[dayOfWeek] = [];
                weeklyData[dayOfWeek].push(sales);
            }
        }

        const patterns = [];
        for (let day = 0; day < 7; day++) {
            const data = weeklyData[day] || [];
            patterns.push({
                day: dayNames[day],
                day_number: day,
                avg_sales: data.length > 0 ? safeMean(data).toFixed(2) : 0,
                total_sales: data.length > 0 ? safeSum(data).toFixed(2) : 0,
                transaction_count: data.length
            });
        }

        return patterns;
    }

    function calculateSeasonalIndices(df, dateCol, salesCol) {
        const quarterlyData = { Q1: [], Q2: [], Q3: [], Q4: [] };

        for (let i = 0; i < df.shape[0]; i++) {
            const date = new Date(df[dateCol].values[i]);
            const sales = parseFloat(df[salesCol].values[i]) || 0;

            if (!isNaN(date.getTime())) {
                const month = date.getMonth();
                const quarter = Math.floor(month / 3);
                const quarterKey = `Q${quarter + 1}`;
                quarterlyData[quarterKey].push(sales);
            }
        }

        const overallAvg = safeMean([
            ...quarterlyData.Q1, ...quarterlyData.Q2,
            ...quarterlyData.Q3, ...quarterlyData.Q4
        ]);

        const indices = {};
        Object.keys(quarterlyData).forEach(quarter => {
            const quarterAvg = safeMean(quarterlyData[quarter]);
            indices[quarter] = {
                avg_sales: quarterAvg.toFixed(2),
                seasonal_index: overallAvg > 0 ? (quarterAvg / overallAvg).toFixed(3) : 1,
                interpretation: quarterAvg > overallAvg ? 'Above Average' : quarterAvg < overallAvg ? 'Below Average' : 'Average'
            };
        });

        return indices;
    }

    function decomposeTrend(trendData) {
        if (trendData.length < 4) return null;

        const values = trendData.map(d => d.total);
        const movingAvg = calculateMovingAverage(values, 4);

        return {
            original_data_points: trendData.length,
            trend_direction: determineTrendDirection(movingAvg),
            trend_strength: calculateTrendStrength(values),
            volatility: calculateVolatility(values),
            moving_average_4_period: movingAvg.slice(-5) // Last 5 points
        };
    }

    function calculateMovingAverage(values, period) {
        const movingAvg = [];
        for (let i = period - 1; i < values.length; i++) {
            const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            movingAvg.push((sum / period).toFixed(2));
        }
        return movingAvg;
    }

    function determineTrendDirection(movingAvg) {
        if (movingAvg.length < 2) return 'Insufficient Data';

        const first = parseFloat(movingAvg[0]);
        const last = parseFloat(movingAvg[movingAvg.length - 1]);
        const change = ((last - first) / first) * 100;

        if (change > 5) return 'Strong Upward';
        if (change > 1) return 'Upward';
        if (change < -5) return 'Strong Downward';
        if (change < -1) return 'Downward';
        return 'Stable';
    }

    function calculateTrendStrength(values) {
        if (values.length < 2) return 0;

        const x = values.map((_, i) => i);
        const y = values;
        const n = values.length;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Calculate R-squared
        const yMean = sumY / n;
        const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
        const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
        const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

        return {
            slope: slope.toFixed(4),
            r_squared: rSquared.toFixed(4),
            strength: rSquared > 0.7 ? 'Strong' : rSquared > 0.4 ? 'Moderate' : 'Weak'
        };
    }

    function calculateVolatility(values) {
        if (values.length < 2) return 0;

        const returns = [];
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1] > 0) {
                returns.push((values[i] - values[i - 1]) / values[i - 1]);
            }
        }

        if (returns.length === 0) return 0;

        const meanReturn = safeMean(returns);
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance);

        return {
            volatility_percentage: (volatility * 100).toFixed(2),
            volatility_level: volatility > 0.3 ? 'High' : volatility > 0.15 ? 'Medium' : 'Low'
        };
    }

    function identifyPeakPeriods(trendData) {
        if (trendData.length < 3) return [];

        const peaks = [];
        const values = trendData.map(d => d.total);
        const threshold = safeMean(values) * 1.2; // 20% above average

        for (let i = 1; i < values.length - 1; i++) {
            if (values[i] > values[i - 1] && values[i] > values[i + 1] && values[i] > threshold) {
                peaks.push({
                    date: trendData[i].date,
                    value: values[i].toFixed(2),
                    percentage_above_average: (((values[i] / safeMean(values)) - 1) * 100).toFixed(2)
                });
            }
        }

        return peaks.slice(0, 10); // Top 10 peaks
    }

    function identifyCyclicalPatterns(trendData) {
        if (trendData.length < 12) return null;

        const values = trendData.map(d => d.total);
        const cycles = [];

        // Simple cycle detection - look for recurring patterns
        for (let period = 7; period <= Math.floor(values.length / 3); period++) {
            const correlation = calculateAutocorrelation(values, period);
            if (correlation > 0.3) {
                cycles.push({
                    period_days: period,
                    correlation: correlation.toFixed(3),
                    pattern_type: period === 7 ? 'Weekly' : period === 30 ? 'Monthly' : period === 90 ? 'Quarterly' : 'Custom'
                });
            }
        }

        return cycles.length > 0 ? cycles : null;
    }

    function calculateAutocorrelation(values, lag) {
        if (values.length <= lag) return 0;

        const n = values.length - lag;
        const mean = safeMean(values);

        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < n; i++) {
            numerator += (values[i] - mean) * (values[i + lag] - mean);
        }

        for (let i = 0; i < values.length; i++) {
            denominator += Math.pow(values[i] - mean, 2);
        }

        return denominator > 0 ? numerator / denominator : 0;
    }

    function generateTrendForecast(trendData) {
        if (trendData.length < 5) return null;

        const values = trendData.map(d => d.total);
        const recentTrend = values.slice(-Math.min(10, values.length));
        const avgGrowth = calculateAverageGrowthRate(recentTrend);

        const lastValue = values[values.length - 1];
        const forecasts = [];

        for (let i = 1; i <= 7; i++) { // 7-day forecast
            const forecastValue = lastValue * Math.pow(1 + avgGrowth, i);
            forecasts.push({
                period: i,
                forecast_value: forecastValue.toFixed(2),
                confidence: Math.max(0.5, 0.9 - (i * 0.05)) // Decreasing confidence
            });
        }

        return {
            forecasts: forecasts,
            methodology: 'Exponential Growth',
            avg_growth_rate: (avgGrowth * 100).toFixed(2) + '%'
        };
    }

    function calculateAverageGrowthRate(values) {
        if (values.length < 2) return 0;

        const growthRates = [];
        for (let i = 1; i < values.length; i++) {
            if (values[i - 1] > 0) {
                growthRates.push((values[i] - values[i - 1]) / values[i - 1]);
            }
        }

        return growthRates.length > 0 ? safeMean(growthRates) : 0;
    }

    function generateSeasonalForecast(df, dateCol, salesCol) {
        // This would implement seasonal forecasting based on historical patterns
        // For now, return a placeholder structure
        return {
            next_month_forecast: 'Requires more historical data',
            seasonal_adjustment_factor: 1.0,
            methodology: 'Seasonal Decomposition'
        };
    }

    function calculateForecastConfidence(trendData) {
        const values = trendData.map(d => d.total);
        const volatility = calculateVolatility(values);

        return {
            base_confidence: '75%',
            volatility_adjustment: volatility.volatility_level,
            confidence_note: 'Confidence decreases with forecast horizon'
        };
    }

    function calculateForecastAccuracy(trendData) {
        // This would calculate accuracy metrics if we had actual vs predicted data
        return {
            mae: 'Not available - requires historical forecasts',
            mape: 'Not available - requires historical forecasts',
            rmse: 'Not available - requires historical forecasts'
        };
    }

    // Enhanced customer analysis (keeping existing structure)
    if (customerCol) {
        const freq = {};
        const customerData = {};

        // Build customer profiles
        for (let i = 0; i < df.shape[0]; i++) {
            const customerId = df[customerCol].values[i];
            const sales = parseFloat(df[salesCol].values[i]) || 0;
            const profit = profitCol ? parseFloat(df[profitCol].values[i]) || 0 : 0;
            const quantity = quantityCol ? parseFloat(df[quantityCol].values[i]) || 0 : 0;
            const date = dateCol ? new Date(df[dateCol].values[i]) : null;

            freq[customerId] = (freq[customerId] || 0) + 1;

            if (!customerData[customerId]) {
                customerData[customerId] = {
                    transactions: 0,
                    totalSales: 0,
                    totalProfit: 0,
                    totalQuantity: 0,
                    salesHistory: [],
                    dates: []
                };
            }

            customerData[customerId].transactions++;
            customerData[customerId].totalSales += sales;
            customerData[customerId].totalProfit += profit;
            customerData[customerId].totalQuantity += quantity;
            customerData[customerId].salesHistory.push(sales);
            if (date && !isNaN(date.getTime())) {
                customerData[customerId].dates.push(date);
            }
        }

        // Original frequent customers (keeping existing)
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5)
            .map(([customer, purchases]) => ({ customer, purchases }));
        insights.customer.frequent_customers = top;

        // Enhanced customer segments
        insights.customer_segments = {
            rfm_analysis: calculateRFMAnalysis(customerData, dateCol),
            customer_lifetime_value: calculateCustomerLTV(customerData),
            customer_behavior_patterns: analyzeCustomerBehavior(customerData),
            customer_distribution: analyzeCustomerDistribution(customerData),
            churn_risk_analysis: dateCol ? analyzeChurnRisk(customerData) : null
        };
    }

    function calculateRFMAnalysis(customerData, dateCol) {
        if (!dateCol) return null;

        const customers = Object.keys(customerData);
        const rfmData = [];
        const currentDate = new Date();

        customers.forEach(customerId => {
            const data = customerData[customerId];
            const dates = data.dates.filter(d => !isNaN(d.getTime()));

            if (dates.length === 0) return;

            // Recency (days since last purchase)
            const lastPurchase = new Date(Math.max(...dates));
            const recency = Math.floor((currentDate - lastPurchase) / (1000 * 60 * 60 * 24));

            // Frequency (number of transactions)
            const frequency = data.transactions;

            // Monetary (total sales)
            const monetary = data.totalSales;

            rfmData.push({
                customer_id: customerId,
                recency: recency,
                frequency: frequency,
                monetary: monetary.toFixed(2),
                avg_order_value: (monetary / frequency).toFixed(2)
            });
        });

        // Calculate RFM scores and segments
        const rfmWithScores = rfmData.map(customer => {
            const rScore = calculateRFMScore(customer.recency, rfmData.map(c => c.recency), true); // Lower is better for recency
            const fScore = calculateRFMScore(customer.frequency, rfmData.map(c => c.frequency), false);
            const mScore = calculateRFMScore(customer.monetary, rfmData.map(c => c.monetary), false);

            const segment = determineRFMSegment(rScore, fScore, mScore);

            return {
                ...customer,
                r_score: rScore,
                f_score: fScore,
                m_score: mScore,
                rfm_segment: segment
            };
        });

        // Segment summary
        const segmentSummary = {};
        rfmWithScores.forEach(customer => {
            const segment = customer.rfm_segment;
            if (!segmentSummary[segment]) {
                segmentSummary[segment] = { count: 0, total_value: 0 };
            }
            segmentSummary[segment].count++;
            segmentSummary[segment].total_value += parseFloat(customer.monetary);
        });

        return {
            customer_rfm_scores: rfmWithScores.slice(0, 10), // Top 10 for display
            segment_summary: segmentSummary,
            total_customers_analyzed: rfmWithScores.length
        };
    }

    function calculateRFMScore(value, allValues, lowerIsBetter) {
        const sorted = [...allValues].sort((a, b) => lowerIsBetter ? a - b : b - a);
        const quintileSize = Math.ceil(sorted.length / 5);

        for (let i = 1; i <= 5; i++) {
            const threshold = sorted[quintileSize * i - 1];
            if (lowerIsBetter ? value <= threshold : value >= threshold) {
                return i;
            }
        }
        return 1;
    }

    function determineRFMSegment(r, f, m) {
        if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
        if (r >= 3 && f >= 3 && m >= 3) return 'Loyal Customers';
        if (r >= 4 && f <= 2) return 'New Customers';
        if (r >= 3 && f >= 3 && m <= 2) return 'Potential Loyalists';
        if (r >= 3 && f <= 2 && m >= 3) return 'Big Spenders';
        if (r <= 2 && f >= 3 && m >= 3) return 'At Risk';
        if (r <= 2 && f >= 4 && m <= 2) return 'Cannot Lose Them';
        if (r <= 2 && f <= 2) return 'Lost';
        return 'Others';
    }

    function calculateCustomerLTV(customerData) {
        const customers = Object.keys(customerData);
        const ltvData = [];

        customers.forEach(customerId => {
            const data = customerData[customerId];
            const avgOrderValue = data.totalSales / data.transactions;
            const avgProfit = data.totalProfit / data.transactions;

            // Simple LTV calculation (can be enhanced with more sophisticated models)
            const estimatedLifetimeValue = avgOrderValue * data.transactions * 2; // Assuming 2x current behavior
            const estimatedLifetimeProfit = avgProfit * data.transactions * 2;

            ltvData.push({
                customer_id: customerId,
                current_value: data.totalSales.toFixed(2),
                estimated_ltv: estimatedLifetimeValue.toFixed(2),
                estimated_lifetime_profit: estimatedLifetimeProfit.toFixed(2),
                avg_order_value: avgOrderValue.toFixed(2),
                transaction_count: data.transactions
            });
        });

        // Sort by estimated LTV
        ltvData.sort((a, b) => parseFloat(b.estimated_ltv) - parseFloat(a.estimated_ltv));

        return {
            top_value_customers: ltvData.slice(0, 10),
            avg_customer_ltv: safeMean(ltvData.map(c => parseFloat(c.estimated_ltv))).toFixed(2),
            total_estimated_portfolio_value: ltvData.reduce((sum, c) => sum + parseFloat(c.estimated_ltv), 0).toFixed(2)
        };
    }

    function analyzeCustomerBehavior(customerData) {
        const customers = Object.keys(customerData);
        const behaviorMetrics = {
            single_purchase_customers: 0,
            repeat_customers: 0,
            high_value_customers: 0,
            consistent_customers: 0
        };

        const orderValues = [];
        const transactionCounts = [];

        customers.forEach(customerId => {
            const data = customerData[customerId];
            const avgOrderValue = data.totalSales / data.transactions;

            orderValues.push(avgOrderValue);
            transactionCounts.push(data.transactions);

            if (data.transactions === 1) behaviorMetrics.single_purchase_customers++;
            if (data.transactions > 1) behaviorMetrics.repeat_customers++;
            if (avgOrderValue > safeMean(orderValues) * 1.5) behaviorMetrics.high_value_customers++;

            // Consistency check (low variance in order values)
            if (data.salesHistory.length > 1) {
                const variance = data.salesHistory.reduce((sum, val) => sum + Math.pow(val - avgOrderValue, 2), 0) / data.salesHistory.length;
                const cv = Math.sqrt(variance) / avgOrderValue;
                if (cv < 0.3) behaviorMetrics.consistent_customers++;
            }
        });

        return {
            ...behaviorMetrics,
            repeat_customer_rate: ((behaviorMetrics.repeat_customers / customers.length) * 100).toFixed(2),
            avg_transactions_per_customer: safeMean(transactionCounts).toFixed(2),
            avg_order_value_across_customers: safeMean(orderValues).toFixed(2)
        };
    }

    function analyzeCustomerDistribution(customerData) {
        const customers = Object.keys(customerData);
        const salesDistribution = customers.map(id => customerData[id].totalSales);
        const transactionDistribution = customers.map(id => customerData[id].transactions);

        return {
            total_customers: customers.length,
            sales_distribution: {
                min: Math.min(...salesDistribution).toFixed(2),
                max: Math.max(...salesDistribution).toFixed(2),
                avg: safeMean(salesDistribution).toFixed(2),
                median: safeMedian(salesDistribution).toFixed(2)
            },
            transaction_distribution: {
                min: Math.min(...transactionDistribution),
                max: Math.max(...transactionDistribution),
                avg: safeMean(transactionDistribution).toFixed(2),
                median: safeMedian(transactionDistribution).toFixed(2)
            },
            pareto_analysis: {
                top_20_percent_customers: Math.ceil(customers.length * 0.2),
                top_20_percent_revenue_share: calculateTop20PercentShare(salesDistribution)
            }
        };
    }

    function calculateTop20PercentShare(salesDistribution) {
        const sorted = [...salesDistribution].sort((a, b) => b - a);
        const top20Count = Math.ceil(sorted.length * 0.2);
        const top20Revenue = sorted.slice(0, top20Count).reduce((sum, val) => sum + val, 0);
        const totalRevenue = sorted.reduce((sum, val) => sum + val, 0);

        return totalRevenue > 0 ? ((top20Revenue / totalRevenue) * 100).toFixed(2) : 0;
    }

    function analyzeChurnRisk(customerData) {
        const customers = Object.keys(customerData);
        const currentDate = new Date();
        const churnRiskCustomers = [];

        customers.forEach(customerId => {
            const data = customerData[customerId];
            const dates = data.dates.filter(d => !isNaN(d.getTime()));

            if (dates.length === 0) return;

            const lastPurchase = new Date(Math.max(...dates));
            const daysSinceLastPurchase = Math.floor((currentDate - lastPurchase) / (1000 * 60 * 60 * 24));

            // Calculate average days between purchases
            if (dates.length > 1) {
                const sortedDates = dates.sort((a, b) => a - b);
                const intervals = [];
                for (let i = 1; i < sortedDates.length; i++) {
                    intervals.push((sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24));
                }
                const avgInterval = safeMean(intervals);

                // Risk assessment
                let riskLevel = 'Low';
                if (daysSinceLastPurchase > avgInterval * 2) riskLevel = 'High';
                else if (daysSinceLastPurchase > avgInterval * 1.5) riskLevel = 'Medium';

                if (riskLevel !== 'Low') {
                    churnRiskCustomers.push({
                        customer_id: customerId,
                        days_since_last_purchase: daysSinceLastPurchase,
                        avg_purchase_interval: avgInterval.toFixed(1),
                        risk_level: riskLevel,
                        total_value: data.totalSales.toFixed(2),
                        transaction_count: data.transactions
                    });
                }
            }
        });

        return {
            at_risk_customers: churnRiskCustomers.sort((a, b) => parseFloat(b.total_value) - parseFloat(a.total_value)).slice(0, 20),
            churn_risk_summary: {
                high_risk: churnRiskCustomers.filter(c => c.risk_level === 'High').length,
                medium_risk: churnRiskCustomers.filter(c => c.risk_level === 'Medium').length,
                total_at_risk_value: churnRiskCustomers.reduce((sum, c) => sum + parseFloat(c.total_value), 0).toFixed(2)
            }
        };
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

    // Enhanced hypothesis generation (keeping existing structure)
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

    // Advanced hypothesis and recommendations generation
    insights.recommendations = generateAdvancedRecommendations(insights, {
        salesVals, profitVals, quantityVals,
        categoryCol, regionCol, dateCol, customerCol, sizeCol
    });

    // Risk analysis
    insights.risk_analysis = {
        revenue_concentration_risk: assessRevenueConcentrationRisk(insights),
        customer_concentration_risk: assessCustomerConcentrationRisk(insights),
        seasonal_dependency_risk: assessSeasonalDependencyRisk(insights),
        profitability_risk: assessProfitabilityRisk(insights),
        inventory_risk: assessInventoryRisk(insights)
    };

    // Outlier detection
    insights.outliers = {
        sales_outliers: detectSalesOutliers(salesVals),
        profit_outliers: profitVals.length > 0 ? detectSalesOutliers(profitVals) : null,
        quantity_outliers: quantityVals.length > 0 ? detectSalesOutliers(quantityVals) : null
    };

    // Correlation analysis
    insights.correlations = calculateCorrelations({
        sales: salesVals,
        profit: profitVals,
        quantity: quantityVals,
        unitPrice: unitPriceVals
    });

    // Performance benchmarks
    insights.benchmarks = calculatePerformanceBenchmarks(insights);

    // Automated alerts
    insights.alerts = generateAutomatedAlerts(insights);

    function generateAdvancedRecommendations(insights, data) {
        const recommendations = {
            strategic: [],
            operational: [],
            tactical: [],
            priority_actions: []
        };

        // Strategic recommendations
        if (insights.advanced_kpis?.sales_coefficient_of_variation > 50) {
            recommendations.strategic.push({
                category: 'Revenue Stability',
                recommendation: 'High sales volatility detected. Consider diversifying product mix or customer base to reduce revenue fluctuations.',
                impact: 'High',
                effort: 'Medium',
                timeline: '3-6 months'
            });
        }

        if (insights.customer_segments?.rfm_analysis?.segment_summary?.Champions?.count < insights.customer_segments?.rfm_analysis?.total_customers_analyzed * 0.1) {
            recommendations.strategic.push({
                category: 'Customer Loyalty',
                recommendation: 'Low percentage of champion customers. Implement loyalty programs and customer retention strategies.',
                impact: 'High',
                effort: 'Medium',
                timeline: '2-4 months'
            });
        }

        // Operational recommendations
        if (insights.product_analysis?.category_performance) {
            const topCategory = insights.product_analysis.category_performance[0];
            const bottomCategory = insights.product_analysis.category_performance[insights.product_analysis.category_performance.length - 1];

            if (topCategory && bottomCategory) {
                const performanceRatio = parseFloat(topCategory[data.categoryCol]) / parseFloat(bottomCategory[data.categoryCol]);
                if (performanceRatio > 3) {
                    recommendations.operational.push({
                        category: 'Inventory Management',
                        recommendation: `Focus inventory investment on high-performing category "${topCategory[data.categoryCol]}" and consider reducing stock of "${bottomCategory[data.categoryCol]}".`,
                        impact: 'Medium',
                        effort: 'Low',
                        timeline: '1-2 months'
                    });
                }
            }
        }

        if (insights.seasonal_analysis?.seasonal_indices) {
            const peakSeason = Object.entries(insights.seasonal_analysis.seasonal_indices)
                .reduce((max, [season, data]) =>
                    parseFloat(data.seasonal_index) > parseFloat(max.index) ?
                        { season, index: data.seasonal_index } : max,
                    { season: '', index: 0 }
                );

            if (parseFloat(peakSeason.index) > 1.2) {
                recommendations.operational.push({
                    category: 'Seasonal Planning',
                    recommendation: `${peakSeason.season} shows 20%+ higher sales. Increase inventory and marketing spend during this period.`,
                    impact: 'Medium',
                    effort: 'Low',
                    timeline: 'Next season'
                });
            }
        }

        // Tactical recommendations
        if (insights.advanced_kpis?.profitable_transaction_rate < 90) {
            recommendations.tactical.push({
                category: 'Pricing Optimization',
                recommendation: 'Some transactions are unprofitable. Review pricing strategy and cost structure.',
                impact: 'Medium',
                effort: 'Medium',
                timeline: '2-4 weeks'
            });
        }

        if (insights.customer_segments?.customer_behavior_patterns?.single_purchase_customers > insights.customer_segments?.customer_behavior_patterns?.repeat_customers) {
            recommendations.tactical.push({
                category: 'Customer Retention',
                recommendation: 'High single-purchase customer ratio. Implement follow-up campaigns and retention strategies.',
                impact: 'Medium',
                effort: 'Low',
                timeline: '2-6 weeks'
            });
        }

        // Priority actions based on impact and urgency
        const allRecommendations = [
            ...recommendations.strategic,
            ...recommendations.operational,
            ...recommendations.tactical
        ];

        recommendations.priority_actions = allRecommendations
            .filter(rec => rec.impact === 'High')
            .sort((a, b) => {
                const effortOrder = { 'Low': 1, 'Medium': 2, 'High': 3 };
                return effortOrder[a.effort] - effortOrder[b.effort];
            })
            .slice(0, 5);

        return recommendations;
    }

    function assessRevenueConcentrationRisk(insights) {
        const topCategoryShare = insights.product_analysis?.category_diversity?.category_concentration?.top_category_share || 0;
        const hhi = insights.product_analysis?.category_diversity?.category_concentration?.herfindahl_index || 0;

        let riskLevel = 'Low';
        let riskScore = 0;

        if (parseFloat(topCategoryShare) > 60) {
            riskLevel = 'High';
            riskScore = 80;
        } else if (parseFloat(topCategoryShare) > 40) {
            riskLevel = 'Medium';
            riskScore = 60;
        } else {
            riskScore = 30;
        }

        return {
            risk_level: riskLevel,
            risk_score: riskScore,
            top_category_dependency: topCategoryShare + '%',
            herfindahl_index: hhi,
            recommendation: riskLevel === 'High' ? 'Diversify product portfolio' : 'Monitor concentration levels'
        };
    }

    function assessCustomerConcentrationRisk(insights) {
        const top20Share = insights.customer_segments?.customer_distribution?.pareto_analysis?.top_20_percent_revenue_share || 0;

        let riskLevel = 'Low';
        let riskScore = 0;

        if (parseFloat(top20Share) > 80) {
            riskLevel = 'High';
            riskScore = 85;
        } else if (parseFloat(top20Share) > 60) {
            riskLevel = 'Medium';
            riskScore = 65;
        } else {
            riskScore = 35;
        }

        return {
            risk_level: riskLevel,
            risk_score: riskScore,
            top_20_percent_share: top20Share + '%',
            recommendation: riskLevel === 'High' ? 'Expand customer base' : 'Maintain customer diversity'
        };
    }

    function assessSeasonalDependencyRisk(insights) {
        const seasonalIndices = insights.seasonal_analysis?.seasonal_indices || {};
        const indices = Object.values(seasonalIndices).map(s => parseFloat(s.seasonal_index || 1));

        if (indices.length === 0) return { risk_level: 'Unknown', risk_score: 0 };

        const maxIndex = Math.max(...indices);
        const minIndex = Math.min(...indices);
        const seasonalVariation = maxIndex - minIndex;

        let riskLevel = 'Low';
        let riskScore = 0;

        if (seasonalVariation > 0.8) {
            riskLevel = 'High';
            riskScore = 75;
        } else if (seasonalVariation > 0.4) {
            riskLevel = 'Medium';
            riskScore = 50;
        } else {
            riskScore = 25;
        }

        return {
            risk_level: riskLevel,
            risk_score: riskScore,
            seasonal_variation: seasonalVariation.toFixed(2),
            recommendation: riskLevel === 'High' ? 'Develop counter-seasonal products' : 'Monitor seasonal patterns'
        };
    }

    function assessProfitabilityRisk(insights) {
        const profitMargin = parseFloat(insights.kpis?.profit_margin_percent || 0);
        const profitableRate = parseFloat(insights.advanced_kpis?.profitable_transaction_rate || 100);

        let riskLevel = 'Low';
        let riskScore = 0;

        if (profitMargin < 10 || profitableRate < 80) {
            riskLevel = 'High';
            riskScore = 80;
        } else if (profitMargin < 20 || profitableRate < 90) {
            riskLevel = 'Medium';
            riskScore = 50;
        } else {
            riskScore = 20;
        }

        return {
            risk_level: riskLevel,
            risk_score: riskScore,
            profit_margin: profitMargin + '%',
            profitable_transaction_rate: profitableRate + '%',
            recommendation: riskLevel === 'High' ? 'Review pricing and cost structure' : 'Monitor profitability trends'
        };
    }

    function assessInventoryRisk(insights) {
        const turnoverRate = parseFloat(insights.inventory?.turnover_rate || 0);

        let riskLevel = 'Low';
        let riskScore = 0;

        if (turnoverRate < 0.1) {
            riskLevel = 'High';
            riskScore = 70;
        } else if (turnoverRate < 0.5) {
            riskLevel = 'Medium';
            riskScore = 45;
        } else {
            riskScore = 20;
        }

        return {
            risk_level: riskLevel,
            risk_score: riskScore,
            turnover_rate: turnoverRate,
            recommendation: riskLevel === 'High' ? 'Optimize inventory levels' : 'Monitor inventory turnover'
        };
    }

    function detectSalesOutliers(values) {
        if (values.length < 4) return null;

        const sorted = [...values].sort((a, b) => a - b);
        const q1 = calculatePercentile(sorted, 25);
        const q3 = calculatePercentile(sorted, 75);
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;

        const outliers = values.filter(v => v < lowerBound || v > upperBound);

        return {
            outlier_count: outliers.length,
            outlier_percentage: ((outliers.length / values.length) * 100).toFixed(2),
            outlier_values: outliers.slice(0, 10), // Top 10 outliers
            detection_method: 'IQR Method',
            lower_bound: lowerBound.toFixed(2),
            upper_bound: upperBound.toFixed(2)
        };
    }

    function calculateCorrelations(data) {
        const correlations = {};
        const fields = Object.keys(data).filter(key => data[key].length > 0);

        for (let i = 0; i < fields.length; i++) {
            for (let j = i + 1; j < fields.length; j++) {
                const field1 = fields[i];
                const field2 = fields[j];

                const correlation = calculatePearsonCorrelation(data[field1], data[field2]);
                correlations[`${field1}_vs_${field2}`] = {
                    correlation: correlation.toFixed(4),
                    strength: Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak',
                    direction: correlation > 0 ? 'Positive' : 'Negative'
                };
            }
        }

        return correlations;
    }

    function calculatePearsonCorrelation(x, y) {
        const n = Math.min(x.length, y.length);
        if (n < 2) return 0;

        const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
        const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
        const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumXX = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
        const sumYY = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));

        return denominator === 0 ? 0 : numerator / denominator;
    }

    function calculatePerformanceBenchmarks(insights) {
        return {
            industry_comparison: {
                profit_margin_benchmark: '15-25%',
                customer_retention_benchmark: '80-90%',
                inventory_turnover_benchmark: '4-12x annually',
                note: 'Benchmarks vary by industry and business model'
            },
            internal_benchmarks: {
                top_quartile_sales: insights.advanced_kpis?.sales_75th_percentile || 'N/A',
                median_performance: insights.kpis?.median_sales || 'N/A',
                consistency_target: 'CV < 30%',
                growth_target: '10-20% annually'
            }
        };
    }

    function generateAutomatedAlerts(insights) {
        const alerts = [];

        // Performance alerts
        if (parseFloat(insights.kpis?.profit_margin_percent || 0) < 10) {
            alerts.push({
                type: 'Performance',
                severity: 'High',
                message: 'Profit margin below 10% - immediate attention required',
                action: 'Review pricing and cost structure'
            });
        }

        // Customer alerts
        if (insights.customer_segments?.churn_risk_analysis?.churn_risk_summary?.high_risk > 0) {
            alerts.push({
                type: 'Customer',
                severity: 'Medium',
                message: `${insights.customer_segments.churn_risk_analysis.churn_risk_summary.high_risk} customers at high churn risk`,
                action: 'Implement retention campaigns'
            });
        }

        // Inventory alerts
        if (parseFloat(insights.inventory?.turnover_rate || 0) < 0.1) {
            alerts.push({
                type: 'Inventory',
                severity: 'Medium',
                message: 'Low inventory turnover detected',
                action: 'Review inventory levels and product mix'
            });
        }

        // Data quality alerts
        if (insights.data_quality?.overall_score < 70) {
            alerts.push({
                type: 'Data Quality',
                severity: 'Medium',
                message: 'Data quality score below acceptable threshold',
                action: 'Improve data collection and validation processes'
            });
        }

        return alerts;
    }

    return insights;
}

module.exports = { getRetailInsights };
