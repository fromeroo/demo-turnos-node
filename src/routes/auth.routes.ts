import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

const router = Router();
const userRepo = () => AppDataSource.getRepository(User);

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, rol } = req.body as {
      email: string;
      password: string;
      nombre: string;
      rol?: string;
    };

    const existe = await userRepo().findOneBy({ email });
    if (existe) {
      res.status(400).json({ message: 'El email ya está registrado' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const user = userRepo().create({
      email,
      password: hash,
      nombre,
      rol: (rol as User['rol']),
    });

    await userRepo().save(user);
    res.status(201).json({ message: 'Usuario creado', id: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar', error });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await userRepo().findOneBy({ email });
    if (!user) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const valido = await bcrypt.compare(password, user.password);
    if (!valido) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const secret = process.env['JWT_SECRET'] as string;
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      secret,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, nombre: user.nombre, rol: user.rol } });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
});

export default router;
