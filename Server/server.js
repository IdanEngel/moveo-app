const express = require("express");
const http = require("http");

const path = require("path");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, ".env") });
const CodeBlock = require("./models/CodeBlock");
var cors = require("cors");

const app = express();
const limiter = rateLimit({
  windowMs: 60, 
  max: 5, // limit each IP to 5 requests per windowMs
});

app.use(cors());
app.use(express.json());
app.use(limiter);

const io = require("socket.io")(8080, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8,
});
// deepcode ignore HttpToHttps: <only for testing in dev mode>
const server = http.createServer(app);

mongoose.connect(process.env.MONGO);


// Define MongoDB Schema and Models here
const seedCodeBlocks = async () => {
  const initialCodeBlocks = [
    {
      title: "Async case",
      code: "async function example() {\r\n /* code here */\r\n }",
      solution:
        "async function example() {\r\n    try {\r\n        const response = await fetch('https://api.example.com/data');\r\n        const data = await response.json();\r\n        console.log('Fetched data:', data);\r\n    } catch (error) {\r\n        console.error('Error fetching data:', error);\r\n    }\r\n}",
    },
    {
      title: "Callback functions",
      code: "function callbackExample(callback) {\r\n /* code here */ \r\n}",
      solution:
        "const callbackExample = (callback) => {\r\n    console.log('Task in progress...');\r\n    setTimeout(() => {\r\n        console.log('Task completed!');\r\n        callback();\r\n    }, 2000);\r\n};",
    },
    {
      title: "Promise basics",
      code: "const promiseExample = new Promise((resolve, reject) => {\r\n /* code here */ \r\n});",
      solution:
        "const promiseExample = new Promise((resolve, reject) => {\r\n    setTimeout(() => {\r\n        const isSuccess = Math.random() < 0.5;\r\n        if (isSuccess) {\r\n            resolve('Data fetched successfully');\r\n        } else {\r\n            reject(new Error('Failed to fetch data'));\r\n        }\r\n    }, 1000);\r\n});",
    },
    {
      title: "Closure",
      code: "const outerFunction = (x) => {\n  /* code here */\n};\n",
      solution:
        "const outerFunction = (x) => {\n  const innerFunction = (y) => {\n    return x + y;\n  };\n  return innerFunction;\n};",
    },
  ];

  try {
    await CodeBlock.insertMany(initialCodeBlocks);
    console.log("Initial code blocks seeded successfully.");
  } catch (error) {
    console.error("Error seeding initial code blocks:", error);
  }
};

// try-catch to check and seed code blocks if necessary
try {
  // Check if there are any code blocks in the database
  CodeBlock.countDocuments().then((count) => {
    if (count === 0) {
      // If no code blocks, seed them
      seedCodeBlocks();
      console.log("Code blocks seeded successfully!");
    } else {
      console.log("Code blocks already exist in the database.");
    }
  });
} catch (error) {
  console.error("Error checking/seeding code blocks:", error);
}

// route to fetch code blocks
app.get("/code-block/:title", async (req, res) => {
  const { title } = req.params;
  try {
    const codeBlocks = await CodeBlock.findOne({ title });
    res.json(codeBlocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// route to save to db and return the solution
app.post("/saveToDb", async (req, res) => {
  const { title, content } = await req.body;
  try {
    console.log("body", content);
    await CodeBlock.findOneAndUpdate({ title: title }, { code: content });
    let solution = await CodeBlock.findOne({ solution: content });
    if (solution) {
      res.send(true);
    } else {
      res.send(false);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Custom rate limiting and buffering
let buffer = [];
let isBuffering = false;

const rateLimiter = (socket, message, title) => {
  if (isBuffering) {
    // If buffering, add the message to the buffer
    buffer.push({ socket, message });
  } else {
    // If not buffering, immediately send the message
    socket.broadcast.to(title).emit("code", message);
    // Start buffering
    isBuffering = true;
    setTimeout(() => {
      // After a delay, check for the last update and send the buffered messages
      isBuffering = false;
      const lastUpdate = buffer[buffer.length - 1];
      if (lastUpdate) {
        socket.broadcast.to(title).emit("code", lastUpdate.message);
      }
      buffer = [];
    }, 300);
  }
};

io.on("connection", (socket) => {
  //   console.log("A user connected");

  const connectedUsers = io.sockets.sockets.size;
  console.log("connected", connectedUsers);

  socket.on("requestUserType", () => {
    // Designate the first user as the "Mentor," others as "students"
    const userType = connectedUsers === 1 ? "Mentor" : "Student";
    socket.emit("userType", userType);
  });

  // get the right page and code events
  socket.on("get-page", (title) => {
    socket.join(title);
    socket.on("codeChange", (newCode) => {
      rateLimiter(socket, newCode, title);
    });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
