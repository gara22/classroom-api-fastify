import { Booking } from "@prisma/client";
import { RawData, WebSocket } from "ws";
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
type BookMessage = {
  type: 'book';
  payload: BookPayload;
}

type JoinPayload = {
  roomId: string;
} & MessagePayload

type LeavePayload = {
  roomId: string;
} & MessagePayload

type BookPayload = {
  booking: Booking;
} & MessagePayload

export type WebsocketMessage = JoinMessage | LeaveMessage | BookMessage;

export const sendMessage = <T>(socket: WebSocket, msg: any) => {
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

export const handleJoin = (socket: WebSocket, payload: JoinPayload) => {
  const {roomId, userId } = payload;
  joinRoom(roomId, userId);
    //TODO: think about where to put this
  userToConnectionMap.set(userId, socket);
  const msg = { type: 'join', payload: `User: ${userId}, joined room ${roomId}` };
  broadcastToRoom(roomId, msg);
}

export const handleLeave = (payload: LeavePayload) => {
  const {roomId, userId } = payload;
  leaveRoom(roomId, userId);
  //TODO: think about where to put this
  userToConnectionMap.delete(userId);
  const msg = { type: 'leave', payload: `User: ${userId}, left room ${roomId}` };
  broadcastToRoom(roomId, msg);
}

export const broadcastToRoom = (roomId: string, msg: any) => {
  const room = rooms.get(roomId);
  userToConnectionMap.forEach((client, userId) => room?.users.has(userId) && sendMessage(client, msg))
}

