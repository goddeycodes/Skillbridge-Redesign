const router = require('express').Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { upload: uploadMaterial, list, remove } = require('../controllers/materialController');

// Memory storage — files are streamed straight to Cloudinary, never written
// to disk on this server. Fine at the current 200MB cap; if that grows a lot
// this should move to disk-buffered or direct-to-Cloudinary client uploads.
const upload = multer({ storage: multer.memoryStorage() });

router.get('/',       protect, list);
router.post('/',      protect, upload.single('file'), uploadMaterial);
router.delete('/:id', protect, remove);

module.exports = router;