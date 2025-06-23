const { cleanData } = require('./analysis/cleaner');

const testData = [
    {
        "Invoice Date": "06/01/2022",
        "Unit Price": "699",
        "Product": "Product B",
        "Empty Column": ""
    },
    {
        "Invoice Date": "06/02/2022",
        "Unit Price": "899",
        "Product": "Product C",
        "Empty Column": ""
    },
    {
        "Invoice Date": "06/03/2022",
        "Unit Price": "999",
        "Product": "Product A"
    }

];

const cleaned = cleanData(testData);
console.log("✅ Cleaned Data:");
cleaned.print();

console.log("\n🧪 Column Types:");
cleaned.columns.forEach(col => {
    console.log(`${col}: ${typeof cleaned[col].values[0]}`);
});
