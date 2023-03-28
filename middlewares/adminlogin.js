function adminlogin(req, res, next) {
    if (req.session.admin) {
      next();
    } else {
      // check if already on admin login page
      if (req.originalUrl === '/admin/login') {
        next(); // break out of the loop
      } else {
        res.redirect('/admin/login');
      }
    }
  }
  
  module.exports = adminlogin;