import React, { useState, ChangeEvent, KeyboardEvent } from "react";
import { NavLink } from "react-router-dom";
import Styles from "../src/styles/home.module.scss";

function Home(): JSX.Element {
  const [text, setText] = useState<string>("");
  const [isReady, setIsReady] = useState<boolean>(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      if (text.length === 6 && text.toLowerCase() === "ready!") {
        setIsReady(true);
      }
    }
  };

  return (
    <>
      <NavLink to="/pokedex">
        <img
          hidden={!isReady}
          src="https://www.freeiconspng.com/uploads/file-pokeball-png-0.png"
          className={Styles["pokemon-logo"]}
          alt="logo"
          style={{ padding: "10px", cursor: "pointer" }}
        />
      </NavLink>

      <p className={Styles["title-text"]}>
        Are you ready to be a pokemon master?
      </p>
      <input
        className={Styles["input-field-data"]}
        type="text"
        value={text}
        name="name"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {!isReady && (
        <span data-testid="not-ready" className={Styles["error-text"]}>
          <b>I am not ready yet!</b>
        </span>
      )}
    </>
  );
}

export default Home;

// {/* <b>
//         Requirement: Try to show the hidden image and make it clickable that
//         goes to /pokedex when the input below is "Ready!" remember to hide the
//         red text away when "Ready!" is in the textbox.
//       </b> */}
