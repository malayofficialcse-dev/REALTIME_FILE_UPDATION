import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useMutation, useSubscription, gql } from '@apollo/client';
import { Mic, MicOff, VideoIcon, VideoOff, Phone, MonitorUp, Focus, Users, GripHorizontal } from 'lucide-react';

const SEND_SIGNAL = gql`
  mutation SendWebRTCSignal($documentId: ID!, $targetId: ID!, $signal: String!) {
    sendWebRTCSignal(documentId: $documentId, targetId: $targetId, signal: $signal)
  }
`;

const SIGNAL_SUBSCRIPTION = gql`
  subscription OnWebRTCSignal($documentId: ID!, $targetId: ID!) {
    webRTCSignalReceived(documentId: $documentId, targetId: $targetId) {
      senderId
      signal
    }
  }
`;

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

export default function WebRTCHuddle({ documentId, currentUserId, activeUsers, inHuddle, onLeaveHuddle }: any) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [sendSignal] = useMutation(SEND_SIGNAL);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteMediaStates, setRemoteMediaStates] = useState<Record<string, { audio: boolean, video: boolean }>>({});

  // Position state for draggability
  const [positions, setPositions] = useState<Record<string, {x: number, y: number}>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const pos = positions[id] || { x: 100, y: 100 };
    setDraggingId(id);
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const handleDrag = useCallback((e: MouseEvent) => {
    if (draggingId) {
      setPositions(prev => ({ ...prev, [draggingId]: { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } }));
    }
  }, [draggingId, dragOffset]);

  const handleDragEnd = () => setDraggingId(null);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => { window.removeEventListener('mousemove', handleDrag); window.removeEventListener('mouseup', handleDragEnd); };
    }
  }, [draggingId, handleDrag]);

  // Set local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const broadcastMediaState = useCallback((states: any) => {
    Object.keys(peersRef.current).forEach(peerId => {
      sendSignal({ variables: { documentId, targetId: peerId, signal: JSON.stringify({ type: 'media_state', ...states }) } });
    });
  }, [documentId, sendSignal]);

  // Handle incoming signals
  useSubscription(SIGNAL_SUBSCRIPTION, {
    variables: { documentId, targetId: currentUserId },
    onData: async ({ data: { data } }) => {
      if (!data?.webRTCSignalReceived || !inHuddle) return;
      const { senderId, signal } = data.webRTCSignalReceived;
      const parsedSignal = JSON.parse(signal);

      if (parsedSignal.type === 'media_state') {
        setRemoteMediaStates(prev => ({ ...prev, [senderId]: { audio: parsedSignal.audio, video: parsedSignal.video } }));
        return;
      }

      let pc = peersRef.current[senderId];
      if (!pc && parsedSignal.type === 'offer') {
        pc = createPeerConnection(senderId);
        await pc.setRemoteDescription(new RTCSessionDescription(parsedSignal));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal({ variables: { documentId, targetId: senderId, signal: JSON.stringify(pc.localDescription) } });
        
        // Immediately tell them our media state
        sendSignal({ variables: { documentId, targetId: senderId, signal: JSON.stringify({ type: 'media_state', audio: audioEnabled, video: videoEnabled }) } });
      } else if (pc) {
        if (parsedSignal.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(parsedSignal));
        } else if (parsedSignal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(parsedSignal));
        }
      }
    }
  });

  const createPeerConnection = useCallback((targetId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peersRef.current[targetId] = pc;

    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = event => {
      if (event.candidate) {
        sendSignal({ variables: { documentId, targetId, signal: JSON.stringify(event.candidate) } });
      }
    };

    pc.ontrack = event => {
      setRemoteStreams(prev => ({ ...prev, [targetId]: event.streams[0] }));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        setRemoteStreams(prev => {
          const newStreams = { ...prev };
          delete newStreams[targetId];
          return newStreams;
        });
        delete peersRef.current[targetId];
      }
    };

    return pc;
  }, [localStream, sendSignal, documentId]);

  // Connect to active users in huddle
  useEffect(() => {
    if (!inHuddle || !localStream) return;

    activeUsers.forEach(async (user: any) => {
      if (
        user.userId !== currentUserId && 
        user.inHuddle && 
        !peersRef.current[user.userId] &&
        String(currentUserId) > String(user.userId) // Caller logic to prevent glare
      ) {
        const pc = createPeerConnection(user.userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal({ variables: { documentId, targetId: user.userId, signal: JSON.stringify(pc.localDescription) } });
        
        // Tell them our state
        sendSignal({ variables: { documentId, targetId: user.userId, signal: JSON.stringify({ type: 'media_state', audio: audioEnabled, video: videoEnabled }) } });
      }
    });
  }, [activeUsers, inHuddle, localStream, currentUserId, createPeerConnection, documentId, sendSignal, audioEnabled, videoEnabled]);

  // Initialize media
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (inHuddle) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(s => {
          stream = s;
          setLocalStream(s);
          setAudioEnabled(true);
          setVideoEnabled(true);
          setPositions(prev => ({ ...prev, 'local': { x: 20, y: window.innerHeight - 300 } }));
        })
        .catch(err => {
          console.error('Failed to get user media', err);
          alert("Microphone/Camera permission denied. You can only view others.");
          setLocalStream(new MediaStream());
        });
    } else {
      if (localStream) localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
      Object.values(peersRef.current).forEach(pc => pc.close());
      peersRef.current = {};
      setRemoteStreams({});
    }

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [inHuddle]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
        broadcastMediaState({ audio: !audioEnabled, video: videoEnabled });
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack && !isScreenSharing) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
        broadcastMediaState({ audio: audioEnabled, video: !videoEnabled });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!localStream) return;
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Handle when user clicks "Stop sharing" in browser UI
        screenTrack.onended = () => {
          stopScreenShare();
        };

        const currentVideoTrack = localStream.getVideoTracks()[0];
        localStream.removeTrack(currentVideoTrack);
        localStream.addTrack(screenTrack);
        
        // Update all peers with new track
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        setIsScreenSharing(true);
        setVideoEnabled(true);
        if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
      } else {
        stopScreenShare();
      }
    } catch (e) {
      console.error("Screen share failed", e);
    }
  };

  const stopScreenShare = async () => {
    if (!localStream) return;
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const cameraTrack = cameraStream.getVideoTracks()[0];
      const screenTrack = localStream.getVideoTracks()[0];
      
      screenTrack.stop();
      localStream.removeTrack(screenTrack);
      
      cameraTrack.enabled = videoEnabled; // preserve state
      localStream.addTrack(cameraTrack);

      Object.values(peersRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(cameraTrack);
      });

      setIsScreenSharing(false);
      if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    } catch (e) {
      console.error(e);
    }
  };

  if (!inHuddle) return null;

  return (
    <>
      <div className="fixed top-16 left-0 right-0 pointer-events-none z-50 flex items-start justify-center pt-4">
        {/* Huddle Global indicator */}
        <div className="bg-red-500/90 text-white backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-red-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 pointer-events-auto shadow-red-500/20">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          Live Team Huddle ({Object.keys(remoteStreams).length + 1})
        </div>
      </div>

      {localStream && (
        <div 
          className="fixed rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.3)] glass-panel z-50 border border-border flex flex-col pointer-events-auto bg-card"
          style={{ left: positions['local']?.x || 20, top: positions['local']?.y || window.innerHeight - 300, width: 240 }}
        >
          {/* Drag Handle & Header */}
          <div 
            className="w-full bg-secondary/80 backdrop-blur-sm p-1.5 flex justify-between items-center cursor-move border-b border-border"
            onMouseDown={(e) => handleDragStart(e, 'local')}
          >
            <div className="flex items-center gap-1.5 px-2">
              <GripHorizontal size={14} className="text-muted-foreground" />
              <span className="text-[10px] font-black uppercase tracking-wider text-foreground">You {isScreenSharing && "(Sharing)"}</span>
            </div>
            <button onClick={onLeaveHuddle} className="bg-red-500/10 hover:bg-red-500 rounded p-1 text-red-500 hover:text-white transition-colors">
              <Phone size={12} />
            </button>
          </div>

          {/* Video Container */}
          <div className="relative w-full aspect-video bg-black/90 flex items-center justify-center">
            {videoEnabled || isScreenSharing ? (
              <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${isScreenSharing ? '' : 'scale-x-[-1]'}`} />
            ) : (
              <div className="w-16 h-16 rounded-full bg-secondary text-muted-foreground flex items-center justify-center border-2 border-border/50">
                <VideoOff size={24} />
              </div>
            )}
            {!audioEnabled && (
              <div className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-full shadow-lg">
                <MicOff size={12} className="text-white" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-2 gap-2 flex items-center justify-center bg-card border-t border-border">
            <button 
              onClick={toggleAudio}
              className={`p-2.5 rounded-xl transition-all ${audioEnabled ? 'bg-secondary hover:bg-secondary/80 text-foreground' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
            >
              {audioEnabled ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button 
              onClick={toggleVideo}
              disabled={isScreenSharing}
              className={`p-2.5 rounded-xl transition-all disabled:opacity-30 ${videoEnabled ? 'bg-secondary hover:bg-secondary/80 text-foreground' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}
            >
              {videoEnabled ? <VideoIcon size={16} /> : <VideoOff size={16} />}
            </button>
            <button 
              onClick={toggleScreenShare}
              className={`p-2.5 rounded-xl transition-all ${isScreenSharing ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-secondary hover:bg-secondary/80 text-foreground'}`}
            >
              <MonitorUp size={16} />
            </button>
          </div>
        </div>
      )}

      {Object.entries(remoteStreams).map(([peerId, stream], index) => {
        const peerLoc = positions[peerId] || { x: 280 + (index * 260), y: window.innerHeight - 300 };
        const userEmail = activeUsers.find((u:any) => u.userId === peerId)?.email || 'Collab';
        const mediaState = remoteMediaStates[peerId] || { audio: true, video: true };

        return (
          <div
            key={peerId}
            className="fixed rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.2)] glass-panel z-50 border border-border flex flex-col pointer-events-auto bg-card"
            style={{ left: peerLoc.x, top: peerLoc.y, width: 240 }}
          >
            <div 
              className="w-full bg-secondary/80 backdrop-blur-sm p-1.5 flex items-center gap-1.5 cursor-move border-b border-border px-3"
              onMouseDown={(e) => handleDragStart(e, peerId)}
            >
              <GripHorizontal size={14} className="text-muted-foreground mr-1" />
              <div 
                className="w-4 h-4 rounded-full flex flex-shrink-0 items-center justify-center text-[8px] font-black text-white" 
                style={{ backgroundColor: `hsl(${(index * 137) % 360}, 65%, 55%)` }}
              >
                {userEmail[0].toUpperCase()}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-foreground truncate flex-1">
                {userEmail.split('@')[0]}
              </span>
            </div>
            
            <div className="relative w-full aspect-video bg-black/90 flex items-center justify-center">
               {mediaState.video ? (
                  <VideoPlayer stream={stream} />
               ) : (
                  <div className="w-16 h-16 rounded-full bg-secondary text-muted-foreground flex items-center justify-center border-2 border-border/50 shadow-inner">
                    <span className="text-2xl font-black">{userEmail[0].toUpperCase()}</span>
                  </div>
               )}
               
               {!mediaState.audio && (
                  <div className="absolute top-2 right-2 bg-red-500 p-1.5 rounded-full shadow-lg border-2 border-red-600">
                    <MicOff size={12} className="text-white" />
                  </div>
               )}
            </div>
          </div>
        )
      })}
    </>
  );
}

const VideoPlayer = ({ stream }: { stream: MediaStream }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />;
};
