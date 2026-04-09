export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).send("ID tidak ditemukan");
    }

    const url = `https://drive.google.com/uc?export=download&id=${id}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(500).send("Gagal fetch dari Google Drive");
    }

    const buffer = await response.arrayBuffer();

    res.setHeader("Content-Type", "application/pdf");
    res.send(Buffer.from(buffer));

  } catch (error) {
    console.error("ERROR API:", error);
    res.status(500).send("Server error");
  }
}