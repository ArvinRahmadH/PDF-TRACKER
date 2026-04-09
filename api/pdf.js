const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/pdf", async (req, res) => {
  try {
    const fileId = req.query.id;

    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const response = await axios.get(url, {
      responseType: "arraybuffer"
    });

    res.setHeader("Content-Type", "application/pdf");
    res.send(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Gagal mengambil PDF");
  }
});

app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});