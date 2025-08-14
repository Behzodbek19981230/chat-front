// hooks/useCall.ts
import { useState, useRef, useEffect } from 'react'

import type { Socket } from 'socket.io-client'

type MediaPrefs = { audio: boolean; video: boolean }

export function useCall(socket: Socket, selfUserId: string | number) {
  const [inCall, setInCall] = useState(false)
  const [incomingCall, setIncomingCall] = useState<null | { fromUserId: any; media: MediaPrefs }>(null)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const localStreamRef = useRef<MediaStream | null>(null)
  const remoteStreamRef = useRef<MediaStream | null>(null)
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
      if (!remoteStreamRef.current) remoteStreamRef.current = new MediaStream()
      e.streams[0].getTracks().forEach(t => remoteStreamRef.current!.addTrack(t))
    }

    pcRef.current = pc
  }

  const getMedia = async (media: MediaPrefs) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: media.audio,
      video: media.video
    })

    localStreamRef.current = stream
    stream.getTracks().forEach(track => pcRef.current!.addTrack(track, stream))
  }

  // Qo‘ng‘iroq qilish
  const callUser = async (toUserId: string | number, media: MediaPrefs) => {
    remoteUserIdRef.current = toUserId
    createPeerConnection()
    await getMedia(media)
    socket.emit('call-user', { fromUserId: selfUserId, toUserId, media })
  }

  // Qo‘ng‘iroq qabul qilish
  const acceptCall = async () => {
    if (!incomingCall) return
    remoteUserIdRef.current = incomingCall.fromUserId
    socket.emit('answer-call', { fromUserId: selfUserId, toUserId: incomingCall.fromUserId, accept: true })
    createPeerConnection()
    await getMedia(incomingCall.media)
    setInCall(true)
    setIncomingCall(null)
  }

  // Qo‘ng‘iroqni rad etish
  const rejectCall = () => {
    if (!incomingCall) return
    socket.emit('answer-call', { fromUserId: selfUserId, toUserId: incomingCall.fromUserId, accept: false })
    setIncomingCall(null)
  }

  // Qo‘ng‘iroqni tugatish
  const endCall = () => {
    if (remoteUserIdRef.current) {
      socket.emit('end-call', { toUserId: remoteUserIdRef.current })
    }

    localStreamRef.current?.getTracks().forEach(t => t.stop())
    remoteStreamRef.current?.getTracks().forEach(t => t.stop())
    pcRef.current?.close()
    pcRef.current = null
    setInCall(false)
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
    socket.on('incoming-call', ({ fromUserId, media }) => {
      setIncomingCall({ fromUserId, media })
    })

    socket.on('call-answered', async ({ accept }) => {
      if (!accept) {
        endCall()
        alert('User rejected the call')

        return
      }

      // create offer
      const offer = await pcRef.current!.createOffer()

      await pcRef.current!.setLocalDescription(offer)
      socket.emit('webrtc-offer', { toUserId: remoteUserIdRef.current, offer })
    })

    socket.on('webrtc-offer', async ({ offer }) => {
      await pcRef.current!.setRemoteDescription(new RTCSessionDescription(offer))
      const answer = await pcRef.current!.createAnswer()

      await pcRef.current!.setLocalDescription(answer)
      socket.emit('webrtc-answer', { toUserId: remoteUserIdRef.current, answer })
      setInCall(true)
    })

    socket.on('webrtc-answer', async ({ answer }) => {
      await pcRef.current!.setRemoteDescription(new RTCSessionDescription(answer))
      setInCall(true)
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
      socket.off('incoming-call')
      socket.off('call-answered')
      socket.off('webrtc-offer')
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
    localStreamRef,
    remoteStreamRef
  }
}
