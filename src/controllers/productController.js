const { createNewProduct, getProducts, getMyProducts, getProductById, updateExistingProduct, deleteExistingProduct } = require('../services/productService');

const newProducts = async (req, res) => {
    const userId = req.user.userId;
    const product = await createNewProduct(userId, req.body);
    res.status(201).json({ success: true, data: product });
};

const getProduct = async (req, res) => {
    const result = await getProducts(req.query);
    res.status(200).json({ success: true, ...result });
};

const productById = async (req, res) => {
    const { id } = req.params;
    const result = await getProductById(id);
    res.status(200).json({ success: true, data: result });
};

const myProducts = async (req, res) => {
    const userId = req.user.userId;
    const result = await getMyProducts(userId);
    res.status(200).json({ success: true, data: result });
};

const updatedProduct = async (req, res) => {
    const { id } = req.params;
    const { userId, isAdmin } = req.user;
    const result = await updateExistingProduct(id, userId, isAdmin, req.body);
    res.status(200).json({ success: true, data: result });
};

const deletedProduct = async (req, res) => {
    const { id } = req.params;
    const { userId, isAdmin } = req.user;
    await deleteExistingProduct(id, userId, isAdmin);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
};

module.exports = {
    newProducts,
    getProduct,
    productById,
    myProducts,
    updatedProduct,
    deletedProduct,
};