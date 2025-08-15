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
    outCall,
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

  console.log('CallUI rendered', { inCall, outCall, incomingCall, micOn, camOn })

  return (
    <>
      {!inCall && !incomingCall && (
        <IconButton color='secondary' onClick={() => callUser(remoteUserId, { audio: true, video: true })}>
          <i className='tabler-video' />
        </IconButton>
      )}

      {(inCall || incomingCall || outCall) && (
        <VideoCall
          outCall={outCall}
          inCall={inCall}
          incomingCall={incomingCall}
          localVideoRef={localVideoElementRef}
          remoteVideoRef={remoteVideoElementRef}
          micOn={micOn}
          camOn={camOn}
          toggleMic={toggleMic}
          toggleCam={toggleCam}
          endCall={endCall}
          acceptCall={acceptCall}
          rejectCall={rejectCall}
        />
      )}
    </>
  )
}
