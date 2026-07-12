import { Server, Socket } from 'socket.io';
import prisma from '../config/db';
import { sendAdminAlertEmail } from './emailService';
import { sendWhatsAppMessage } from './twilio'; 

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    
    socket.on('admin_join', () => {
      socket.join('admin_room');
      console.log('Admin joined live chat room');
    });

    socket.on('visitor_connect', async (data: { visitorId: string, page: string }) => {
      try {
        let session = await prisma.visitorSession.findUnique({
          where: { visitorId: data.visitorId }
        });

        const isNew = !session;

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
            createdAt: session.createdAt
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
        io.to('admin_room').emit('visitor_status_update', { visitorId: data.visitorId, status: 'ONLINE', page: data.page });
      } catch (e) {
        console.error('Visitor connect error', e);
      }
    });

    socket.on('visitor_disconnect', async (data: { visitorId: string }) => {
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
