import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const userRepo = () => AppDataSource.getRepository(User);

// GET /api/users — Solo admin
router.get('/', authenticate, authorize('admin'), async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await userRepo().find({ select: ['id', 'email', 'nombre', 'rol', 'createdAt'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
});

// PATCH /api/users/:id/rol — Solo admin cambia roles
router.patch(
  '/:id/rol',
  authenticate,
  authorize('admin'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { rol } = req.body as { rol: User['rol'] };
      const user = await userRepo().findOneBy({ id: parseInt(req.params['id'] ?? '0') });

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      user.rol = rol;
      await userRepo().save(user);
      res.json({ message: 'Rol actualizado', user: { id: user.id, rol: user.rol } });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar rol', error });
    }
  }
);

export default router;
