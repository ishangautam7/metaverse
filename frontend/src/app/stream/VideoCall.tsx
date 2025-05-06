'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  StreamVideoClient,
  StreamCall,
  StreamVideo,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  User,
  ParticipantView,
  StreamVideoParticipant,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import type { Call } from '@stream-io/video-react-sdk';
const userId = 'Savage_Opress';

// 1. Define user, token, and API details
const apiKey = 'mmhfdzb5evj2';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL1NhdmFnZV9PcHJlc3MiLCJ1c2VyX2lkIjoiU2F2YWdlX09wcmVzcyIsInZhbGlkaXR5X2luX3NlY29uZHMiOjYwNDgwMCwiaWF0IjoxNzQ2NDQ4MTQwLCJleHAiOjE3NDcwNTI5NDB9.n8a9cFe-MZAhk8Naas1rjpezuLnSd9KCJudNHLrTxq8'; // Replace this with actual token or store in .env
const user: User = {
  id: userId,
  name: 'Oliver',
  image: 'https://getstream.io/random_svg/?id=oliver&name=Oliver',
};

const callId = 'MZLzqMDZ1rrc';

const MyParticipantList = ({ participants }: { participants: StreamVideoParticipant[] }) => (
  <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
    {participants.map((participant) => (
      <ParticipantView participant={participant} key={participant.sessionId} />
    ))}
  </div>
);

const MyFloatingLocalParticipant = ({ participant }: { participant?: StreamVideoParticipant }) => {
  if (!participant) return <p>Error: No local participant</p>;

  return (
    <div
      style={{
        position: 'absolute',
        top: '15px',
        left: '15px',
        width: '240px',
        height: '135px',
        boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 10px 3px',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <ParticipantView participant={participant} />
    </div>
  );
};

const MyUILayout = () => {
  const { useCallCallingState, useLocalParticipant, useRemoteParticipants } = useCallStateHooks();

  const callingState = useCallCallingState();
  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  if (callingState !== CallingState.JOINED) {
    return <div>Joining the call...</div>;
  }

  return (
    <StreamTheme>
      <MyParticipantList participants={remoteParticipants} />
      <MyFloatingLocalParticipant participant={localParticipant} />
    </StreamTheme>
  );
};

export const VideoCallPage = () => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const clientRef = useRef<StreamVideoClient | null>(null);

  useEffect(() => {
    const init = async () => {
      const videoClient = new StreamVideoClient({ apiKey });
      await videoClient.connectUser(user, token);

      const joinedCall = videoClient.call('default', callId);
      await joinedCall.join({ create: true });

      setClient(videoClient);
      setCall(joinedCall);
      clientRef.current = videoClient;
    };

    init();

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnectUser();
      }
    };
  }, []);

  if (!client || !call) return <div>Connecting to video call...</div>;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <MyUILayout />
      </StreamCall>
    </StreamVideo>
  );
  
};

export default VideoCallPage;
