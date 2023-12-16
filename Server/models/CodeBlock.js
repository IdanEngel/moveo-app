const mongoose = require("mongoose");
// This is the code block schema model
const CodeBlockSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  solution: {
    type: String,
    required: true
  }
});
module.exports = mongoose.model("CodeBlock", CodeBlockSchema);
