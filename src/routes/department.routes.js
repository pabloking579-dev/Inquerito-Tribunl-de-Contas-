const router = require('express').Router();
const Department = require('../controller/DepartmentController');
router.get('/', Department.index);
router.post('/', Department.store);
module.exports = router;