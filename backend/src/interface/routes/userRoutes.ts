import { Router, Response } from 'express';
import { LoginUser } from '../../application/use-cases/LoginUser';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { GetAllUsers, DeleteUser, GetUserProfile } from '../../application/use-cases/UserUseCases';
import { AuthenticatedRequest, authMiddleware, adminMiddleware } from '../middleware/auth';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository';
import { UserRole } from '../../domain/entities/User';

const router = Router();
const userRepository = new MongoUserRepository();

// POST /api/auth/login
router.post('/auth/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const loginUser = new LoginUser(userRepository);
    const result = await loginUser.execute({
      identifier: req.body.identifier,
      password: req.body.password,
    });
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// GET /api/users/me
router.get('/users/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getProfile = new GetUserProfile(userRepository);
    const user = await getProfile.execute(req.userId!);
    res.json(user.toJSON());
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// GET /api/users/search?q=...
router.get('/users/search', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const query = (req.query.q as string || '').trim();
    if (query.length < 2) {
      return res.json([]);
    }
    const users = await userRepository.search(query, 10);
    res.json(users.map((u) => u.toJSON()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users
router.post('/users', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const registerUser = new RegisterUser(userRepository);
    const user = await registerUser.execute(
      {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        password: req.body.password,
        role: req.body.role || UserRole.USER,
      },
      req.userRole as UserRole
    );
    res.status(201).json(user.toJSON());
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/users
router.get('/users', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const getAllUsers = new GetAllUsers(userRepository);
    const users = await getAllUsers.execute(req.userRole as UserRole);
    res.json(users.map((u) => u.toJSON()));
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
});

// POST /api/users/by-ids
router.post('/users/by-ids', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ids: string[] = req.body.ids || [];
    if (ids.length === 0) return res.json([]);
    const users = await userRepository.findByIds(ids);
    res.json(users.map((u) => u.toJSON()));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleteUser = new DeleteUser(userRepository);
    await deleteUser.execute(req.params.id, req.userRole as UserRole);
    res.json({ message: 'User deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
