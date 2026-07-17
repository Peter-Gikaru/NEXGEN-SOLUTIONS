import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { sendAdminAlertEmail } from './emailService';
import { sendWhatsAppMessage } from './twilio'; 
import { logger } from '../utils/logger';

const parseCookies = (cookieString: string | undefined): Record<string, string> => {
  const cookies: Record<string, string> = {};
  if (!cookieString) return cookies;
  cookieString.split(';').forEach(c => {
    const parts = c.split('=');
    const name = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    if (name) cookies[name] = val;
  });
  return cookies;
};

export const setupSocket = (io: Server) => {
  // Authentication middleware for incoming Socket connections
  io.use((socket, next) => {
    const cookiesHeader = socket.handshake.headers.cookie;
    if (cookiesHeader) {
      const cookies = parseCookies(cookiesHeader);
      const token = cookies.token;
      if (token && process.env.JWT_SECRET) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }) as {
            id: string;
            email: string;
            role: string;
          };
          socket.data.user = decoded;
        } catch (err) {
          // Token expired or invalid, keep anonymous
        }
      }
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    
    socket.on('admin_join', () => {
      if (socket.data.user?.role !== 'ADMIN') {
        logger.warn(`SECURITY ALERT: Unauthorized access attempt to join admin_room from IP: ${socket.handshake.address}`);
        return socket.disconnect(true);
      }
      socket.join('admin_room');
      console.log('Admin joined live chat room');
    });

    socket.on('visitor_connect', async (data: { visitorId: string, page: string }) => {
      // Validate visitorId format (v_ followed by alphanumeric characters) to prevent injection/hijacking
      const VISITOR_ID_REGEX = /^v_[a-z0-9]{10,30}$/i;
      if (!data.visitorId || !VISITOR_ID_REGEX.test(data.visitorId)) {
        logger.warn(`SECURITY: Malformed visitorId connect attempt: ${data.visitorId}`);
        return;
      }
      
      socket.data.visitorId = data.visitorId;

      try {
        let session = await prisma.visitorSession.findUnique({
          where: { visitorId: data.visitorId }
        });

        const isNew = !session;
        let userDetails = null;
        if (socket.data.user) {
          const userObj = await prisma.user.findUnique({
            where: { id: socket.data.user.id },
            select: { name: true, email: true }
          });
          if (userObj) {
            userDetails = { name: userObj.name, email: userObj.email };
          }
        }

        if (!session) {
          session = await prisma.visitorSession.create({
            data: {
              visitorId: data.visitorId,
              status: 'ONLINE',
              ipAddress: socket.handshake.address,
              userAgent: socket.handshake.headers['user-agent']
            }
          });
          
          io.to('admin_room').emit('new_visitor', {
            visitorId: data.visitorId,
            page: data.page,
            createdAt: session.createdAt,
            user: userDetails
          });

          
          try {
            await sendAdminAlertEmail('New Live Chat Visitor!', `A new visitor has connected on page: ${data.page}. Open Admin Dashboard to chat.`);
            await sendWhatsAppMessage(`A new visitor is active on NexGen Gadgets: ${data.page}`);
          } catch (e) {
            console.error('Failed to send visitor alert', e);
          }
        } else {
          session = await prisma.visitorSession.update({
            where: { id: session.id },
            data: { status: 'ONLINE', lastSeen: new Date() }
          });
        }

        
        socket.join(`visitor_${data.visitorId}`);
        io.to('admin_room').emit('visitor_status_update', { 
          visitorId: data.visitorId, 
          status: 'ONLINE', 
          page: data.page,
          user: userDetails
        });
      } catch (e) {
        console.error('Visitor connect error', e);
      }
    });

    socket.on('visitor_disconnect', async (data: { visitorId: string }) => {
      // Validate caller owns this session
      if (socket.data.visitorId !== data.visitorId && socket.data.user?.role !== 'ADMIN') {
        return;
      }
      try {
        await prisma.visitorSession.update({
          where: { visitorId: data.visitorId },
          data: { status: 'OFFLINE', lastSeen: new Date() }
        });
        io.to('admin_room').emit('visitor_status_update', { visitorId: data.visitorId, status: 'OFFLINE' });
      } catch (e) {}
    });

    socket.on('send_message', async (data: { visitorId: string, sender: string, content: string }) => {
      try {
        const isAdmin = data.sender === 'ADMIN';
        if (isAdmin && socket.data.user?.role !== 'ADMIN') {
          logger.warn(`SECURITY: Non-admin socket tried to send admin message`);
          return;
        }
        if (!isAdmin && socket.data.visitorId !== data.visitorId) {
          logger.warn(`SECURITY: Visitor ID mismatch spoofing attempt. Socket: ${socket.data.visitorId}, Data: ${data.visitorId}`);
          return;
        }

        const session = await prisma.visitorSession.findUnique({ where: { visitorId: data.visitorId } });
        if (!session) return;

        const msg = await prisma.chatMessage.create({
          data: {
            visitorSessionId: session.id,
            sender: data.sender, 
            content: data.content
          }
        });

        
        io.to(`visitor_${data.visitorId}`).emit('receive_message', msg);
        io.to('admin_room').emit('receive_message', { ...msg, visitorId: data.visitorId });
        
        
        await prisma.visitorSession.update({
          where: { id: session.id },
          data: { lastSeen: new Date(), status: 'ONLINE' }
        });

      } catch (e) {
        console.error('Send message error', e);
      }
    });

    socket.on('disconnect', () => {
      
    });
  });
};
