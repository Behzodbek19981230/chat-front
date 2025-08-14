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

  // Add this effect to handle remote stream changes
  useEffect(() => {
    const updateVideoElements = () => {
      console.log('Updating video elements', {
        local: localStreamRef.current,
        remote: remoteStreamRef.current
      })

      if (localVideo.current) {
        localVideo.current.srcObject = localStreamRef.current

        if (localStreamRef.current) {
          console.log(
            'Local video tracks:',
            localStreamRef.current.getTracks().map(t => t.kind)
          )
        }
      }

      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStreamRef.current

        if (remoteStreamRef.current) {
          console.log(
            'Remote video tracks:',
            remoteStreamRef.current.getTracks().map(t => t.kind)
          )
        }
      }
    }

    updateVideoElements()

    // Add event listeners for stream changes
    const localCleanup = () => {
      if (localVideo.current) {
        localVideo.current.srcObject = null
      }
    }

    const remoteCleanup = () => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = null
      }
    }

    return () => {
      localCleanup()
      remoteCleanup()
    }
  }, [inCall, incomingCall, outCall]) // Re-run when call states change

  console.log('CallUI rendered', {
    inCall,
    outCall,
    incomingCall,
    micOn,
    camOn,
    localStreamRef: localStreamRef.current,
    remoteStreamRef: remoteStreamRef.current
  })
  console.log('Remote stream state:', {
    hasRemoteStream: !!remoteStreamRef.current,
    tracks: remoteStreamRef.current?.getTracks().map(t => ({
      kind: t.kind,
      enabled: t.enabled,
      readyState: t.readyState
    }))
  })

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
