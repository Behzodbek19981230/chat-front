// CallUI.tsx (aks holda mavjud)
import { useCall } from '@/@core/hooks/useCall'
import VideoCall from './VideoCall'
import { getSocket } from '@core/lib/socket'

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

  // Video element refs bo'yicha
  return (
    <>
      {!inCall && !incomingCall && (
        <button onClick={() => callUser(remoteUserId, { audio: true, video: true })}>
          <span>Call</span>
        </button>
      )}

      {(inCall || incomingCall || outCall) && (
        <VideoCall
          outCall={outCall}
          inCall={inCall}
          incomingCall={incomingCall}
          localVideo={localVideoElementRef}
          remoteVideo={remoteVideoElementRef}
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
