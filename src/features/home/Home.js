import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  Timestamp,
  orderBy,
  setDoc,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import User from "../user/User";
import { MessageForm } from "../messages/MessageForm";
import Message from "../messages/Message";
import * as tf from "@tensorflow/tfjs";
import { load } from "@tensorflow-models/toxicity";

const Home = () => {
  /* Messenger States */
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [messages, setMessages] = useState([]);

  /* Tensorflow States */
  const [loading, setLoading] = useState(false);
  const [toxicity, setToxicity] = useState({ isToxic: false, labels: [] });

  const model = useRef(null);

  const user1 = auth.currentUser.uid;

  useEffect(() => {
    const userRef = collection(db, "users");
    // q entire user collection execpt current logged in user
    const q = query(userRef, where("uid", "not-in", [user1]));

    const snap = onSnapshot(q, (qSnapshot) => {
      let users = [];
      qSnapshot.forEach((doc) => {
        users.push(doc.data());
        setUsers(users);
      });
    });
    return () => snap();
  }, []);

  /* Load tf model */
  useEffect(() => {
    const loadModel = async () => {
      const threshold = 0.9;
      model.current = await load(threshold);
      setLoading(false);
    };

    loadModel();
  }, []);

  const selectUser = async (user) => {
    setChat(user);
    setToxicity({ isToxic: false, labels: [] });

    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    //update UI upon every new message, displaying the most recent at the bottom
    const msgsRef = collection(db, "messages", id, "chat");
    const q = query(msgsRef, orderBy("createdAt", "asc"));

    onSnapshot(q, (qSnapshot) => {
      let message = [];
      qSnapshot.forEach((doc) => {
        message.push(doc.data());
      });
      setMessages(message);
    });

    // Check to see if there is a last message between the logged in user and the selected user
    const docSnap = await getDoc(doc(db, "lastMessages", id));

    // If the last message exist and is from the selected user update the message doc and set unread to false
    if (docSnap.data() && docSnap.data().from !== user1) {
      await updateDoc(doc(db, "lastMessages", id), {
        unread: false,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user2 = chat.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;
    let url;

    setLoading(true);
    const predictions = await model.current.classify(text);
    setLoading(false);

    const isToxic = predictions[6].results[0].match;

    if (isToxic) {
      const labels = [];
      predictions.slice(0, 6).forEach((prediction) => {
        if (prediction.results[0].match) {
          labels.push({
            label: prediction.label,
            prob:
              Math.round(prediction.results[0].probabilities[1] * 100) + "%",
          });
        }
      });
      setToxicity({ isToxic: true, labels });

      await addDoc(collection(db, "messages", id, "chat"), {
        text: "This user has sent an inappropriate message which has been blocked.",
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: url || "",
      });

      await setDoc(doc(db, "lastMessages", id), {
        text: "This user has sent an inappropriate message which has been blocked.",
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: url || "",
        unread: true,
      });
    } else {
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

      await setDoc(doc(db, "lastMessages", id), {
        text,
        from: user1,
        to: user2,
        createdAt: Timestamp.fromDate(new Date()),
        media: url || "",
        unread: true,
      });

      setToxicity({ isToxic: false, labels: [] });
    }

    setText("");
    setImg("");
  };

  return (
    <div>
      <div className="home-container">
        <div className="users-container">
          {users.map((user) => (
            <User
              key={user.uid}
              user={user}
              selectUser={selectUser}
              user1={user1}
              chat={chat}
            />
          ))}
        </div>
        <div className="message-container">
          {chat ? (
            <>
              <div className="message-user">
                <h3>{chat.name}</h3>
              </div>
              <div className="toxic-container">
                {toxicity.isToxic &&
                  toxicity.labels.map((label, i) => (
                    <div key={i} className="error">
                      {label.label + " " + label.prob}
                    </div>
                  ))}
              </div>

              <div className="messages">
                {messages.length
                  ? messages.map((message, i) => (
                      <Message key={i} message={message} user1={user1} />
                    ))
                  : null}
              </div>
              <MessageForm
                handleSubmit={handleSubmit}
                text={text}
                setText={setText}
                setImg={setImg}
                loading={loading}
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
