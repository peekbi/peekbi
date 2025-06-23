// utils/planDefaults.js

const PLAN_DEFAULTS = {
    free: {
        price: 0,
        billingInterval: 'monthly',
        limits: {
            uploads: 10,
            download: 5,
            analyse: 3,
            aiPromts: 5,
            reports: 2,
            charts: 5,
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
        price: 99000,
        billingInterval: 'monthly',
        limits: {
            uploads: 100,
            download: 50,
            analyse: 30,
            aiPromts: 50,
            reports: 20,
            charts: 50,
            maxUsersPerAccount: 5,
            dataRetentionDays: 30,
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
        price: 499000,
        billingInterval: 'monthly',
        limits: {
            uploads: 1000,
            download: 500,
            analyse: 300,
            aiPromts: 500,
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
