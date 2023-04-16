import React from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "core";
import { useProfileContext } from "@/core/providers";
import { LoginComponent } from "./login.component";
import { doLogin } from "./login.api";

const useLoginHook = () => {
  const navigate = useNavigate();
  const { setUserProfile } = useProfileContext();

  const loginSucceededAction = (userName) => {
    setUserProfile({ userName });
    navigate(routes.list);
  };

  const loginFailedAction = () => {
    alert("User / password not valid, psst... admin / test");
  };
  return { loginSucceededAction, loginFailedAction };
};

export const LoginContainer: React.FC = () => {
  const { loginSucceededAction, loginFailedAction } = useLoginHook();

  const handleLogin = (username: string, password: string) => {
    doLogin(username, password).then((result) => {
      if (result) {
        loginSucceededAction(username);
      } else {
        loginFailedAction();
      }
    });
  };

  return <LoginComponent onLogin={handleLogin} />;
};
