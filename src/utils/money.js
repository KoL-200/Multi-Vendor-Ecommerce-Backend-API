const dollarsToCents = (dollars) => {
    const amount = typeof dollars === 'string' ? parseFloat(dollars) : dollars;

    if (isNaN(amount) || amount === null) {
        return 0;
    }

    return Math.round(amount * 100);
};

module.exports = { dollarsToCents };