import { Router, Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Turno } from '../entities/Turno';
import { User } from '../entities/User';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const turnoRepo = () => AppDataSource.getRepository(Turno);
const userRepo = () => AppDataSource.getRepository(User);

// GET /api/turnos — Admin ve todos, cliente ve solo los suyos
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    if (user.rol === 'admin' || user.rol === 'empleado') {
      const turnos = await turnoRepo().find({ order: { fecha: 'ASC' } });
      res.json(turnos);
    } else {
      // cliente solo ve sus turnos
      const turnos = await turnoRepo().find({
        where: { cliente: { id: user.id } },
        order: { fecha: 'ASC' },
      });
      res.json(turnos);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener turnos', error });
  }
});

// POST /api/turnos — Solo clientes reservan
router.post('/', authenticate, authorize('cliente', 'admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { servicio, fecha } = req.body as { servicio: string; fecha: string };
    const userId = req.user!.id;

    const cliente = await userRepo().findOneBy({ id: userId });
    if (!cliente) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const turno = turnoRepo().create({ servicio, fecha: new Date(fecha), cliente });
    await turnoRepo().save(turno);
    res.status(201).json(turno);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear turno', error });
  }
});

// PATCH /api/turnos/:id/estado — Empleado/Admin cambia estado
router.patch(
  '/:id/estado',
  authenticate,
  authorize('empleado', 'admin'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { estado } = req.body as { estado: Turno['estado'] };
      const turno = await turnoRepo().findOneBy({ id: parseInt(req.params['id'] ?? '0') });

      if (!turno) {
        res.status(404).json({ message: 'Turno no encontrado' });
        return;
      }

      turno.estado = estado;
      await turnoRepo().save(turno);
      res.json(turno);
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar estado', error });
    }
  }
);

// DELETE /api/turnos/:id — Cliente cancela el suyo, admin cancela cualquiera
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const turno = await turnoRepo().findOneBy({ id: parseInt(req.params['id'] ?? '0') });

    if (!turno) {
      res.status(404).json({ message: 'Turno no encontrado' });
      return;
    }

    // cliente solo puede cancelar el suyo
    if (user.rol === 'cliente' && turno.cliente.id !== user.id) {
      res.status(403).json({ message: 'Solo podés cancelar tus propios turnos' });
      return;
    }

    turno.estado = 'cancelado';
    await turnoRepo().save(turno);
    res.json({ message: 'Turno cancelado', turno });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar turno', error });
  }
});

export default router;
