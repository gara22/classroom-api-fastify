import fastify from 'fastify';
import cors from '@fastify/cors';
import classroomRouter from './routes/classroom.router';
import bookingRouter from './routes/booking.router';
import { clerkPlugin } from '@clerk/fastify';

import websocket from '@fastify/websocket'

import * as dotenv from 'dotenv';
import { roomRouter } from './routes/room.router';
import { handleJoin, handleLeave, parseMessage } from './utils/socket';

dotenv.config();

const app = fastify({ logger: true });
app.register(websocket)

app.register(cors, {
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET', 'DELETE', 'PUT'],
});
app.register(clerkPlugin);
app.register(classroomRouter, { prefix: '/classrooms' });
app.register(bookingRouter, { prefix: '/bookings' });
app.register(roomRouter, { prefix: '/rooms' });
app.register(async function (fastify) {
  try {
    fastify.get('/', { websocket: true }, ({ socket} /* SocketStream */, req /* FastifyRequest */) => {
      socket.on('error', console.error);
      socket.on('message', message => {
        //TODO: get Id of connection and store it
        console.log(req.id);
        const { type, payload } = parseMessage(message);
        switch (type) {
          case 'join':
            handleJoin(socket, payload);
            break;
          case 'leave':
            handleLeave(payload);
            break;
  
          default:
            console.warn(`Unhandled message type: ${type}`);
  
        }
      })
  
  
    })
    
  } catch (error) {
    console.log(error)
  }
})
app.get('/ping', async (request, reply) => {
  return 'helyyoqqq\n';
});


app.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});