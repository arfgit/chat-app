import React from "react";
import Moment from "react-moment";

const Message = ({ message }) => {
  return (
    <div className="message-wrapper">
      <p>
        {message.media ? <img src={message.media} alt={message.text} /> : null}
        {message.text}
        <br />
        <small>
          <Moment fromNow={message.createdAt.toDate()}></Moment>
        </small>
      </p>
    </div>
  );
};

export default Message;
