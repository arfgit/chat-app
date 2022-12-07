import React, { useRef, useEffect } from "react";
import Moment from "react-moment";

const Message = ({ message, user1 }) => {
  const scrollRef = useRef();

  useEffect(() => {
    //scroll down whenever a new message appears
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  return (
    <div
      className={`message-wrapper ${message.from === user1 ? "own" : ""}`}
      ref={scrollRef}
    >
      <p className={message.from === user1 ? "me" : "friend"}>
        {message.media ? <img src={message.media} alt={message.text} /> : null}
        {message.text}
        <br />
        <small>
          <Moment fromNow>{message.createdAt.toDate()}</Moment>
        </small>
      </p>
    </div>
  );
};

export default Message;
