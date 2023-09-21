const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");

const app = express();
app.use(bodyParser.json());

let entities = {};

// GET all entities
app.get("/elements", (req, res) => {
  console.log("GET /elements");
  const startPage = parseInt(req.query.startPage) || 1;
  const endPage = parseInt(req.query.endPage) || Number.MAX_SAFE_INTEGER;

  if (typeof startPage !== "number" || typeof endPage !== "number") {
    res.status(400).json({ message: "Invalid page range" });
    return;
  }
  if (startPage < 1 || endPage < 1 || startPage > endPage) {
    res.status(400).json({ message: "Invalid page range" });
    return;
  }
  const filteredEntities = Object.values(entities).filter(
    (entity) => entity.pageIndex >= startPage && entity.pageIndex <= endPage
  );

  res.header("Access-Control-Allow-Origin", "*");
  res.json(filteredEntities);
});

// GET a specific entity by ID
app.get("/elements/:id", (req, res) => {
  console.log("GET /elements/:id");
  const entityId = req.params.id;
  const entity = entities[entityId];

  if (!entity) {
    res.status(404).json({ message: "Entity not found" });
  } else {
    res.json(entity);
  }
});

// POST a new entity
app.post("/elements", (req, res) => {
  console.log("POST /elements");
  const newEntity = req.body;
  const entityId = uuid.v4(); // Generate a unique ID
  newEntity.id = entityId;
  entities[entityId] = newEntity;
  res.status(201).json(newEntity);
});

// PUT (update) an existing entity by ID
app.put("/elements/:id", (req, res) => {
  console.log("PUT /elements/:id");
  const entityId = req.params.id;
  const updatedEntity = req.body;

  // Ensure id is not modified
  if (updatedEntity.id && updatedEntity.id !== entityId) {
    res.status(400).json({ message: "Cannot modify entity ID" });
    return;
  }

  if (!entities[entityId]) {
    res.status(404).json({ message: "Entity not found" });
  } else {
    // Exclude modifying the id field
    updatedEntity.id = entityId;
    entities[entityId] = updatedEntity;
    res.json(updatedEntity);
  }
});

// DELETE an entity by ID
app.delete("/elements/:id", (req, res) => {
  console.log("DELETE /elements/:id");
  const entityId = req.params.id;
  if (entities[entityId]) {
    delete entities[entityId];
    res.json({ message: "Entity deleted successfully" });
  } else {
    res.status(404).json({ message: "Entity not found" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
