import { Server } from 'socket.io';
import { User } from './models/User.js';

export const attachRealtime = (httpServer, sessionMiddleware) => {
  const io = new Server(httpServer);
  io.engine.use(sessionMiddleware);
  io.use(async (socket, next) => {
    const userId = socket.request.session?.userId;
    if (!userId) {
      socket.data.user = null;
      return next();
    }

    try {
      const user = await User.findById(userId);
      if (!user || user.isBlocked) return next(new Error('Authentication required.'));
      socket.data.user = {
        id: user._id.toString(),
        role: user.role,
      };
      return next();
    } catch (error) {
      return next(error);
    }
  });

  io.on('connection', (socket) => {
    if (!socket.data.user) return;
    socket.join('authenticated');
    socket.join(`user:${socket.data.user.id}`);
    if (socket.data.user.role === 'admin') socket.join('admins');
  });

  return io;
};

export const notifyMatchesChanged = (io) => {
  io?.emit('matches:changed');
};

export const notifyEnrollmentsChanged = (io) => {
  io?.to('authenticated').emit('enrollments:changed');
};

export const notifyUsersChanged = (io) => {
  io?.to('admins').emit('users:changed');
};
