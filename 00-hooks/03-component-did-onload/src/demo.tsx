import React from "react";

export const MyComponent = () => {
  const [username, setUsername] = React.useState("");

  return (
    <>
      <h4>{username}</h4>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
    </>
  );
};