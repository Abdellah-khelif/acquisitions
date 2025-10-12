import logger from '#config/logger.js';
import { formatValidationError } from '#utils/format.js';
import { getAllUsers, getUserById as getUserByIdService, updateUser as updateUserService, deleteUser as deleteUserService } from '#services/user.service.js';
import { userIdSchema, updateUserSchema } from '#validations/user.validation.js';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users ...');

    const allUsers = await getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const validation = userIdSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validation.error),
      });
    }
    const { id } = validation.data;

    logger.info(`Getting user by id: ${id}`);
    const user = await getUserByIdService(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Successfully retrieved user', user });
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    // Validate params
    const paramsValidation = userIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(paramsValidation.error),
      });
    }
    const { id } = paramsValidation.data;

    // Validate body
    const bodyValidation = updateUserSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(bodyValidation.error),
      });
    }
    const updates = bodyValidation.data;

    // Authorization: must be authenticated
    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Non-admins can only update themselves
    const isAdmin = authUser.role === 'admin';
    if (!isAdmin && authUser.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Only admin can change role
    if (!isAdmin && typeof updates.role !== 'undefined') {
      return res.status(403).json({ error: 'Only admin can change role' });
    }

    logger.info(`Updating user ${id}`);
    const updated = await updateUserService(id, updates);

    res.json({ message: 'User updated', user: updated });
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'User not found' });
    }
    logger.error(error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const validation = userIdSchema.safeParse(req.params);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validation.error),
      });
    }
    const { id } = validation.data;

    const authUser = req.user;
    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isAdmin = authUser.role === 'admin';
    if (!isAdmin && authUser.id !== id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    logger.info(`Deleting user ${id}`);
    await deleteUserService(id);

    res.status(204).send();
  } catch (error) {
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'User not found' });
    }
    logger.error(error);
    next(error);
  }
};
