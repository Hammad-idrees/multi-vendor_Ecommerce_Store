import { Server as SocketServer } from 'socket.io';
import http from 'http';

let io: SocketServer;

const userSockets = new Map<string, string>(); // userId -> socketId

export const initSocket = (server: http.Server) => {
    io = new SocketServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('register', (userId: string) => {
            userSockets.set(userId, socket.id);
            console.log(`User ${userId} registered with socket ${socket.id}`);
        });

        socket.on('disconnect', () => {
            // Remove user from map
            for (const [userId, socketId] of userSockets.entries()) {
                if (socketId === socket.id) {
                    userSockets.delete(userId);
                    break;
                }
            }
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = (): SocketServer => {
    if (!io) throw new Error('Socket.io not initialized');
    return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
    const socketId = userSockets.get(userId);
    if (socketId && io) {
        io.to(socketId).emit(event, data);
    }
};

export const emitToAll = (event: string, data: any) => {
    if (io) {
        io.emit(event, data);
    }
};
