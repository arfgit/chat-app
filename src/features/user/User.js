import { doc, onSnapshot } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import Img from "../../defaultDog.jpeg";
import { db } from "../../firebase";

const User = ({ user, selectUser, user1, chat }) => {
  const user2 = user?.uid;
  const [data, setData] = useState("");

  useEffect(() => {
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let snap = onSnapshot(doc(db, "lastMessages", id), (doc) => {
      setData(doc.data());
    });

    return () => snap();
  }, []);

  return (
    <>
      <div
        className={`user-wrapper ${chat.name === user.name && "selected-user"}`}
        onClick={() => selectUser(user)}
      >
        <div className="user-info">
          <div className="user-detail">
            <img
              src={user.profileImg || Img}
              alt="profileImg"
              className="profileImg"
            />
            <h4>{user.name}</h4>
            {data?.from !== user1 && data?.unread && (
              <small className="unread">NEW MESSAGE</small>
            )}
          </div>
          <div
            className={`user-status ${user.isOnline ? "online" : "offline"}`}
          ></div>
        </div>
        {data && (
          <p className="truncate">
            <strong>{data.from === user1 ? "Me: " : null}</strong>
            {data.text}
          </p>
        )}
      </div>
      <div
        onClick={() => selectUser(user)}
        className={`sm-container ${chat.name === user.name && "selected-user"}`}
      >
        <img
          src={user.profileImg || Img}
          alt="profileImg"
          className="profileImg sm-screen"
        />
      </div>
    </>
  );
};

export default User;
