import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload"; // Ensure your upload function can handle various file types
import { format } from "timeago.js";

const Chat = () => {
  const [chat, setChat] = useState({ messages: [] });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState({
    file: null,
    url: "",
    type: ""
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  const endRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Scroll to the bottom when chat messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  // Fetch chat data from Firestore
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data() || { messages: [] });
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  // Handle emoji selection
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  // Handle file selection
  const handleFile = (e) => {
    if (e.target.files[0]) {
      setFile({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
        type: e.target.files[0].type
      });
    }
  };

  // Start the camera and set up the video feed
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraOpen(true);
      } else {
        console.error("Video reference is null");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Capture image from the video feed
  const captureImage = () => {
    const canvas = canvasRef.current;
    if (canvas && videoRef.current) {
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/png');
      setCapturedImage(imageDataUrl);
      setIsCameraOpen(false);
    }
  };

  // Send message
  const handleSend = async () => {
    if (text === "" && !file.file && !capturedImage) return;

    let fileUrl = null;

    try {
      if (file.file) {
        fileUrl = await upload(file.file);
      } else if (capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        fileUrl = await upload(blob, 'image/png');
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(fileUrl && { file: fileUrl, fileType: file.type }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    } finally {
      setFile({
        file: null,
        url: "",
        type: ""
      });

      setCapturedImage(null);
      setText("");
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup media stream on component unmount
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>Lorem ipsum dolor, sit amet.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Phone Icon" />
          <img src="./video.png" alt="Video Icon" />
          <img src="./info.png" alt="Info Icon" />
        </div>
      </div>
      <div className="center">
        {chat.messages.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={message.createdAt}
          >
            <div className="texts">
              {message.file && (
                <a href={message.file} download>
                  {message.fileType.startsWith('image/') ? (
                    <img src={message.file} alt="Message File" />
                  ) : (
                    <p>{message.fileType.split('/')[1].toUpperCase()} File</p>
                  )}
                </a>
              )}
              <p>{message.text}</p>
              <span>{format(message.createdAt.toDate())}</span>
            </div>
          </div>
        ))}
        {file.url && (
          <div className="message own">
            <div className="texts">
              {file.type.startsWith('image/') ? (
                <img src={file.url} alt="Uploaded File" />
              ) : (
                <p>{file.type.split('/')[1].toUpperCase()} File</p>
              )}
            </div>
          </div>
        )}
        {capturedImage && (
          <div className="message own">
            <div className="texts">
              <img src={capturedImage} alt="Captured Photo" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="Attach File Icon" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            accept="*/*"
            onChange={handleFile}
          />
          <img
            src="./camera.png"
            alt="Camera Icon"
            onClick={startCamera}
          />
          <img src="./mic.png" alt="Microphone Icon" />
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt="Emoji Icon"
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>

      {/* Camera view and controls */}
      {isCameraOpen && (
        <div className="camera">
          <video ref={videoRef} style={{ width: '100%', height: 'auto' }}></video>
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          <button onClick={captureImage}>Capture</button>
          <button onClick={() => setIsCameraOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Chat;
