import React, { useState } from 'react';
import './login.css';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase'; // Import auth from your Firebase config file
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // Import db from your Firebase config file

import upload from "../../lib/upload";

const Notification = ({ message, type, onClose }) => (
    <div className={`notification ${type}`}>
        {message}
        <button onClick={onClose}>X</button>
    </div>
);

const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            console.log("User created:", res.user);

            const imgUrl = await upload(avatar.file);

            await setDoc(doc(db, 'users', res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: []
            });
            console.log("User document written");

            await setDoc(doc(db, 'userchats', res.user.uid), {
                chats: []
            });

            console.log("Userchats document written");

            setNotification({ message: 'Account created successfully!', type: 'success' });
        } catch (error) {
            console.error("Error writing document: ", error);
            setNotification({ message: `An error occurred: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setNotification({ message: 'Logged in successfully!', type: 'success' });
        } catch (error) {
            setNotification({ message: `An error occurred: ${error.message}`, type: 'error' });
        }
    };

    return (
        <div className="login">
            {notification &&
                <Notification
                    message={notification.message} 
                    type={notification.type} 
                    onClose={() => setNotification(null)} 
                />
            }
            <div className="item">
                <h2>Welcome Back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder='Email' name='email' required />
                    <input type="password" placeholder='Password' name='password' required />
                    <button type="submit" disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>Create An Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="Avatar" />
                        Upload An Image
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleAvatar} />
                    <input type="text" placeholder='Username' name='username' required />
                    <input type="text" placeholder='Email' name='email' required />
                    <input type="password" placeholder='Password' name='password' required />
                    <button type="submit" disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
