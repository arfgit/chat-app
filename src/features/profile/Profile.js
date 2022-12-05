import React, { useEffect, useState } from "react";
import Camera from "./Camera";

const Profile = () => {
  const [img, setImg] = useState("");

  useEffect(() => {
    


  }, [img]);

  return (
    <section>
      <div className="profile-container">
        <div className="image-container">
          <img
            src="https://cdn.pixabay.com/photo/2015/07/09/19/32/dog-838281_960_720.jpg"
            alt="avatar"
          />
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
          <h3>Username</h3>
          <h3>Email</h3>
          <hr />
          <small>Joined on...</small>
        </div>
      </div>
    </section>
  );
};

export default Profile;
