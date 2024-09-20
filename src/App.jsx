import { onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";
import Chat from "./components/chat/Chat";

import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { useChatStore } from "./lib/chatStore";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading"></div>;

  return (
    <div className="container">
      {currentUser ? (
        <>
          <List />
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;