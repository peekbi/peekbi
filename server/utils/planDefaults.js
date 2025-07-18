// utils/planDefaults.js

const PLAN_DEFAULTS = {
    free: {
        price: 100,
        billingInterval: 'monthly',
        limits: {
            uploads: 15,
            download: 15,
            analyse: 8,
            aiPromts: 5,
            reports: 8,
            charts: 15,
            maxUsersPerAccount: 1,
            dataRetentionDays: 7,
        },
        features: {
            scheduleReports: false,
            exportAsPDF: false,
            shareableDashboards: false,
            emailSupport: true,
            prioritySupport: false,
        },
    },
    premium: {
        price: 29900,
        billingInterval: 'monthly',
        limits: {
            uploads: 100,
            download: 75,
            analyse: 60,
            aiPromts: 50,
            reports: 20,
            charts: 50,
            maxUsersPerAccount: 5,
            dataRetentionDays: 365,
        },
        features: {
            scheduleReports: true,
            exportAsPDF: true,
            shareableDashboards: true,
            emailSupport: true,
            prioritySupport: false,
        },
        billingInterval: 'monthly',
    },
    enterprise: {
        price: 69900,
        billingInterval: 'monthly',
        limits: {
            uploads: 500,
            download: 500,
            analyse: 500,
            aiPromts: 160,
            reports: 200,
            charts: 500,
            maxUsersPerAccount: 100,
            dataRetentionDays: 365,
        },
        features: {
            scheduleReports: true,
            exportAsPDF: true,
            shareableDashboards: true,
            emailSupport: true,
            prioritySupport: true,
        },
    }
};

module.exports = PLAN_DEFAULTS;
