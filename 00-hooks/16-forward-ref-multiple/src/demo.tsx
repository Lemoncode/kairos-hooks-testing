import React from "react";
import { InputComponent } from "./common/input.component";

export function MyComponent() {
  const secondInputRef = React.useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = React.useState("");
  const [secondName, setSecondName] = React.useState("");

  const handleSetFocus = () => {
    if (secondInputRef.current) {
      secondInputRef.current.focus();
    }
  };

  return (
    <div>
      <InputComponent
        label="First name"
        value={firstName}
        onChange={setFirstName}
      />
      <InputComponent
        ref={secondInputRef}
        label="Second name"
        value={secondName}
        onChange={setSecondName}
      />
      <button onClick={handleSetFocus}>Set focus to second name</button>
    </div>
  );
}
