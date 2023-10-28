import { User } from "@clerk/backend";
import { clerkClient } from "@clerk/fastify";
import { Booking, Classroom } from "@prisma/client";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { STANDARD } from "../helpers/constants";
import { handleServerError } from "../helpers/errors";
import { filterUserForClient, prisma } from "../helpers/utils";

type BookingByIdReq = FastifyRequest<{
  Params: { id: string }
}>

type GetBookingReq = FastifyRequest<{
  Querystring: {
    from?: Date;
    to?: Date;
    userId?: string;
    classroomId?: string;
  }
}>
type BookingMutationReq = FastifyRequest<{
  Body: {
    from: Date;
    to: Date;
    classroomId: string;
    bookerId: string;
    description?: string;
    id?: string;
  }
}>

const addUserDataToBookings = async (bookings: Booking[]) => {
  const userId = bookings.map((booking) => booking.bookerId);
  const users = (
    await clerkClient.users.getUserList({
      userId: userId,
      limit: 110,
    })
  ).map(filterUserForClient);

  return bookings.map((booking) => {
    const booker = users.find((user) => user.id === booking.bookerId);

    if (!booker) {
      console.error("AUTHOR NOT FOUND", booking);
      throw new Error(
        `Author for post not found. POST ID: ${booking.id}, USER ID: ${booking.bookerId}`,
      );
    }
    if (!booker.username) {
      // user the ExternalUsername
      throw new Error(
        `Author has no username: ${booker.id}`,
      );
    }
    return {
      ...booking,
      booker: {
        ...booker,
        username: booker.username ?? "(username not found)",
      },
    };
  });
}

//public route
const getBookingsOfClassroom = async (request: GetBookingReq, reply: FastifyReply) => {
  try {
    const { classroomId, from, to } = request.query;

    const bookings = await prisma.booking.findMany({
      where: {
        classroomId: classroomId, from: {
          gte: from
        }, to: {
          lte: to
        },

      },
    });
    reply.status(STANDARD.SUCCESS).send({ bookings: await addUserDataToBookings(bookings) })
  }
  catch (e) {
    handleServerError(reply, e)
  }
}

//TODO: specify a type for user props, also move this from here
type BookingWithBooker = Booking & { booker: Pick<User, 'username' | 'id'> | null, classroom: Classroom };

//private route
const getBookingsOfUser = async (request: GetBookingReq, reply: FastifyReply) => {
  try {
    //TODO: get user id from session/token and make this private
    const { userId, from, to } = request.query;

    const bookings = await prisma.booking.findMany({
      where: {
        bookerId: userId, from: {
          gte: from
        }, to: {
          lte: to
        },

      },
      include: {
        classroom: true,
      },
      orderBy: [
        {
          from: 'desc',
        }
      ]
    });
    reply.status(STANDARD.SUCCESS).send({ bookings: await addUserDataToBookings(bookings) })
  }
  catch (e) {
    handleServerError(reply, e)
  }
}


const deleteBooking = async (request: BookingByIdReq, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    await prisma.booking.delete({ where: { id: id } })
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
    const { from, to, bookerId, description, classroomId, id } = request.body;
    await prisma.booking.update({
      where: {
        id: id
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
      }
    },
    // schema: createPostSchema,
    // preHandler: [checkValidRequest, checkValidUser],
    handler: getBookingsOfClassroom
  })
  fastify.route({
    method: 'GET',
    url: '/user',
    schema: {
      querystring: {
        from: { type: 'string', format: 'date-time' },
        to: { type: 'string', format: 'date-time' },
        userId: { type: 'string' },
      }
    },
    // schema: createPostSchema,
    // preHandler: [checkValidRequest, checkValidUser],
    handler: getBookingsOfUser
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
        id: { type: 'string' },
      }
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: editBooking
  })
  fastify.route({
    method: 'DELETE',
    url: '/delete/:id',
    schema: {
      params: {
        id: { type: 'string' }
      }
    },
    // preHandler: [checkValidRequest, checkValidUser],
    handler: deleteBooking
  })
};


export default bookingRouter