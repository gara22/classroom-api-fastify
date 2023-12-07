import { CustomWebSocket } from "./socket";

//TODO: maybe instead of users, we should store socket ids... 
type Room = {
  id: string;
  users: Set<string>;
};

const rooms = new Map<string, Room>();
const userToConnectionMap: Map<string, CustomWebSocket> = new Map();

const joinRoom = (id: string, user: string) => {
  const roomToJoin = rooms.get(id);
  if (!roomToJoin) {
    createRoom(id);
    joinRoom(id, user);
    return;
  }

  if (roomToJoin.users.has(user)) {
    throw new Error('User already in room');
  }
  const updatedUsers = roomToJoin.users.add(user);

  rooms.set(id, { ...roomToJoin, users: updatedUsers });
  console.log("🚀 ~ file: room.ts:22 ~ joinRoom ~ rooms:", rooms)
};

const createRoom = (id: string) => {
  const newRoom: Room = {
    id,
    users: new Set(),
  };
  rooms.set(id, newRoom);
};

const leaveRoom = (roomId: string, userId: string) => {
  const roomToLeave = rooms.get(roomId);
  if (!roomToLeave) {
    throw Error(`Cannot leave room! Room: ${roomId} doesn't exist`);
  }

  if(!rooms.get(roomId)?.users.has(userId)){
    throw Error(`Cannot leave room! User:  ${userId} is not in room: ${roomId}`);
  }

  //this mutates roomtoleave probably  
  roomToLeave.users.delete(userId); 

  rooms.set(roomId, { ...roomToLeave });
  //if room is empty, delete it
  if(rooms.get(roomId)?.users.size === 0){
    rooms.delete(roomId);
  }
  console.log("🚀 ~ file: room.ts:22 ~ joinRoom ~ rooms:", rooms)
};


const createRoomId = (classRoomId: string, startDate: string, endDate: string) =>
  `${classRoomId}-${startDate}-${endDate}`;

export { joinRoom, leaveRoom, createRoom, rooms, createRoomId, userToConnectionMap };
