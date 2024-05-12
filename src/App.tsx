import React from "react";
import Home from "./Home";
import { Route, HashRouter } from "react-router-dom";
import PokeDex from "./PokeDex";
import Styles from "../src/styles/app.module.scss";

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className={Styles["App"]}>
        <header className={Styles["App-header"]}>
          <Route exact path="/" component={Home} />
          <Route path="/pokedex" component={PokeDex} />
        </header>
      </div>
    </HashRouter>
  );
};

export default App;
