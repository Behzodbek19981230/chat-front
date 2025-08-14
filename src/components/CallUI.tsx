'use client'
import React, { useEffect } from 'react'

import { IconButton } from '@mui/material'

import { useCall } from '@/@core/hooks/useCall'
import { getSocket } from '@/@core/lib/socket'
import VideoCall from './VideoCall'

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
    localVideoElementRef,
    remoteVideoElementRef
  } = useCall(socket, selfUserId)

  useEffect(() => {
    socket.connect()
    socket.emit('user-online', selfUserId)

    return () => {
      socket.disconnect()
    }
  }, [socket, selfUserId])

  return (
    <>
      {/* Call button */}
      {!inCall && !incomingCall && (
        <IconButton color='secondary' onClick={() => callUser(remoteUserId, { audio: true, video: true })}>
          <i className='tabler-video' />
        </IconButton>
      )}

      {(inCall || incomingCall) && (
        <VideoCall
          incomingCall={incomingCall}
          inCall={inCall}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
          endCall={endCall}
          micOn={micOn}
          toggleMic={toggleMic}
          camOn={camOn}
          toggleCam={toggleCam}
          localVideoRef={localVideoElementRef}
          remoteVideoRef={remoteVideoElementRef}
        />
      )}
    </>
  )
}
