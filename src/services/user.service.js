import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';
import { hashPassword } from '#services/auth.service.js';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users);
  } catch (error) {
    logger.error('Error getting users', error);
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    logger.error('Error getting user by id', error);
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) {
      const err = new Error('User not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    const values = { ...updates };
    if (values.password) {
      values.password = await hashPassword(values.password);
    }
    values.updated_at = new Date();

    const [updated] = await db
      .update(users)
      .set(values)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.created_at,
        updated_at: users.updated_at,
      });

    logger.info(`User ${id} updated successfully`);
    return updated;
  } catch (error) {
    logger.error('Error updating user', error);
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    const [deleted] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    if (!deleted) {
      const err = new Error('User not found');
      err.code = 'NOT_FOUND';
      throw err;
    }

    logger.info(`User ${id} deleted successfully`);
    return deleted;
  } catch (error) {
    logger.error('Error deleting user', error);
    throw error;
  }
};
