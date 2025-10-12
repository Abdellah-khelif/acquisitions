import express from 'express';
import { fetchAllUsers, getUserById, updateUser, deleteUser } from '#controllers/user.controller.js';

const router = express.Router();

router.get('/', fetchAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
