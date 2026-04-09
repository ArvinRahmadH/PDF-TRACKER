let pdfDoc = null;
let pageNum = 1;
let currentLink = "";

const canvas = document.getElementById("pdf-render");
const ctx = canvas.getContext("2d");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

// ================= STORAGE =================

function getStorage() {
  return JSON.parse(localStorage.getItem("pdfApp") || '{"history":[],"progress":{}}');
}

function saveStorage(data) {
  localStorage.setItem("pdfApp", JSON.stringify(data));
}

// ================= UTIL =================

function extractFileId(link) {
  return link.split("/d/")[1]?.split("/")[0];
}

// ================= LOAD PDF =================

function loadPDF() {
  const inputLink = document.getElementById("pdf-link").value;
  if (!inputLink) return alert("Masukkan link dulu!");

  currentLink = inputLink;

  const fileId = extractFileId(inputLink);
  const url = "/api/pdf?id=" + fileId;

  let data = getStorage();

  // tambah ke history (tanpa duplikat)
  if (!data.history.includes(inputLink)) {
    data.history.push(inputLink);
  }

  // ambil halaman terakhir
  pageNum = data.progress[inputLink] || 1;

  saveStorage(data);
  renderHistory();

  document.getElementById("loading").innerText = "Loading PDF...";

  pdfjsLib.getDocument(url).promise.then(pdf => {
    pdfDoc = pdf;

    document.getElementById("loading").innerText = "";

    renderPage(pageNum);
  }).catch(err => {
    console.error(err);
    alert("Gagal load PDF, cek link atau backend!");
  });
}

// ================= RENDER =================

function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    let viewport = page.getViewport({ scale: 1.5 });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    page.render({
      canvasContext: ctx,
      viewport: viewport
    });

    document.getElementById("page-num").textContent = num;

    // simpan halaman terakhir
    let data = getStorage();
    data.progress[currentLink] = num;
    saveStorage(data);
  });
}

// ================= NAVIGATION =================

function nextPage() {
  if (pageNum < pdfDoc.numPages) {
    pageNum++;
    renderPage(pageNum);
  }
}

function prevPage() {
  if (pageNum > 1) {
    pageNum--;
    renderPage(pageNum);
  }
}

// ================= HISTORY =================

function renderHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "";

  let data = getStorage();

  data.history.forEach(link => {
    let li = document.createElement("li");

    // teks link
    let span = document.createElement("span");
    span.textContent = link;
    span.style.cursor = "pointer";
    span.style.marginRight = "10px";

    // klik untuk load
    span.onclick = () => {
      document.getElementById("pdf-link").value = link;
      loadPDF();
    };

    // tombol hapus
    let btn = document.createElement("button");
    btn.textContent = "Hapus";

    btn.onclick = () => {
      deleteHistory(link);
    };

    li.appendChild(span);
    li.appendChild(btn);

    list.appendChild(li);
  });
}

function deleteHistory(link) {
  let data = getStorage();

  // hapus dari history
  data.history = data.history.filter(item => item !== link);

  // hapus progress juga
  delete data.progress[link];

  saveStorage(data);
  renderHistory();
}

// ================= INIT =================

renderHistory();