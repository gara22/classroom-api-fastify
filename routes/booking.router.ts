import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { STANDARD } from "../helpers/constants";
import { handleServerError } from "../helpers/errors";
import { prisma } from "../helpers/utils";

type BookingByIdReq = FastifyRequest<{
  Params: { bookingId: string }
}>

type GetBookingReq = FastifyRequest<{
  Querystring: {
    from?: Date;
    to?: Date;
    userId?: string;
    classroomId: string;
  }
}>
type BookingMutationReq = FastifyRequest<{
  Body: {
    from: Date;
    to: Date;
    classroomId: string;
    bookerId: string;
    description?: string;
    bookingId?: string;
  }
}>

const getBookings = async (request: GetBookingReq, reply: FastifyReply) => {
  try {
    //TODO: create a protected router for fetching user's bookings and remove userId from here
    const { classroomId, from, to, userId } = request.query;

    const bookings = await prisma.booking.findMany({
      where: {
        classroomId: classroomId, from: {
          gte: from
        }, to: {
          lte: to
        }, bookerId: userId

      },
      include: {
        booker: {
          select: {
            name: true,
          }
        }
      }
    });
    reply.status(STANDARD.SUCCESS).send({ bookings })
  }
  catch (e) {
    handleServerError(reply, e)
  }
}


const deleteBooking = async (request: BookingByIdReq, reply: FastifyReply) => {
  try {
    const { bookingId } = request.params;
    await prisma.booking.delete({ where: { id: bookingId } })
    reply.status(STANDARD.NOCONTENT).send()
  }
  catch (e) {
    handleServerError(reply, e)
  }
}
const createBooking = async (request: BookingMutationReq, reply: FastifyReply) => {
  try {
    const { from, to, bookerId, description, classroomId } = request.body;
    await prisma.booking.create({
      data: {
        from,
        to,
        bookerId,
        description,
        classroomId
      }
    })
    reply.status(STANDARD.CREATED).send()
  }
  catch (e) {
    handleServerError(reply, e)
  }
}
const editBooking = async (request: BookingMutationReq, reply: FastifyReply) => {
  try {
    const { from, to, bookerId, description, classroomId, bookingId } = request.body;
    await prisma.booking.update({
      where: {
        id: bookingId
      },
      data: {
        from: from,
        to: to,
        bookerId: bookerId,
        classroomId: classroomId,
        description: description,
      }
    })
    reply.status(STANDARD.NOCONTENT).send()
  }
  catch (e) {
    handleServerError(reply, e)
  }
}

export const bookingRouter = async (fastify: FastifyInstance) => {
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: {
        from: { type: 'string', format: 'date-time' },
        to: { type: 'string', format: 'date-time' },
        classroomId: { type: 'string' },
        userId: { type: 'string' },
      }
    },
    // schema: createPostSchema,
    // preHandler: [checkValidRequest, checkValidUser],
    handler: getBookings
  })

  //TODO: make this protected and check availability
  fastify.route({
    method: 'POST',
    url: '/new',
    schema: {
      body: {
        from: { type: 'string', format: 'date-time' },
        to: { type: 'string', format: 'date-time' },
        classroomId: { type: 'string' },
        bookerId: { type: 'string' },
        description: { type: 'string' },
      }
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: createBooking
  })
  fastify.route({
    method: 'PUT',
    url: '/edit',
    schema: {
      body: {
        from: { type: 'string', format: 'date-time' },
        to: { type: 'string', format: 'date-time' },
        classroomId: { type: 'string' },
        bookerId: { type: 'string' },
        description: { type: 'string' },
        bookingId: { type: 'string' },
      }
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: editBooking
  })
  fastify.route({
    method: 'DELETE',
    url: '/delete/:bookingId',
    schema: {
      params: {
        bookingId: { type: 'string' }
      }
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: deleteBooking
  })
};


export default bookingRouter