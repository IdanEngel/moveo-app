import React from "react";
import { Link } from "react-router-dom";
import "./LobbyPage.css";

const LobbyPage = () => {
  const codeBlocks = ["Async case", "Callback functions", "Promise basics", "Closure"];

  return (
    <div>
      <h1 className="welcome">Welcome Tom And Josh!</h1>
      <div className="container">
        <h2>Choose A Code Block:</h2>
        <div className="buttonWrapper">
          {codeBlocks.map((block, index) => (
            <Link className="link" key={index} to={`/code-block/${block}`}>
              <button key={index} className="codeBlock">
                {block}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
