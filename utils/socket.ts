import { Booking } from "@prisma/client";
import { RawData, WebSocket } from "ws";
import { CreateBookingParams } from "../routes/booking.router";
import { createBooking } from "./bookings";
import { joinRoom, leaveRoom, rooms, userToConnectionMap } from "./room";

// type MessageType = 'join' | 'leave' | 'book';
type MessagePayload = { userId: string; }


type JoinMessage = {
  type: 'join';
  payload: JoinPayload;
}
type LeaveMessage = {
  type: 'leave';
  payload: LeavePayload;
}
type CreateBookingMessage = {
  type: 'create_booking';
  payload: CreateBookingPayload;
}

type JoinPayload = {
  roomId: string;
} & MessagePayload

type LeavePayload = {
  roomId: string;
} & MessagePayload

type CreateBookingPayload = {
  roomId: string;
  booking: CreateBookingParams;
} & MessagePayload

export type WebsocketMessage = JoinMessage | LeaveMessage | CreateBookingMessage;

export type CustomWebSocket = {
  id: string;
} & WebSocket;

export const sendMessage = <T>(socket: CustomWebSocket, msg: any) => {
  const stringMsg = JSON.stringify(msg);
  socket.send(stringMsg);
}
export const parseMessage = <T>(msg: RawData) => {
  try {
    const parsedMessage: WebsocketMessage = JSON.parse(msg.toString());
    return parsedMessage;
  } catch (error) {
    throw new Error("Couldn't parse incoming message");
  }
}

export const handleJoin = (socket: CustomWebSocket, payload: JoinPayload) => {
  const { roomId, userId } = payload;
  joinRoom(roomId, userId);
  //TODO: think about where to put this
  userToConnectionMap.set(userId, socket);
  const msg = { type: 'join', payload: `User: ${userId}, joined room ${roomId}` };
  broadcastToRoom(roomId, msg);
}

export const handleLeave = ({ roomId, userId }: { roomId: string, userId: string }) => {
  leaveRoom(roomId, userId);
  //TODO: think about where to put this
  userToConnectionMap.delete(userId);
  const msg = { type: 'leave', payload: `User: ${userId}, left room ${roomId}` };
  broadcastToRoom(roomId, msg);
}

export const handleCreateBooking = async (payload: CreateBookingPayload) => {
  const {booking, roomId} = payload
  console.log("🚀 ~ file: socket.ts:75 ~ handleCreateBooking ~ payload:", booking)
  const newBooking = await createBooking(booking);
  //TODO: think about where to put this
  const msg = { type: 'new_booking', payload: `New booking has been created, from: ${newBooking.from}, to: ${newBooking.to},  ${newBooking}` };
  broadcastToRoom(roomId, msg);
}

export const broadcastToRoom = (roomId: string, msg: any) => {
  const room = rooms.get(roomId);
  userToConnectionMap.forEach((client, userId) => room?.users.has(userId) && sendMessage(client, msg))
}

export const removeUserFromRoom = (userId: string) => {
  rooms.forEach(room => {
    if (room.users.has(userId)) {
      handleLeave({roomId: room.id, userId});
    }
  })
}
export const removeConnection = (socket: CustomWebSocket) => {
  console.log("🚀 ~ file: socket.ts:77 ~ removeConnection ~ socket:", 'dc')
  userToConnectionMap.forEach((conn, userId) => {
    if (socket.id === conn.id) {
      removeUserFromRoom(userId);
    }
  })
}


