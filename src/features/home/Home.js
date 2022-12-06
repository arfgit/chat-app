import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import User from "../user/User";
import { MessageForm } from "../messages/MessageForm";
import Message from "../messages/Message";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [messages, setMessages] = useState([]);

  const user1 = auth.currentUser.uid;

  const selectUser = (user) => {
    setChat(user);
    console.log(user);

    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    //update UI upon every new message, displaying the most recent at the bottom
    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (qsnapShop) => {
      let message = [];
      qsnapShop.forEach((doc) => {
        messages.push(doc.data());
      });
      setMessages(message);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user2 = chat.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let url;

    if (img) {
      const imgRef = ref(
        storage,
        `images/${new Date().getTime()} - ${img.name}`
      );
      const snap = await uploadBytes(imgRef, img);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = dlUrl;
    }

    await addDoc(collection(db, "messages", id, "chat"), {
      text,
      from: user1,
      to: user2,
      createdAt: Timestamp.fromDate(new Date()),
      media: url || "",
    });

    setText("");
  };

  useEffect(() => {
    const userRef = collection(db, "users");
    // q entire user collection execpt current logged in user
    const q = query(userRef, where("uid", "not-in", [user1]));

    const snap = onSnapshot(q, (qSnapshot) =>
      qSnapshot.forEach((doc) => {
        let users = [];
        users.push(doc.data());
        setUsers(users);
      })
    );
    return () => snap();
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div className="home-container">
        <div className="users-container">
          {users.map((user) => (
            <User key={user.uid} user={user} selectUser={selectUser} />
          ))}
        </div>
        <div className="message-container">
          {chat ? (
            <>
              <div className="message-user">
                <h3>{chat.name}</h3>
              </div>
              <div className="messages">
                {messages.length
                  ? messages.map((message, i) => (
                      <Message key={i} message={message} />
                    ))
                  : null}
              </div>
              <MessageForm
                handleSubmit={handleSubmit}
                text={text}
                setText={setText}
                setImg={setImg}
              />
            </>
          ) : (
            <h3 className="no-conv">Select A User To Send Message</h3>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
