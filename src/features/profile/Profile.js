import React, { useEffect, useState } from "react";
import Camera from "./Camera";
import { storage, db, auth } from "../../firebase";
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import Img from "../../defaultDog.jpeg";

const Profile = () => {
  const [img, setImg] = useState("");
  const [user, setUser] = useState();

  useEffect(() => {
    getDoc(doc(db, "users", auth.currentUser.uid)).then((docSnap) => {
      if (docSnap.exists) {
        setUser(docSnap.data());
      }
    });
    if (img) {
      const uploadImg = async () => {
        const imgRef = ref(
          storage,
          `profileImage/${new Date().getTime()} - ${img.name}`
        );

        try {
          if (user.profileImgPath) {
            await deleteObject(ref(storage, user.profileImgPath));
          }
          const snap = await uploadBytes(imgRef, img);
          const url = await getDownloadURL(ref(storage, snap.ref.fullPath));

          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            profileImg: url,
            profileImgPath: snap.ref.fullPath,
          });

          setImg("");
        } catch (error) {
          console.log(error.message);
        }
      };

      uploadImg();
    }
    // eslint-disable-next-line
  }, [img]);

  return user ? (
    <section>
      <div className="profile-container">
        <div className="image-container">
          <img src={user.profileImg || Img} alt="avatar" />
          <div className="overlay">
            <div>
              <label htmlFor="photo">
                <Camera />
              </label>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="photo"
                onChange={(e) => setImg(e.target.files[0])}
              />
            </div>
          </div>
        </div>
        <div className="text-container">
          <h3>{user.name}</h3>
          <h3>{user.email}</h3>
          <hr />
          <small>Joined on {user.createdAt.toDate().toDateString()}</small>
        </div>
      </div>
    </section>
  ) : null;
};

export default Profile;
