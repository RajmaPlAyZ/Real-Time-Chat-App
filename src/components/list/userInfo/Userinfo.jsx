import { useState } from "react";
import { useUserStore } from "../../../lib/userStore";
import Detail from "./uiDetail/uid"; // Import the Detail component
import "./userInfo.css";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const [isDetailVisible, setIsDetailVisible] = useState(false); // State to toggle the Detail pop-up

  // Function to handle the edit click (show the Detail popup)
  const handleEditClick = () => {
    setIsDetailVisible(true); // Show Detail when edit is clicked
  };

  // Function to close the Detail popup
  const handleCloseDetail = () => {
    setIsDetailVisible(false); // Hide Detail when close is clicked
  };

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="User Avatar" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src="./more.png" alt="More Options" />
        <img src="./video.png" alt="Video Call" />
        <img src="./edit.png" alt="Edit" onClick={handleEditClick} /> {/* Open popup on edit click */}
      </div>

      {/* Conditionally render the Detail popup */}
      {isDetailVisible && (
        <div className="popup"> {/* Popup wrapper for Detail */}
          <div className="popup-inner">
            {/* Pass the handleCloseDetail function to the Detail component to close it */}
            <Detail onBackClick={handleCloseDetail} isVisible={isDetailVisible} />
            <button className="close-popup" onClick={handleCloseDetail}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfo;
