type Room = {
  id: string;
  users: Set<string>;
};

const rooms = new Map<string, Room>();

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
};

const createRoom = (id: string) => {
  const newRoom: Room = {
    id,
    users: new Set(),
  };
  rooms.set(id, newRoom);
};

const leaveRoom = (id: string, user: string) => {
  const roomToLeave = rooms.get(id);
  if (!roomToLeave) {
    throw Error(`Cannot leave room! Room: ${id} doesn't exist`);
  }

  //this mutates roomtoleave probably
  roomToLeave.users.delete(user);

  rooms.set(id, { ...roomToLeave });
};

const createRoomId = (classRoomId: string, startDate: string, endDate: string) =>
  `${classRoomId}-${startDate}-${endDate}`;

export { joinRoom, leaveRoom, createRoom, rooms, createRoomId };
