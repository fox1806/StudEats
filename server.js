const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = 3000; // Možete promijeniti ovu vrijednost na željeni broj porta

app.use(cors());
app.use(express.json());

function readJelaFromFile() {
  let rawData = fs.readFileSync("./jela.json");
  return JSON.parse(rawData);
}

const jela = readJelaFromFile();

// Ruta za slanje podataka o jelima
app.get("/jela", (req, res) => {
  res.json(jela);
});

app.get("/trazi", (req, res) => {
  const searchTerm = req.query.term;

  console.log(req.query);
  if (!searchTerm) {
    return res.status(400).json({ error: "Missing search term" });
  }

  let results = [];

  for (jelo in jela) {
    for (kategorijaJelaIndex in jela[jelo]) {
      if (jela[jelo][kategorijaJelaIndex].naziv == searchTerm) {
        console.log(jela[jelo][kategorijaJelaIndex]);
        results.push(jela[jelo][kategorijaJelaIndex]);
      }
    }
  }
  res.json(results);
});

app.put("/jela", (req, res) => {
  let updatedJela = req.body;

  if (!Array.isArray(updatedJela)) {
    return res.status(400).send("Data format is incorrect.");
  }

  // Save to file
  fs.writeFileSync("./jela.json", JSON.stringify(updatedJela, null, 2));
  res.send("Data updated successfully.");
});

// Pokretanje servera
app.listen(PORT, () => {
  console.log(`Server je pokrenut na portu ${PORT}`);
});
