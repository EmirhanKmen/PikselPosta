// middleware/authMiddleware.js
function isAuthenticated(req, res, next) {
    if (req.session && req.session.brandOwnerId) {
        return next();
    }
    req.session.error_msg = 'Bu sayfayı görüntüleyebilmek için lütfen giriş yapın.';
    res.redirect('/auth/login');
}

function isGuest(req, res, next) {
    if (req.session && req.session.brandOwnerId) {
        return res.redirect('/dashboard');
    }
    next();
}

module.exports = {
    isAuthenticated,
    isGuest
};