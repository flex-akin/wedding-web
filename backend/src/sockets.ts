import { Server as SocketIoServer } from "socket.io";
import type { Server as HttpServer } from "http";

let io: SocketIoServer | undefined;

export function initSockets(server: HttpServer) {
  io = new SocketIoServer(server, { cors: { origin: "*" } });
  return io;
}

export function emitPhotoNew(photo: unknown) {
  io?.emit("photo:new", photo);
}

export function emitPhotoHidden(photoId: string) {
  io?.emit("photo:hidden", photoId);
}

export function emitPhotoLiked(photoId: string, likedBy: string[]) {
  io?.emit("photo:liked", { photoId, likedBy });
}
