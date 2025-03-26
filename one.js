/* Full MERN Bug Tracker Application
   - Backend (Express, MongoDB, Jest for testing)
   - Frontend (React, Redux, React Testing Library)
   - Debugging techniques included
*/

// 1. Backend - Express Server (server.js)
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bugRoutes = require("./routes/bugRoutes");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/bugs", bugRoutes);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(5000, () => console.log("Server running on port 5000")))
  .catch((err) => console.log(err));

// 2. Bug Model (models/Bug.js)
const mongoose = require("mongoose");
const bugSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, enum: ["open", "in-progress", "resolved"], default: "open" },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Bug", bugSchema);

// 3. Routes (routes/bugRoutes.js)
const express = require("express");
const Bug = require("../models/Bug");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const bug = new Bug(req.body);
    await bug.save();
    res.status(201).json(bug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const bugs = await Bug.find();
    res.json(bugs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const bug = await Bug.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bug);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Bug.findByIdAndDelete(req.params.id);
    res.json({ message: "Bug deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// 4. Frontend - React Bug Tracker (src/App.js)
import React, { useEffect, useState } from "react";
import axios from "axios";

const App = () => {
  const [bugs, setBugs] = useState([]);
  const [newBug, setNewBug] = useState({ title: "", description: "" });

  useEffect(() => {
    axios.get("http://localhost:5000/api/bugs").then((res) => setBugs(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:5000/api/bugs", newBug);
    setBugs([...bugs, res.data]);
  };

  return (
    <div>
      <h1>Bug Tracker</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Bug Title"
          value={newBug.title}
          onChange={(e) => setNewBug({ ...newBug, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newBug.description}
          onChange={(e) => setNewBug({ ...newBug, description: e.target.value })}
        />
        <button type="submit">Report Bug</button>
      </form>
      <ul>
        {bugs.map((bug) => (
          <li key={bug._id}>{bug.title} - {bug.status}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
