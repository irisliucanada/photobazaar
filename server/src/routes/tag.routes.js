const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');

router.post('/', tagController.createTag);
router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);
router.put('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);
// increase tag count after artwork is uploaded
router.patch('/updateTagCountIncrease/:id', tagController.increaseTagCount);
// decrease tag count after artwork is deleted
router.patch('/updateTagCountDecrease/:id', tagController.decreaseTagCount);

module.exports = router;
