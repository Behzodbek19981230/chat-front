import React from 'react'

import Image from 'next/image'

import { Button, IconButton, Typography } from '@mui/material'

type Props = {
  incomingCall: { fromUserId: string } | null
  inCall: boolean
  outCall: boolean
  acceptCall: () => void
  rejectCall: () => void
  endCall: () => void
  micOn: boolean
  toggleMic: () => void
  camOn: boolean
  toggleCam: () => void
  localVideo: React.RefObject<HTMLVideoElement>
  remoteVideo: React.RefObject<HTMLVideoElement>
}

export default function VideoCall({
  incomingCall,
  outCall,
  inCall,
  acceptCall,
  rejectCall,
  endCall,
  micOn,
  toggleMic,
  camOn,
  toggleCam,
  localVideo,
  remoteVideo
}: Props) {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-900 z-50'>
      {/* Incoming call UI */}
      {incomingCall && !inCall && (
        <div className='flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-lg'>
          <Typography variant='h6' className='text-center'>
            {incomingCall.fromUserId} is calling...
          </Typography>
          <Image src='/images/videocall.gif' alt='Incoming Call' width={120} height={120} className='mb-4' />
          <div className='flex gap-4'>
            <Button onClick={acceptCall} variant='contained' color='success' startIcon={<i className='tabler-phone' />}>
              Qabul qilish
            </Button>
            <Button
              onClick={rejectCall}
              variant='contained'
              color='error'
              startIcon={<i className='tabler-phone-off' />}
            >
              Rad etish
            </Button>
          </div>
        </div>
      )}

      {/* Outgoing call UI */}
      {outCall && !inCall && (
        <div className='flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-lg'>
          <Typography variant='h6' className='text-center'>Calling...</Typography>
          <Image src='/images/videocall.gif' alt='Outgoing Call' width={120} height={120} className='mb-4' />
          <div className='flex gap-4'>
            <Button onClick={endCall} variant='contained' color='error' startIcon={<i className='tabler-phone-off' />}>
              End Call
            </Button> <IconButton onClick={toggleMic} className='bg-white/20 hover:bg-white/30 text-white'>
            {micOn ? <i className='tabler-microphone text-xl' /> : <i className='tabler-microphone-off text-xl' />}
          </IconButton>
            <IconButton onClick={toggleCam} className='bg-white/20 hover:bg-white/30 text-white'>
              {camOn ? <i className='tabler-video text-xl' /> : <i className='tabler-video-off text-xl' />}
            </IconButton>
            <IconButton onClick={endCall} className='bg-red-600 hover:bg-red-700 text-white'>
              <i className='tabler-phone-off text-xl' />
            </IconButton>
          </div>
        </div>
      )}

      {/* In-call UI */}
      {inCall && (
        <div className='relative w-full h-full bg-black'>
          {/* Remote video - fullscreen */}
          <video ref={remoteVideo} autoPlay playsInline className='w-full h-full object-cover bg-black' />

          {/* Local video - small overlay */}
          <video
            ref={localVideo}
            autoPlay
            muted
            playsInline
            className='absolute bottom-4 right-4 w-40 h-28 object-cover rounded-lg border-2 border-white shadow-lg'
          />

          {/* Controls */}
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4'>
            <IconButton onClick={toggleMic} className='bg-white/20 hover:bg-white/30 text-white'>
              {micOn ? <i className='tabler-microphone text-xl' /> : <i className='tabler-microphone-off text-xl' />}
            </IconButton>
            <IconButton onClick={toggleCam} className='bg-white/20 hover:bg-white/30 text-white'>
              {camOn ? <i className='tabler-video text-xl' /> : <i className='tabler-video-off text-xl' />}
            </IconButton>
            <IconButton onClick={endCall} className='bg-red-600 hover:bg-red-700 text-white'>
              <i className='tabler-phone-off text-xl' />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  )
}
