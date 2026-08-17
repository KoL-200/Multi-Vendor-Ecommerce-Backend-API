const { getOverviewStats, getRevenueStats, getBestSellingProducts } = require('../services/adminService');

const overviewStats = async (req, res) => {
    const stats = await getOverviewStats();
    res.status(200).json({ success: true, data: stats });
};

const revenueStats = async (req, res) => {
    const stats = await getRevenueStats()
    res.status(200).json({ success: true, data: stats })
}

const bestProducts = async (req, res) => {
    const limitParam = parseInt(req.query.limit, 10)
    const limit = !isNaN(limitParam) && limitParam > 0 ? limitParam : 5

    const topProducts = await getBestSellingProducts(limit)

    res.status(200).json({
        success: true,
        data: topProducts
    })
}

module.exports = {
    overviewStats,
    revenueStats,
    bestProducts
};