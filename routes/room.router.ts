import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ERROR400, STANDARD } from '../helpers/constants';
import { createRoomId, joinRoom, leaveRoom, rooms } from '../utils/room';

const handleGetRooms = (req: FastifyRequest, reply: FastifyReply) => {
  reply.status(STANDARD.SUCCESS).send({ rooms: Object.fromEntries(rooms) });
};

const handleJoinRoom = (
  req: FastifyRequest<{
    //TODO: remove userId and get it from jwt
    //TODO: maybe validate roomId and end/startDate
    Body: {
      classroomId: string;
      startDate: string;
      endDate: string;
      userId: string;
    };
  }>,
  reply: FastifyReply,
) => {
  const { classroomId, startDate, endDate, userId } = req.body;
  try {
    const roomId = createRoomId(classroomId, startDate, endDate);
    joinRoom(roomId, userId);
    reply.status(STANDARD.SUCCESS).send({ rooms: Object.fromEntries(rooms) });
  } catch (error) {
    reply.status(ERROR400.statusCode).send(error);
  }
};
const handleLeavenRoom = (
  req: FastifyRequest<{
    Body: {
      roomId: string;
      userId: string;
    };
  }>,
  reply: FastifyReply,
) => {
  const { roomId, userId } = req.body;
  try {
    leaveRoom(roomId, userId);
    reply.status(STANDARD.SUCCESS).send({ rooms: Object.fromEntries(rooms) });
  } catch (error) {
    reply.status(ERROR400.statusCode).send(error);
  }
};

export const roomRouter = async (fastify: FastifyInstance) => {
  fastify.route({
    method: 'GET',
    url: '/',
    // schema: createPostSchema,
    // preHandler: [checkValidRequest, checkValidUser],
    handler: handleGetRooms,
  });
  fastify.route({
    method: 'POST',
    url: '/join',
    schema: {
      body: {
        roomId: { type: 'string' },
        userId: { type: 'string' },
      },
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: handleJoinRoom,
  });
  fastify.route({
    method: 'POST',
    url: '/leave',
    schema: {
      body: {
        roomId: { type: 'string' },
        userId: { type: 'string' },
      },
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: handleLeavenRoom,
  });
};
