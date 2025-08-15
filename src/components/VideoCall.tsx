// components/VideoCall.tsx
import React, { useEffect } from 'react'

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

  // Optional: you can also pass streams if you prefer
  // localStreamRef?: React.MutableRefObject<MediaStream | null>
  // remoteStreamRef?: React.MutableRefObject<MediaStream | null>
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
  // Local video srcObject o'rnatilishi uchun useEffect
  useEffect(() => {
    if (localVideo.current && localVideo.current.srcObject == null) {
      // Agar useCall orqali stream to'g'ridan-to'g'ri bog'langan bo'lsa, srcObject mavjud bo'ladi
      // Bu qism odatda useCall tomonidan boshqariladi; bu yerda faqat tizim barqarorligini ta'minlaymiz
      // Bo'sh - streaming boshqacha yo'l bilan olib borilmoqda.
    }
  }, [localVideo])

  useEffect(() => {
    if (remoteVideo.current && remoteVideo.current.srcObject == null) {
      // Xuddi yuqoridagi kabi
    }
  }, [remoteVideo])

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-gray-900 z-50'>
      {/* Incoming call UI */}
      {incomingCall && !inCall && (
        <div className='flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-lg'>
          <p className='text-center'>{incomingCall.fromUserId} is calling...</p>
          <img src='/images/videocall.gif' alt='Incoming Call' width={120} height={120} className='mb-4' />
          <div className='flex gap-4'>
            <button onClick={acceptCall} className='px-4 py-2 rounded bg-green-500 text-white'>
              Qabul qilish
            </button>
            <button onClick={rejectCall} className='px-4 py-2 rounded bg-red-500 text-white'>
              Rad etish
            </button>
          </div>
        </div>
      )}

      {/* Outgoing call UI */}
      {outCall && !inCall && (
        <div className='flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-lg'>
          <p className='text-center'>Calling...</p>
          <img src='/images/videocall.gif' alt='Outgoing Call' width={120} height={120} className='mb-4' />
          <div className='flex gap-4'>
            <button onClick={toggleMic} className='bg-white/20 hover:bg-white/30 text-white p-2 rounded'>
              {micOn ? (
                <span className='tabler-microphone text-xl' />
              ) : (
                <span className='tabler-microphone-off text-xl' />
              )}
            </button>
            <button onClick={toggleCam} className='bg-white/20 hover:bg-white/30 text-white p-2 rounded'>
              {camOn ? <span className='tabler-video text-xl' /> : <span className='tabler-video-off text-xl' />}
            </button>
            <button onClick={endCall} className='bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded'>
              <span className='tabler-phone-off text-xl' />
            </button>
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
            <button onClick={toggleMic} className='bg-white/20 hover:bg-white/30 text-white p-2 rounded'>
              {micOn ? (
                <span className='tabler-microphone text-xl' />
              ) : (
                <span className='tabler-microphone-off text-xl' />
              )}
            </button>
            <button onClick={toggleCam} className='bg-white/20 hover:bg-white/30 text-white p-2 rounded'>
              {camOn ? <span className='tabler-video text-xl' /> : <span className='tabler-video-off text-xl' />}
            </button>
            <button onClick={endCall} className='bg-red-600 hover:bg-red-700 text-white p-2 rounded'>
              <span className='tabler-phone-off text-xl' />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
