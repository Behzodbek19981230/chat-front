// lib/socket.ts
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(token?: string) {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SIGNALING_URL!, {
      autoConnect: false,
      transports: ['websocket'],
      withCredentials: true,
      auth: { token } // agar kerak bo'lsa
    })
  }

  return socket
}
