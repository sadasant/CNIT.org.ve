
/*
 * GET home page.
 */

exports.index = function(req, res) {
  res.render('index', { title: 'CNIT' })
};

exports.participate = function(req, res) {
  res.render('participate', { title: 'CNIT - ¡Participa!' })
}

exports.us = function(req, res) {
  res.render('us', { title: 'CNIT - Nuestro equipo' })
}

