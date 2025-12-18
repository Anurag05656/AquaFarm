import express from 'express';
import { getFields, createField, updateField, deleteField } from '../controllers/fieldController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getFields)
  .post(createField);

router.route('/:id')
  .put(updateField)
  .delete(deleteField);

export default router;