import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { STANDARD } from "../helpers/constants";
import { handleServerError } from "../helpers/errors";
import { prisma } from "../helpers/utils";

type ClassroomByIdReq = FastifyRequest<{
  Params: { classroomId: string }
}>

type CreateClassroomReq = FastifyRequest<{
  Body: {
    name: string;
    capacity: number;
    hasComputer: boolean;
  }
}>

type FreeClassroomReq = FastifyRequest<{
  Querystring: {
    from: Date;
    to: Date;
    hasComputer: boolean;
  }
}>

const getAllClassrooms = async (request: FastifyRequest, reply: FastifyReply) => {
  try {

    const classrooms = await prisma.classroom.findMany();
    reply.status(STANDARD.SUCCESS).send({ classrooms })
  }
  catch (e) {
    handleServerError(reply, e)
  }
}

const getClassroomById = async (request: ClassroomByIdReq, reply: FastifyReply) => {
  try {
    const { classroomId } = request.params;
    const classroom = await prisma.classroom.findUnique({ where: { id: classroomId } })
    reply.status(STANDARD.SUCCESS).send({ classroom })
  }
  catch (e) {
    handleServerError(reply, e)
  }
}
const getFreeClassrooms = async (request: FreeClassroomReq, reply: FastifyReply) => {
  try {
    const { from, to, hasComputer } = request.query;

    const classrooms = await prisma.classroom.findMany({
      where: {
        hasComputer: hasComputer,
      },
      include: {
        bookings: {
          where: {
            OR: [
              {
                AND: [
                  {
                    from: {
                      gt: from
                    },

                  },
                  {
                    from: {
                      lt: to
                    }
                  }
                ]
              },
              {
                AND: [
                  {
                    to: {
                      gt: from
                    },

                  },
                  {
                    to: {
                      lt: to
                    }
                  }
                ]
              },
              {
                AND: [
                  {
                    from: {
                      lte: from
                    },

                  },
                  {
                    to: {
                      gte: to
                    }
                  }
                ]
              }
            ]
          }
        }
      }
    })
    //   //TODO: maybe find a more efficient way to filter, but its okay for now.
    const freeClassrooms = classrooms.filter(r => r.bookings.length === 0);
    reply.status(STANDARD.SUCCESS).send({ freeClassrooms })
  }

  catch (e) {
    handleServerError(reply, e)
  }
}
const deleteClassroom = async (request: ClassroomByIdReq, reply: FastifyReply) => {
  try {
    const { classroomId } = request.params;
    await prisma.classroom.delete({ where: { id: classroomId } })
    reply.status(STANDARD.NOCONTENT).send()
  }
  catch (e) {
    handleServerError(reply, e)
  }
}
const createClassroom = async (request: CreateClassroomReq, reply: FastifyReply) => {
  try {
    const { name, capacity, hasComputer } = request.body;
    await prisma.classroom.create({
      data: {
        name,
        capacity,
        hasComputer
      }
    })
    reply.status(STANDARD.CREATED).send()
  }
  catch (e) {
    handleServerError(reply, e)
  }
}

export const classroomRouter = async (fastify: FastifyInstance) => {
  fastify.route({
    method: 'GET',
    url: '/',
    // schema: createPostSchema,
    // preHandler: [checkValidRequest, checkValidUser],
    handler: getAllClassrooms
  })

  fastify.route({
    method: 'GET',
    url: '/:classroomId',
    schema: {
      params: {
        classroomId: { type: 'string' }
      }
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: getClassroomById
  })
  fastify.route({
    method: 'POST',
    url: '/new',
    schema: {
      body: {
        name: { type: 'string' },
        capacity: { type: 'number' },
        hasComputer: { type: 'boolean' },
      }
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: createClassroom
  })
  fastify.route({
    method: 'DELETE',
    url: '/delete/:classroomId',
    // prefixTrailingSlash: "no-slash",
    schema: {
      params: {
        classroomId: { type: 'string' }
      }
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: deleteClassroom
  })
  fastify.route({
    method: 'GET',
    url: '/free',
    schema: {
      querystring: {
        from: { type: 'string', format: 'date-time' },
        to: { type: 'string', format: 'date-time' },
        hasComputer: { type: 'boolean' },
      }
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: getFreeClassrooms
  })
};



export default classroomRouter