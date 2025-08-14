'use client'
import React, { useEffect, useRef } from 'react'

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

  console.log('CallUI rendered', {
    inCall,
    incomingCall,
    micOn,
    camOn,
    localStreamRef: localStreamRef.current,
    remoteStreamRef: remoteStreamRef.current
  })

  return (
    <>
      {/* Call button */}
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
          localVideo={localVideo}
          remoteVideo={remoteVideo}
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
