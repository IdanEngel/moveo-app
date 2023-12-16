import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./CodeBlockPage.css";
import axios from "axios";
import { Editor } from "@monaco-editor/react";
import SaveIcon from "@mui/icons-material/Save";
import { BarLoader } from "react-spinners";

const CodeBlockPage = () => {
  const { title } = useParams();
  const [code, setCode] = useState("");
  const [socket, setSocket] = useState();
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = io("https://moveo-app.onrender.com/:8080");
    setSocket(s);
    // Check if userType is stored in sessionStorage
    const userType = sessionStorage.getItem("userType");
    s.emit("requestUserType");
    // If userType is not stored, it means the user is connecting for the first time
    if (!userType) {
      //Asked the server what is the user type
      s.on("userType", (userType) => {
        // Set the role based on the server response
        setRole(userType);
        // Store user type in sessionStorage
        sessionStorage.setItem("userType", userType);
      });
    } else {
      // Set the user type based on sessionStorage
      setRole(userType);
    }
    axios
      .get(`https://moveo-app.onrender.com/:5000/code-block/${title}`)
      .then((res) => {
        setCode(res.data.code);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching code block:", error);
      });

    return () => {
      s.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //use effect that invoked when the socket updates and update the teachers (or any other members)
  useEffect(() => {
    if (socket == null) return;
    socket.on("code", (code) => {
      setCode(code);
    });
  }, [socket]);
  //use effect for to emit to join the socket to relevant page
  useEffect(() => {
    if (socket == null) return;
    socket.emit("get-page", title);
  }, [socket, title]);

  const handleCodeChange = async (newCode) => {
    // Emit socket event for code change
    socket.emit("codeChange", newCode);
    setCode(newCode);
  };

  //Saving code to db and check if the solution is correct
  const saveToDb = async () => {
    await axios
      .post("https://moveo-app.onrender.com/:5000/saveToDb", {
        content: code,
        title: title,
      })
      .then((res) => {
        setSaved(true);
        setTimeout(() => {
          setSaved(false);
        }, 3000);
        if (res.data) {
          alert("Great! \nYou Solved It! :)");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      <h1 className="opener">Hello There, {role} &#x263A;</h1>
      <h2 className="opener">Code Block &#8594; {title}</h2>
      {!loading ? (
        <Editor
          options={{ readOnly: role === "Mentor", fontSize: "18px" }}
          height="35vh"
          width="100%"
          theme="vs-dark"
          value={code}
          defaultLanguage="javascript"
          onChange={handleCodeChange}
          className="codeEditor"
        />
      ) : (
        <BarLoader className="loader" />
      )}
      <SaveIcon
        sx={{ cursor: "pointer", fontSize: "55px" }}
        titleAccess="Save To DB"
        color="primary"
        onClick={saveToDb}
        className="saveIcon"
      >
        Save
      </SaveIcon>{" "}
      <br />
      {saved ? <div className="savedDiv">Saved to Data Base</div> : null}
    </div>
  );
};

export default CodeBlockPage;
