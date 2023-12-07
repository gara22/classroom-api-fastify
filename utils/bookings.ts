import { prisma } from "../helpers/utils";
import { CreateBookingParams } from "../routes/booking.router";

/**
 * 
 * @param params from, to, classroomId
 * 
 * @returns true if booking exists in the provided timeframe, otherwise false
 */
export const checkIfTimeFrameHasBooking = async (params: Pick<CreateBookingParams, 'from' | 'to' | 'classroomId'>) => {
  const { from, to, classroomId } = params;
  //TODO: check in interval not just start and date -> like find free classroom
  const booking = await prisma.booking.findFirst({
    where: {
      AND: [
        { classroomId: classroomId },
        {
          from: {
            gte: from,
          },
        },
        {
          to: {
            lte: to,
          },
        },
      ],
    },
  });

  if (booking) {
    return true;
  }

  return false;
};

export const createBooking = async (params: CreateBookingParams) => {
  const { from, to, bookerId, description, classroomId } = params;
  const newBooking = await prisma.booking.create({
    data: {
      from,
      to,
      bookerId,
      description,
      classroomId,
    },
  });
  return newBooking;
}