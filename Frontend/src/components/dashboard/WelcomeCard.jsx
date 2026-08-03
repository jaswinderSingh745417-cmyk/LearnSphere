import React from "react";
import { useUser } from "../../context/userContext";

// import {useUser} from '../../context/userContext'

const WelcomeCard = () => {
  const { user } = useUser();
  return (
    <div>
      <div>
        <p className="text-text">Welcome back  ,<span className="text-primary">{user.fullName}</span></p>
        <p>Ready to continue your learning journey today?</p>
      </div>
    </div>
  );
};

export default WelcomeCard;
