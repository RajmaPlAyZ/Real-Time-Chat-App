import { useEffect, useState } from "react";
import { arrayRemove, arrayUnion, doc, getDocs, collection, updateDoc, query, where } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import "./detail.css";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat } =
    useChatStore();
  const { currentUser } = useUserStore();
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!chatId) return;

      try {
        const photosRef = collection(db, "chats", chatId, "photos");
        const q = query(photosRef, where("senderId", "==", currentUser.id));
        const querySnapshot = await getDocs(q);
        const fetchedPhotos = querySnapshot.docs.map(doc => doc.data());
        console.log('Fetched Photos:', fetchedPhotos); // Debug log
        setPhotos(fetchedPhotos);
      } catch (err) {
        console.log(err);
      }
    };

    fetchPhotos();
  }, [chatId, currentUser.id]);

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username || "User Name"}</h2>
        <p>Lorem ipsum dolor sit amet.</p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared photos</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          <div className="photos">
            {photos.length > 0 ? (
              photos.map((photo, index) => (
                <div className="photoItem" key={index}>
                  <div className="photoDetail">
                    <img src={photo.url} alt={photo.filename || 'Shared photo'} />
                    <span>{photo.filename || 'No filename'}</span>
                  </div>
                  <img src="./download.png" alt="Download" className="icon" />
                </div>
              ))
            ) : (
              <p>No photos shared yet.</p>
            )}
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>
        <div className="buttons-container">
          <button onClick={handleBlock}>
            {isCurrentUserBlocked
              ? "You are Blocked!"
              : isReceiverBlocked
              ? "User blocked"
              : "Block User"}
          </button>
          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
