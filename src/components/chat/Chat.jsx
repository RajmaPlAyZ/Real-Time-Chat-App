import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { format } from "timeago.js";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";
import upload from "../../lib/upload";
import { useUserStore } from "../../lib/userStore";
import "./freshChat.css";

const Chat = () => {
  const [chat, setChat] = useState({ messages: [] });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState({
    file: null,
    url: "",
    type: "",
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);
  const webcamRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data() || { messages: [] });
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleFile = (e) => {
    if (e.target.files[0]) {
      setFile({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
        type: e.target.files[0].type,
      });
    }
  };

  const captureImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setFile({
        file: null,
        url: "",
        type: "image/png",
      });
      setIsCameraOpen(false);
    }
  };

  const handleSend = async () => {
    if (text === "" && !file.file && !capturedImage) return;

    let fileUrl = null;
    let fileType = file.type || "unknown/type";

    try {
      if (file.file) {
        fileUrl = await upload(file.file);
      } else if (capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        fileUrl = await upload(blob, "image/png");
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(fileUrl && { file: fileUrl, fileType }),
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
        type: "",
      });

      setCapturedImage(null);
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="user-info">
          <img
            src={user?.avatar || "./avatar.png"}
            alt="User Avatar"
            className="user-avatar"
          />
          <div className="user-details">
            <span className="username">{user?.username}</span>
            <p className="status">Active now</p>
          </div>
        </div>
        <div className="chat-icons">
          <img src="./phone.png" alt="Call" />
          <img src="./video.png" alt="Video Call" />
          <img src="./info.png" alt="Info" />
        </div>
      </div>

      <div className="chat-messages">
        {chat.messages.map((message) => (
          <div
            className={`message ${
              message.senderId === currentUser?.id ? "own" : ""
            }`}
            key={message.createdAt}
          >
            {message.file && (
              <a href={message.file} download>
                {message.fileType.startsWith("image/") ? (
                  <img src={message.file} alt="Attachment" />
                ) : (
                  <p>{message.fileType.split("/")[1].toUpperCase()} File</p>
                )}
              </a>
            )}
            <p>{message.text}</p>
            <span className="message-time">
              {format(message.createdAt.toDate())}
            </span>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="chat-input-section">
        <div className="input-icons">
          <label htmlFor="file" className="icon-label">
            <img src="./img.png" alt="Attach File" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleFile}
          />
          <img
            src="./camera.png"
            alt="Camera"
            className="icon"
            onClick={() => setIsCameraOpen(true)}
          />
          <img src="./mic.png" alt="Mic" className="icon" />
        </div>

        <input
          type="text"
          className="chat-input"
          placeholder="Type your message here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="emoji-container">
          <img
            src="./emoji.png"
            alt="Emoji"
            className="emoji-icon"
            onClick={() => setOpen((prev) => !prev)}
          />
          {open && <EmojiPicker onEmojiClick={handleEmoji} />}
        </div>

        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>

      {isCameraOpen && (
        <div className="camera-modal">
          <Webcam ref={webcamRef} screenshotFormat="image/png" />
          <div className="camera-controls">
            <button onClick={captureImage}>Capture</button>
            <button onClick={() => setIsCameraOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
