'use client'
import React, { useEffect, useRef } from 'react'

import { useCall } from '@/@core/hooks/useCall'
import { getSocket } from '@/@core/lib/socket'

export default function CallUI({ selfUserId, remoteUserId }: { selfUserId: string; remoteUserId: string }) {
  const socket = getSocket()

  const {
    inCall,
    incomingCall,
    callUser,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCam,
    micOn,
    camOn,
    localStreamRef,
    remoteStreamRef
  } = useCall(socket, selfUserId)

  const localVideo = useRef<HTMLVideoElement>(null)
  const remoteVideo = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    socket.connect()
    socket.emit('user-online', selfUserId)

    return () => {
      socket.disconnect()
    }
  }, [socket, selfUserId])

  useEffect(() => {
    if (localVideo.current && localStreamRef.current) {
      localVideo.current.srcObject = localStreamRef.current
    }

    if (remoteVideo.current && remoteStreamRef.current) {
      remoteVideo.current.srcObject = remoteStreamRef.current
    }
  })

  return (
    <div className='p-3 border rounded-lg'>
      {!inCall && !incomingCall && (
        <button
          onClick={() => callUser(remoteUserId, { audio: true, video: true })}
          className='px-4 py-2 bg-blue-500 text-white rounded'
        >
          Call {remoteUserId}
        </button>
      )}

      {incomingCall && !inCall && (
        <div>
          <p>{incomingCall.fromUserId} is calling...</p>
          <button onClick={acceptCall} className='px-4 py-2 bg-green-500 text-white rounded'>
            Accept
          </button>
          <button onClick={rejectCall} className='px-4 py-2 bg-red-500 text-white rounded'>
            Reject
          </button>
        </div>
      )}

      {inCall && (
        <div>
          <div className='flex gap-2'>
            <video ref={localVideo} autoPlay muted playsInline className='w-1/2 bg-black rounded' />
            <video ref={remoteVideo} autoPlay playsInline className='w-1/2 bg-black rounded' />
          </div>
          <div className='flex gap-2 mt-2'>
            <button onClick={toggleMic} className='px-3 py-1 bg-gray-300 rounded'>
              {micOn ? 'Mic Off' : 'Mic On'}
            </button>
            <button onClick={toggleCam} className='px-3 py-1 bg-gray-300 rounded'>
              {camOn ? 'Cam Off' : 'Cam On'}
            </button>
            <button onClick={endCall} className='px-3 py-1 bg-red-500 text-white rounded'>
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
