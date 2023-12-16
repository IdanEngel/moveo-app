import React from "react";
import { Routes, Route } from "react-router-dom";
import LobbyPage from "./components/LobbyPage";
import CodeBlockPage from "./components/CodeBlockPage";
import Navbar from "./components/Navbar";
import "./App.css";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/code-block/:title" element={<CodeBlockPage />} />
        <Route path="/" element={<LobbyPage />} />
      </Routes>
      <footer>
        <img
          src="https://assets-global.website-files.com/61e3f353201e53964a697503/61e3f353201e53fa6f697606_Logo%20HLS.svg"
          alt="Moveo HLS Logo"
          className="logo"
        />
      </footer>
    </div>
  );
}

export default App;
