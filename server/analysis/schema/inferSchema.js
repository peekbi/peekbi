function inferSchema(data) {
    const sample = data[0] || {};
    const fields = Object.keys(sample);

    const numeric = fields.filter(f => typeof sample[f] === 'number' || !isNaN(parseFloat(sample[f])));
    const string = fields.filter(f => typeof sample[f] === 'string' && isNaN(sample[f]));

    return {
        primaryKey: numeric.find(f => /id|date|time/i.test(f)) || numeric[0],
        metrics: numeric,
        dimensions: string
    };
}

module.exports = { inferSchema };
