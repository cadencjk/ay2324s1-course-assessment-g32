import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Chat from '../../components/Collaboration/Chat/Chat';
import CodeEditor from '../../components/Collaboration/CodeEditor/CodeEditor';
import QuestionContent from '../../components/Question/QuestionContent/QuestionContent';
import { attemptQuestion } from '../../api/HistoryApi';
import { showSuccessToast } from '../../utils/toast';
import { errorHandler } from '../../utils/errors';
import { getCookie } from '../../utils/helpers';
import './Collaboration.css';
import env from '../../loadEnvironment';

const Collaboration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [jwt, setJwt] = useState('');

  const roomId = location.state?.roomId;
  const hostId = location.state?.hostId;
  const matchedHostId = location.state?.matchedHostId;
  const question = location.state?.question;

  // Check if the user is authenticated before connecting to the socket server
  const socket = io(env.COLLAB_URL);

  useEffect(() => {
    // Set the JWT token
    setJwt(getCookie());

    // Join the Socket.io roozgm when the component mounts
    socket.emit('joinRoom', { room: roomId, host: hostId });
  }, []);

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom', { room: roomId, host: hostId });
    navigate('/landing');
  };

  const submitAttempt = () => {
      attemptQuestion(jwt, question._id, 'code').then((res) => {
      showSuccessToast(res.data.message);
    }).catch((err) => {
      errorHandler(err);
    });
  };

  return (
    <div className='collaboration-container'>
      <div className='header'>
        <h1>Collaboration</h1>
      </div>
      <div className='content'>
        <div className='left'>
          <QuestionContent question={question} />
        </div>
        <div className='right'>
          <CodeEditor socket={socket} roomId={roomId} />
          <Chat socket={socket} roomId={roomId} host={hostId} />
        </div>
      </div>
      <div className='row-container'>
        <button className='red-button' onClick={handleLeaveRoom}>Leave Room</button>
        <button className='green-button' onClick={submitAttempt}>Submit Attempt</button>
      </div>
    </div>
  );
};

export default Collaboration;
