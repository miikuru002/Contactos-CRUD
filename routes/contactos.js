var express = require('express');
var router = express.Router();

var contacto = require('../controllers/ContactoController.js');

router.get('/', contacto.list);
router.get('/show/:id', contacto.show);
router.get('/create', contacto.create);
router.post('/save', contacto.save);
router.get('/edit/:id', contacto.edit);
router.post('/update/:id', contacto.update);
router.post('/delete/:id', contacto.delete);

module.exports = router;
