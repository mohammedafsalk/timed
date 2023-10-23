function adminlogin(req, res, next) {
    if (req.session.admin) {
      next();
    } else {
      if (req.originalUrl === '/admin/login') {
        next();
      } else {
        res.redirect('/admin/login');
      }
    }
  }
  
  module.exports = adminlogin;