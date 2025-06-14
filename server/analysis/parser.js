// parser.js
const xlsx = require('xlsx');

function parseExcelBuffer(buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
    return data;
}

module.exports = { parseExcelBuffer };
