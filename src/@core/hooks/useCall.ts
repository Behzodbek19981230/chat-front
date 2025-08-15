// hooks/useCall.ts
import { useEffect, useRef, useState } from 'react'

import type { Socket } from 'socket.io-client'

type MediaPrefs = { audio: boolean; video: boolean }

export function useCall(socket: Socket, selfUserId: string | number) {
  const [inCall, setInCall] = useState(false)
  const [outCall, setOutCall] = useState(false)
  const [incomingCall, setIncomingCall] = useState<null | { fromUserId: any; media: MediaPrefs }>(null)

  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)

  // ✅ video element ref-larini hook ichida saqlaymiz
  const localVideoElementRef = useRef<HTMLVideoElement | null>(null)
  const remoteVideoElementRef = useRef<HTMLVideoElement | null>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const remoteUserIdRef = useRef<string | number | null>(null)

  const iceServers: RTCIceServer[] = [
    { urls: 'stun:45.138.159.166:3478' },
    {
      urls: 'turn:45.138.159.166:3478',
      username: 'chatuser',
      credential: 'ch@tpass123'
    }
  ]

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({ iceServers })

    pc.onicecandidate = e => {
      if (e.candidate && remoteUserIdRef.current) {
        socket.emit('webrtc-ice', { toUserId: remoteUserIdRef.current, candidate: e.candidate })
      }
    }

    pc.ontrack = e => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream()
      }

      // Avvalgi tracklarni to‘xtatib tashlaymiz
      remoteStreamRef.current.getTracks().forEach(track => track.stop())

      // Yangi tracklarni qo‘shamiz
      e.streams[0].getTracks().forEach(track => {
        remoteStreamRef.current!.addTrack(track)
      })

      // Video elementga ulash
      if (remoteVideoElementRef.current) {
        remoteVideoElementRef.current.srcObject = remoteStreamRef.current
      }
    }

    pcRef.current = pc
  }

  const getMedia = async (media: MediaPrefs) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: media.audio,
        video: media.video
      })

      localStreamRef.current = stream

      if (localVideoElementRef.current) {
        localVideoElementRef.current.srcObject = stream
      }

      stream.getTracks().forEach(track => {
        pcRef.current?.addTrack(track, stream)
      })
    } catch (error) {
      console.error('Error getting media:', error)
      throw error
    }
  }

  const callUser = async (toUserId: string | number, media: MediaPrefs) => {
    try {
      remoteUserIdRef.current = toUserId
      createPeerConnection()
      await getMedia(media)
      socket.emit('call-user', { fromUserId: selfUserId, toUserId, media })
      setOutCall(true)
    } catch (error) {
      console.error('Call failed:', error)
      endCall()
    }
  }

  const acceptCall = async () => {
    if (!incomingCall) return

    try {
      remoteUserIdRef.current = incomingCall.fromUserId
      socket.emit('answer-call', {
        fromUserId: selfUserId,
        toUserId: incomingCall.fromUserId,
        accept: true
      })
      createPeerConnection()
      await getMedia(incomingCall.media)
      setInCall(true)
      setIncomingCall(null)
    } catch (error) {
      console.error('Accept call failed:', error)
      endCall()
    }
  }

  const rejectCall = () => {
    if (!incomingCall) return
    socket.emit('answer-call', { fromUserId: selfUserId, toUserId: incomingCall.fromUserId, accept: false })
    setIncomingCall(null)
  }

  const endCall = () => {
    if (remoteUserIdRef.current) {
      socket.emit('end-call', { toUserId: remoteUserIdRef.current })
    }

    localStreamRef.current?.getTracks().forEach(t => t.stop())
    remoteStreamRef.current?.getTracks().forEach(t => t.stop())
    pcRef.current?.close()
    pcRef.current = null
    setInCall(false)
    setOutCall(false)
    remoteUserIdRef.current = null
  }

  const toggleMic = () => {
    setMicOn(prev => {
      localStreamRef.current?.getAudioTracks().forEach(t => (t.enabled = !prev))

      return !prev
    })
  }

  const toggleCam = () => {
    setCamOn(prev => {
      localStreamRef.current?.getVideoTracks().forEach(t => (t.enabled = !prev))

      return !prev
    })
  }

  // Socket listeners
  useEffect(() => {
    const handleIncomingCall = ({ fromUserId, media }: { fromUserId: any; media: MediaPrefs }) => {
      setIncomingCall({ fromUserId, media })
    }

    const handleCallAnswered = async ({ accept }: { accept: boolean }) => {
      if (!accept) {
        endCall()
        alert('User rejected the call')

        return
      }

      try {
        const offer = await pcRef.current!.createOffer()

        await pcRef.current!.setLocalDescription(offer)
        socket.emit('webrtc-offer', {
          toUserId: remoteUserIdRef.current,
          offer
        })
      } catch (error) {
        console.error('Error creating offer:', error)
        endCall()
      }
    }

    const handleWebRTCOffer = async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
      try {
        await pcRef.current!.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pcRef.current!.createAnswer()

        await pcRef.current!.setLocalDescription(answer)
        socket.emit('webrtc-answer', {
          toUserId: remoteUserIdRef.current,
          answer
        })
        setInCall(true)
      } catch (error) {
        console.error('Error handling offer:', error)
        endCall()
      }
    }

    socket.on('incoming-call', handleIncomingCall)
    socket.on('call-answered', handleCallAnswered)
    socket.on('webrtc-offer', handleWebRTCOffer)

    socket.on('webrtc-answer', async ({ answer }) => {
      await pcRef.current!.setRemoteDescription(new RTCSessionDescription(answer))
      setInCall(true)
      setOutCall(false)
    })

    socket.on('webrtc-ice', async ({ candidate }) => {
      if (candidate) {
        await pcRef.current!.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    socket.on('call-ended', () => {
      endCall()
    })

    return () => {
      socket.off('incoming-call', handleIncomingCall)
      socket.off('call-answered', handleCallAnswered)
      socket.off('webrtc-offer', handleWebRTCOffer)
      socket.off('webrtc-answer')
      socket.off('webrtc-ice')
      socket.off('call-ended')
    }
  }, [socket])

  return {
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
    outCall,

    // ✅ video elementlarni tashqaridan ulash uchun
    localVideoElementRef,
    remoteVideoElementRef,
    localStreamRef,
    remoteStreamRef
  }
}
