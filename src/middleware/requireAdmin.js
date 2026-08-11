const { ForbiddenError, UnauthorizedError } = require('../utils/AppError')

function requireAdmin(req, res, next) {
    if (!req.user) {
        return next(new UnauthorizedError('Not authenticated'))
    }

    if (!req.user.isAdmin) {
        return next(new ForbiddenError('Admin access required'))
    }

    next()
}

module.exports = {
    requireAdmin
}