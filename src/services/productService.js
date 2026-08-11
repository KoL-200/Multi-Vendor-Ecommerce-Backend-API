const { findCategoryById } = require('../repositories/categoryRepository')

const { createProduct, findProductById, findProductByStoreId, updateProduct, deleteProduct, findProducts, countProducts } = require('../repositories/productRepository')
const { findStoreByOwnerId, findStoreById } = require('../repositories/storeRepository')

const { dollarsToCents } = require('../utils/money')

const { ForbiddenError, NotFoundError, BadRequestError } = require('../utils/AppError')
const { findUserById } = require('../repositories/userRepository')

const createNewProduct = async (userId, data) => {
    const user = await findUserById(userId);
    if (user.vendorStatus !== 'APPROVED') {
        throw new ForbiddenError('You must be an approved vendor');
    }

    const store = await findStoreByOwnerId(userId);
    if (!store) {
        throw new NotFoundError('You do not have a store yet');
    }

    const category = await findCategoryById(data.categoryId);
    if (!category) {
        throw new BadRequestError('Invalid categoryId');
    }

    const priceInCents = dollarsToCents(data.price);

    return createProduct({
        storeId: store.id,
        name: data.name,
        description: data.description,
        price: priceInCents,
        stock: data.stock,
        sku: data.sku,
        categoryId: data.categoryId,
    });
};

const getProductById = async (id) => {
    const product = await findProductById(id);
    if (!product || !product.isActive) {
        throw new NotFoundError('Product not found');
    }
    return product;
};

const getMyProducts = async (userId) => {
    const store = await findStoreByOwnerId(userId)

    if (!store) {
        throw new NotFoundError("You don't own a store")
    }
    const myProducts = await findProductByStoreId(store.id)

    return myProducts
}

const updateExistingProduct = async (id, userId, isAdmin, data) => {
    const product = await findProductById(id);
    if (!product) {
        throw new NotFoundError('Product not found');
    }

    const store = await findStoreById(product.storeId);
    if (store.ownerId !== userId && !isAdmin) {
        throw new ForbiddenError('Cannot perform this action');
    }

    return updateProduct(id, data);
};


const deleteExistingProduct = async (id, userId, isAdmin) => {

    const product = await findProductById(id)

    if (!product) {
        throw new NotFoundError("Product not found")
    }

    const store = await findStoreById(product.storeId);
    if (store.ownerId !== userId && !isAdmin) {
        throw new ForbiddenError('Cannot perform this action');
    }

    return deleteProduct(id)
}

const getProducts = async ({ search, categoryId, priceMin, priceMax, sort, order, page, limit }) => {
    const where = { isActive: true };

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (search) {
        where.name = { contains: search, mode: 'insensitive' };
    }

    if (priceMin || priceMax) {
        where.price = {};
        if (priceMin) where.price.gte = dollarsToCents(Number(priceMin));
        if (priceMax) where.price.lte = dollarsToCents(Number(priceMax));
    }

    const allowedSortFields = ['price', 'createdAt', 'name'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'createdAt';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';
    const orderBy = { [sortField]: sortOrder };

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (pageNumber - 1) * limitNumber;

    const [products, total] = await Promise.all([
        findProducts({ where, orderBy, skip, take: limitNumber }),
        countProducts(where),
    ]);

    return {
        data: products,
        pagination: { page: pageNumber, limit: limitNumber, total, totalPages: Math.ceil(total / limitNumber) },
    };
};

module.exports = {
    createNewProduct,
    getProductById,
    getMyProducts,
    updateExistingProduct,
    deleteExistingProduct,
    getProducts
}