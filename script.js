const map = document.querySelector('.map');
const img = document.getElementById('mapImage');
const zoomInButton = document.getElementById('zoomIn');
const zoomOutButton = document.getElementById('zoomOut');
const resetButton = document.getElementById('reset');
const searchInput = document.getElementById('searchInput'); // Input pencarian
const enterButton = document.getElementById('Enter'); // Tombol Enter
const suggestionsList = document.getElementById('suggestions'); // Daftar saran pencarian

let scale = 1; // Skala awal
let translateX = 0; // Posisi horizontal awal
let translateY = 0; // Posisi vertikal awal

const dragSensitivity = 0.75; // Sensitivitas dragging
const zoomSpeed = 0.1; // Kecepatan zoom
const maxScale = 3; // Skala maksimum
const minScale = 0.5; // Skala minimum

let selectedShape = null; // Menyimpan shape yang dipilih
let fixedInfoBox = null; // Menyimpan info box yang tetap ditampilkan setelah klik

// Fungsi untuk memperbarui transformasi SVG
function updateTransform(animated = false) {
  if (animated) {
    img.style.transition = 'transform 0.3s ease';
  } else {
    img.style.transition = '';
  }
  img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;

  // Update posisi info box
  if (fixedInfoBox) {
    updateInfoBoxPosition();
  }
}

// Fungsi untuk menghitung posisi info box berdasarkan shape
function updateInfoBoxPosition() {
  if (selectedShape && fixedInfoBox) {
    const shapeRect = selectedShape.getBoundingClientRect();
    const mapRect = map.getBoundingClientRect();

    // Hitung posisi info box agar selalu di tengah shape
    const infoBoxWidth = fixedInfoBox.offsetWidth;
    const infoBoxHeight = fixedInfoBox.offsetHeight;

    const infoBoxX = shapeRect.left + (shapeRect.width / 2) - (infoBoxWidth / 2) - mapRect.left;
    const infoBoxY = shapeRect.top + (shapeRect.height / 2) - (infoBoxHeight / 2) - mapRect.top;

    // Tetapkan posisi info box berdasarkan shape
    fixedInfoBox.style.left = `${infoBoxX}px`;
    fixedInfoBox.style.top = `${infoBoxY}px`;
  }
}

// Fungsi untuk menampilkan info box di titik klik mouse
function showInfoBox(index) {
  const infoBox = document.querySelectorAll('.info-box')[index];

  // Hilangkan info box sebelumnya
  hideAllInfoBoxes();

  // Tampilkan info box
  infoBox.style.opacity = '1';
  infoBox.style.visibility = 'visible';

  // Tetapkan info box tetap
  fixedInfoBox = infoBox;

  // Update posisi info box agar selalu di tengah shape
  updateInfoBoxPosition();
}

// Fungsi untuk menyembunyikan semua info box
function hideAllInfoBoxes() {
  document.querySelectorAll('.info-box').forEach((box) => {
    box.style.opacity = '0';
    box.style.visibility = 'hidden';
  });
  fixedInfoBox = null; // Reset info box yang ditampilkan secara tetap
}

// Fungsi untuk menampilkan dan menyembunyikan seleksi pada shape
function toggleShapeSelection(shape, index) {
  // Jika ada shape yang terpilih dan shape yang dipilih berbeda
  if (selectedShape && selectedShape !== shape) {
    selectedShape.classList.remove('selected'); // Hilangkan seleksi pada shape sebelumnya
    selectedShape.style.fill = ''; // Kembalikan warna ke default
    selectedShape.style.stroke = ''; // Kembalikan warna stroke ke default
  }

  // Pilih shape baru
  if (selectedShape === shape) {
    selectedShape.classList.remove('selected'); // Jika shape yang sama diklik, unselect
    selectedShape.style.fill = ''; // Kembalikan warna ke default
    selectedShape.style.stroke = ''; // Kembalikan warna stroke ke default
    selectedShape = null;

    // Sembunyikan info box
    hideAllInfoBoxes();
  } else {
    selectedShape = shape;
    shape.classList.add('selected'); // Menambahkan kelas 'selected' ke shape yang baru
    shape.style.fill = '#6A3D9B'; // Ganti warna shape yang terpilih

    // Tampilkan info box di tengah shape
    showInfoBox(index);
  }
}

// Event untuk memulai dragging
map.addEventListener('mousedown', (e) => {
  if (isSuggestionActive) return; // Jangan lakukan apa pun jika suggestion aktif
  map.isDragging = true;
  map.startX = e.clientX;
  map.startY = e.clientY;
  map.style.cursor = 'grabbing';
});

map.addEventListener('mousemove', (e) => {
  if (isSuggestionActive || !map.isDragging) return;

  const deltaX = (e.clientX - map.startX) * dragSensitivity;
  const deltaY = (e.clientY - map.startY) * dragSensitivity;

  translateX += deltaX;
  translateY += deltaY;

  map.startX = e.clientX;
  map.startY = e.clientY;

  updateTransform();
});

map.addEventListener('mouseup', () => {
  map.isDragging = false;
  map.style.cursor = 'grab';
});

map.addEventListener('mouseleave', () => {
  map.isDragging = false;
  map.style.cursor = 'grab';
});

// Zoom mengikuti posisi kursor
map.addEventListener('wheel', (e) => {
  if (isSuggestionActive) return; // Jangan lakukan apa pun jika suggestion aktif
  e.preventDefault();

  const rect = img.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const prevScale = scale;
  if (e.deltaY < 0) {
    scale = Math.min(scale + zoomSpeed, maxScale);
  } else {
    scale = Math.max(scale - zoomSpeed, minScale);
  }

  const scaleChange = scale / prevScale;
  const offsetX = mouseX - rect.width / 2;
  const offsetY = mouseY - rect.height / 2;

  translateX -= offsetX * (scaleChange - 1);
  translateY -= offsetY * (scaleChange - 1);

  updateTransform();
});

// Event listener untuk scroll menggunakan mouse pada suggestion list
suggestionsList.addEventListener('wheel', (e) => {
  e.preventDefault();
  suggestionsList.scrollTop += e.deltaY; // Gulir vertikal
});

// Event listener untuk drag pada suggestion list
let isDraggingSuggestions = false;
let startY;

suggestionsList.addEventListener('mousedown', (e) => {
  isDraggingSuggestions = true;
  startY = e.clientY;
  suggestionsList.style.cursor = 'grabbing';
});

suggestionsList.addEventListener('mousemove', (e) => {
  if (!isDraggingSuggestions) return;

  const deltaY = e.clientY - startY;
  suggestionsList.scrollTop -= deltaY; // Scroll daftar suggestion
  startY = e.clientY;
});

suggestionsList.addEventListener('mouseup', () => {
  isDraggingSuggestions = false;
  suggestionsList.style.cursor = 'default';
});

suggestionsList.addEventListener('mouseleave', () => {
  isDraggingSuggestions = false;
  suggestionsList.style.cursor = 'default';
});

// Fungsi untuk menampilkan daftar saran
function showSuggestions(query) {
  const infoBoxes = document.querySelectorAll('.info-box');
  const filteredSuggestions = Array.from(infoBoxes)
    .map((box, index) => box.querySelector('.info-text').textContent.toLowerCase().includes(query.toLowerCase()) ? index : -1)
    .filter(index => index !== -1);
  
  // Tampilkan saran yang sesuai
  suggestionsList.innerHTML = '';
  filteredSuggestions.forEach((index) => {
    const suggestionItem = document.createElement('div');
    suggestionItem.textContent = infoBoxes[index].querySelector('.info-text').textContent;

    // Tambahkan event onclick hanya untuk mengisi search box
    suggestionItem.onclick = () => {
      searchInput.value = suggestionItem.textContent; // Set input ke teks suggestion
      suggestionsList.style.display = 'none'; // Sembunyikan daftar suggestion
    };

    suggestionsList.appendChild(suggestionItem);
  });

  suggestionsList.style.display = filteredSuggestions.length > 0 ? 'block' : 'none';
}

// Tampilkan suggestion saat mengetik
searchInput.addEventListener('input', (e) => {
  const query = e.target.value;
  if (query.length > 0) {
    showSuggestions(query); // Tampilkan saran pencarian sesuai query
  } else {
    searchInput.dispatchEvent(new Event('focus')); // Jika kosong, tampilkan semua suggestion
  }
});

// Tampilkan semua suggestion saat input diklik
searchInput.addEventListener('focus', () => {
  showSuggestions(''); // Kosongkan query untuk menampilkan semua suggestion
});

// Event listener untuk input pencarian
searchInput.addEventListener('focus', () => {
  const infoBoxes = document.querySelectorAll('.info-box');
  
  // Ambil semua teks dari info box untuk suggestion
  const suggestions = Array.from(infoBoxes).map(box => box.querySelector('.info-text').textContent);
  
  // Tampilkan semua suggestion
  suggestionsList.innerHTML = '';
  suggestions.forEach((text, index) => {
    const suggestionItem = document.createElement('div');
    suggestionItem.textContent = text;
    suggestionItem.onclick = () => {
      searchInput.value = text; // Set nilai input
      suggestionsList.style.display = 'none'; // Sembunyikan daftar suggestion
    };
    suggestionsList.appendChild(suggestionItem);
  });

  suggestionsList.style.display = suggestions.length > 0 ? 'block' : 'none';
});

document.addEventListener('click', (e) => {
  // Sembunyikan suggestion jika klik terjadi di luar input, suggestion list, atau elemen suggestion
  if (!e.target.closest('#searchInput') && !e.target.closest('#suggestions')) {
    suggestionsList.style.display = 'none';
  }
  
  // Sembunyikan suggestion jika klik terjadi pada tombol atau sidebar
  if (e.target.closest('button') || e.target.closest('#sidebar ul li')) {
    suggestionsList.style.display = 'none';
  }
});

// Sembunyikan suggestion saat tombol Enter ditekan
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    suggestionsList.style.display = 'none';
  }
});

let isSuggestionActive = false; // Status apakah suggestion sedang aktif

function showSuggestions(query) {
  const infoBoxes = document.querySelectorAll('.info-box');
  const filteredSuggestions = Array.from(infoBoxes)
    .map((box, index) => box.querySelector('.info-text').textContent.toLowerCase().includes(query.toLowerCase()) ? index : -1)
    .filter(index => index !== -1);
  
  // Tampilkan saran yang sesuai
  suggestionsList.innerHTML = '';
  filteredSuggestions.forEach((index) => {
    const suggestionItem = document.createElement('div');
    suggestionItem.textContent = infoBoxes[index].querySelector('.info-text').textContent;

    // Tambahkan event onclick hanya untuk mengisi search box
    suggestionItem.onclick = () => {
      searchInput.value = suggestionItem.textContent; // Set input ke teks suggestion
      suggestionsList.style.display = 'none'; // Sembunyikan daftar suggestion
      isSuggestionActive = false; // Aktifkan kembali interaksi shape
    };

    suggestionsList.appendChild(suggestionItem);
  });

  suggestionsList.style.display = filteredSuggestions.length > 0 ? 'block' : 'none';

  // Nonaktifkan interaksi shape ketika suggestion aktif
  isSuggestionActive = filteredSuggestions.length > 0;
}

// Menambahkan event listener untuk setiap shape
const shapes = document.querySelectorAll('.shape');
shapes.forEach((shape, index) => {
  shape.addEventListener('click', () => {
    // Mengatur seleksi shape dan info box
    toggleShapeSelection(shape, index);
  });
});

// Menyembunyikan semua seleksi shape dan info box saat klik di luar
map.addEventListener('click', (e) => {
  if (!e.target.closest('.shape')) {  // Pastikan klik benar-benar di luar shape
    // Unselect shape yang terpilih
    if (selectedShape) {
      selectedShape.classList.remove('selected'); // Unselect shape
      selectedShape.style.fill = ''; // Kembalikan warna ke default
      selectedShape.style.stroke = ''; // Kembalikan warna stroke ke default
      selectedShape = null; // Reset shape yang dipilih
    }

    // Sembunyikan info box
    hideAllInfoBoxes();
  }
});

// Terapkan transformasi awal
updateTransform();

// Zoom menggunakan tombol
zoomInButton.addEventListener('click', () => {
  scale = Math.min(scale + zoomSpeed, maxScale);
  updateTransform();
});

zoomOutButton.addEventListener('click', () => {
  scale = Math.max(scale - zoomSpeed, minScale);
  updateTransform();
});

// Reset
resetButton.addEventListener('click', () => {
  scale = 1;
  translateX = 0;
  translateY = 0;
  updateTransform();
});

// Fungsi pencarian hanya saat tombol Enter ditekan atau tombol enter pada elemen dengan id 'Enter'
const searchHandler = (iteration = 1) => {
  const keyword = searchInput.value.toLowerCase(); // Kata kunci dalam huruf kecil
  const infoBoxes = document.querySelectorAll('.info-box'); // Ambil semua info box

  let found = false;

  for (let index = 0; index < infoBoxes.length; index++) {
    const infoText = infoBoxes[index].querySelector('.info-text').textContent.toLowerCase();

    if (infoText.includes(keyword)) {
      const shape = document.getElementById(`shape${index + 1}`);

      if (shape) {
        found = true;

        const performZoomAndCenter = (iteration) => {
          // Pilih shape dan tampilkan info box
          toggleShapeSelection(shape, index); // Pilih shape yang sesuai dan tampilkan info box

          // Zoom ke level 1.5
          scale = 1.5;

          // Hitung posisi koordinat dan sesuaikan
          const shapeRect = shape.getBoundingClientRect();
          const mapRect = map.getBoundingClientRect();

          const centerX = (shapeRect.left + shapeRect.width / 2) - (mapRect.left + mapRect.width / 2);
          const centerY = (shapeRect.top + shapeRect.height / 2) - (mapRect.top + mapRect.height / 2);

          translateX -= centerX;
          translateY -= (centerY - shapeRect.height * -0.1);

          // Terapkan transformasi setelah seluruh perhitungan selesai
          updateTransform(true);

          // Pastikan info-box langsung diperbarui
          setTimeout(updateInfoBoxPosition, 300);

          if (iteration < 0) { // Ubah batas perulangan menjadi 2
            setTimeout(() => performZoomAndCenter(iteration + 1), 500); // Perulangan berikutnya
          }
        };

        // Mulai perulangan
        performZoomAndCenter(iteration);

        break; // Hentikan pencarian setelah menemukan shape pertama yang cocok
      }
    }
  }

  if (!found && keyword !== '') {
    alert('Shape tidak ditemukan!');
  }
};
// Event untuk tombol Enter di keyboard
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    searchHandler();
  }
});

// Event untuk tombol Enter (klik tombol)
enterButton.addEventListener('click', () => {
  const performSearch = (iteration) => {
    // Jalankan pencarian
    searchHandler();

    // Lakukan perulangan jika belum mencapai 2 kali
    if (iteration < 2) {
      setTimeout(() => performSearch(iteration + 1), 500); // Perulangan berikutnya
    }
  };

  // Mulai perulangan pencarian
  performSearch(1);
});

const nextRoomButton = document.getElementById('nextRoom');
const prevRoomButton = document.getElementById('prevRoom');

// Ambil semua elemen info-box dan info-text
const infoBoxes = document.querySelectorAll('.info-box');
const infoTexts = Array.from(infoBoxes).map(box => box.querySelector('.info-text').textContent);

// Menyimpan indeks info-box yang sedang aktif
let currentKeywordIndex = 0;

// Fungsi untuk melakukan pencarian otomatis berdasarkan teks di info-text
nextRoomButton.addEventListener('click', () => {
  if (infoTexts.length > 0) {
    const performSearch = (iteration) => {
      const keyword = infoTexts[currentKeywordIndex];
      searchInput.value = keyword;
      searchHandler();

      if (iteration < 2) {
        setTimeout(() => performSearch(iteration + 1), 500); // Perulangan berikutnya
      }
    };

    performSearch(1);

    currentKeywordIndex = (currentKeywordIndex + 1) % infoTexts.length; // Update indeks
  }
});

// Fungsi untuk tombol prevRoom (mencari kata kunci sebelumnya, mulai dari akhir)
prevRoomButton.addEventListener('click', () => {
  if (infoTexts.length > 0) {
    const performSearch = (iteration) => {
      const keyword = infoTexts[currentKeywordIndex];
      searchInput.value = keyword;
      searchHandler();

      if (iteration < 2) {
        setTimeout(() => performSearch(iteration + 1), 500); // Perulangan berikutnya
      }
    };

    performSearch(1);

    currentKeywordIndex = (currentKeywordIndex - 1 + infoTexts.length) % infoTexts.length; // Update indeks
  }
});

const hamburger = document.getElementById('hamburger');
const mapContainer = document.getElementById('mapContainer');
const sidebar = document.getElementById('sidebar');

// Menambahkan event listener pada tombol hamburger untuk membuka/menutup menu
hamburger.addEventListener('click', () => {
  // Toggle class 'open' pada map dan hamburger
  mapContainer.classList.toggle('open');
  hamburger.classList.toggle('open');

  // Toggle class 'open' pada sidebar (list menu)
  sidebar.classList.toggle('open');
});

// Mendapatkan semua elemen <li> yang mengandung submenu
let itemsWithSubmenu = document.querySelectorAll('ul > li > ul');

// Menambahkan event listener untuk setiap elemen
itemsWithSubmenu.forEach(item => {
  let parentItem = item.parentElement;
  
  // Menambahkan event click untuk toggle submenu
  parentItem.addEventListener('click', function() {
    // Toggle tampilan submenu
    item.style.display = (item.style.display === 'none' || item.style.display === '') ? 'block' : 'none';
  });
});

// Ambil semua elemen <li> di dalam sidebar
const sidebarItems = document.querySelectorAll('#sidebar ul li');

// Tambahkan event listener untuk setiap item di sidebar
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    const keyword = item.textContent.trim(); // Ambil teks dari item sidebar
    searchInput.value = keyword; // Masukkan teks ke kotak pencarian

    // Periksa apakah keyword ditemukan
    const infoBoxes = document.querySelectorAll('.info-box');
    let found = false;

    for (let index = 0; index < infoBoxes.length; index++) {
      const infoText = infoBoxes[index].querySelector('.info-text').textContent.toLowerCase();
      if (infoText.includes(keyword.toLowerCase())) {
        found = true;
        break;
      }
    }

    // Jalankan pencarian hanya jika keyword ditemukan
    if (found) {
      searchHandler();
    } else {
      console.warn(`Keyword "${keyword}" tidak ditemukan.`);
    }
  });
});

// Integrasikan pencarian direction dengan search box yang sudah ada
function findDirection() {
  const from = fromInput.value.trim(); // Ambil nilai input From
  const to = toInput.value.trim();    // Ambil nilai input To

  // Periksa apakah lokasi valid
  if (!shapeCoordinates[from] || !shapeCoordinates[to]) {
    alert("Please enter valid locations!");
    return;
  }

  // Dapatkan jalur dengan algoritma Dijkstra
  const path = dijkstra(locationGraph, from, to);

  // Jika jalur ditemukan, gambar garis
  if (path.length > 0) {
    drawPath(path); // Fungsi menggambar jalur
  } else {
    alert("No path found!");
  }
}


// Event listener tombol "Find Direction"
document.getElementById("find-direction").addEventListener("click", findDirection);

// Ambil elemen input dan suggestions list
const fromInput = document.getElementById("from-location");
const toInput = document.getElementById("to-location");
const fromSuggestions = document.getElementById("from-suggestions");
const toSuggestions = document.getElementById("to-suggestions");

// Fungsi untuk menampilkan suggestions
function showSuggestionsFor(inputElement, suggestionsElement) {
  const query = inputElement.value.toLowerCase();
  const infoBoxes = document.querySelectorAll(".info-box");
  
  // Ambil daftar nama lokasi dari info-text
  const suggestions = Array.from(infoBoxes)
    .map(box => box.querySelector(".info-text").textContent)
    .filter(name => name.toLowerCase().includes(query));
  
  // Kosongkan suggestions list sebelumnya
  suggestionsElement.innerHTML = "";

  // Tambahkan suggestions baru
  suggestions.forEach(name => {
    const suggestionItem = document.createElement("div");
    suggestionItem.textContent = name;

    // Event onclick untuk memilih suggestion
    suggestionItem.onclick = () => {
      inputElement.value = name; // Isi input dengan nama yang dipilih
      suggestionsElement.style.display = "none"; // Sembunyikan suggestions
    };

    suggestionsElement.appendChild(suggestionItem);
  });

  // Tampilkan atau sembunyikan suggestions
  suggestionsElement.style.display = suggestions.length > 0 ? "block" : "none";
}

// Event untuk menampilkan suggestions pada input `from`
fromInput.addEventListener("input", () => showSuggestionsFor(fromInput, fromSuggestions));
fromInput.addEventListener("focus", () => showSuggestionsFor(fromInput, fromSuggestions));
fromInput.addEventListener("blur", () => setTimeout(() => (fromSuggestions.style.display = "none"), 200));

// Event untuk menampilkan suggestions pada input `to`
toInput.addEventListener("input", () => showSuggestionsFor(toInput, toSuggestions));
toInput.addEventListener("focus", () => showSuggestionsFor(toInput, toSuggestions));
toInput.addEventListener("blur", () => setTimeout(() => (toSuggestions.style.display = "none"), 200));

// Koordinat untuk setiap shape (ruangan)
const shapeCoordinates = {
  "Pintu Masuk": { x: 415, y: 1160 },
  "Ruang Tamu": { x: 365, y: 1050 },
  "Garasi": { x: 465, y: 1050 },
  "Kamar 1": { x: 570, y: 825 },
  "Kamar 2": { x: 260, y: 825 },
  "Kamar 3": { x: 260, y: 525 },
  "Gudang": { x: 260, y: 325 },
  "Dapur": { x: 415, y: 170 },
  "Kamar Mandi": { x: 260, y: 200 },
  "Kamar Mandi 1": { x: 260, y: 200 },
  "Kamar Mandi 2": { x: 260, y: 200 },
};

// Koordinat untuk setiap titik jalan
const streetCoordinates = {
  "Street 1": { x: 415, y: 1050 },
  "Street 2": { x: 415, y: 825 },
  "Street 3": { x: 415, y: 525 },
  "Street 4": { x: 415, y: 325 },
  "Street 5": { x: 415, y: 200 },
};

// Graf koneksi untuk titik jalan
const streetGraph = {
  "Street 1": { "Street 2": 1 },
  "Street 2": { "Street 1": 1, "Street 3": 1 },
  "Street 3": { "Street 2": 1, "Street 4": 1 },
  "Street 4": { "Street 3": 1, "Street 5": 1 },
  "Street 5": { "Street 4": 1 },
};

// Koneksi antara shape dan jalan terdekat
const shapeToStreet = {
  "Pintu Masuk": "Street 1",
  "Ruang Tamu": "Street 1",
  "Garasi": "Street 1",
  "Kamar 1": "Street 2",
  "Kamar 2": "Street 2",
  "Kamar 3": "Street 3",
  "Gudang": "Street 4",
  "Dapur": "Street 5",
  "Kamar Mandi": "Street 5",
  "Kamar Mandi 1": "Street 5",
  "Kamar Mandi 2": "Street 5",
};

function drawPoint(location) {
  const svg = document.getElementById("mapImage");

  // Log lokasi yang diterima
  console.log("Drawing point for:", location);

  // Hapus lingkaran sebelumnya jika ada
  const existingCircle = document.getElementById(`circle-${location}`);
  if (existingCircle) {
    svg.removeChild(existingCircle);
  }
  
  // Periksa apakah lokasi ada di shapeCoordinates
  const coord = shapeCoordinates[location];
  if (coord) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", coord.x);
    circle.setAttribute("cy", coord.y);
    circle.setAttribute("r", 8);
    circle.setAttribute("fill", "#6A3D9B");
    circle.setAttribute("id", `circle-${location}`); // ID unik
    svg.appendChild(circle);
    console.log(`Point drawn at (${coord.x}, ${coord.y})`);
  } else {
    console.error("Location not found in shapeCoordinates:", location);
  }
}

// Fungsi Dijkstra
function dijkstra(graph, start, end) {
  const distances = {};
  const previous = {};
  const queue = [];

  for (const node in graph) {
    distances[node] = Infinity;
    previous[node] = null;
    queue.push(node);
  }
  distances[start] = 0;

  while (queue.length > 0) {
    queue.sort((a, b) => distances[a] - distances[b]);
    const currentNode = queue.shift();

    if (currentNode === end) {
      const path = [];
      let temp = end;
      while (temp) {
        path.unshift(temp);
        temp = previous[temp];
      }
      return path;
    }

    for (const neighbor in graph[currentNode]) {
      const alt = distances[currentNode] + graph[currentNode][neighbor];
      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        previous[neighbor] = currentNode;
      }
    }
  }
  return [];
}

function drawPath(path) {
  const svg = document.getElementById("mapImage");
  const pointsArray = path.map((loc) => {
    if (shapeCoordinates[loc]) {
      return `${shapeCoordinates[loc].x},${shapeCoordinates[loc].y}`;
    } else if (streetCoordinates[loc]) {
      return `${streetCoordinates[loc].x},${streetCoordinates[loc].y}`;
    }
  });

  const existingLine = document.getElementById("direction-line");
  if (existingLine) svg.removeChild(existingLine);

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", pointsArray.join(" "));
  polyline.setAttribute("stroke", "#6A3D9B");
  polyline.setAttribute("stroke-width", "8");
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke-linejoin", "round");
  polyline.setAttribute("id", "direction-line");

  svg.appendChild(polyline);

  // Terapkan transformasi dengan transisi
  svg.style.transition = "transform 0.5s ease-in-out";
  const transformValue = "scale(0.6) translate(0, 85%)";
  svg.style.transform = transformValue;

  // Simpan transformasi terakhir
  svg.dataset.lastTransform = transformValue;
}

// Fungsi untuk mencari jalur
function findPath(startShape, endShape) {
  const startStreet = shapeToStreet[startShape];
  const endStreet = shapeToStreet[endShape];

  if (!startStreet || !endStreet) {
    alert("Lokasi tidak valid. Periksa input Anda!");
    return [];
  }

  // Hapus semua lingkaran sebelum menggambar yang baru
  clearPoints();

  // Gambar titik untuk lokasi awal dan akhir
  drawPoint(startShape);
  drawPoint(endShape);

  // Hitung jalur menggunakan Dijkstra
  const path = dijkstra(streetGraph, startStreet, endStreet);
  const fullPath = [startShape, ...path, endShape];

  // Gambar jalur pada peta
  drawPath(fullPath);
  return fullPath;
}

// Fungsi untuk menangani tombol Find Direction
// Fungsi untuk menangani tombol Find Direction
function findDirection() {
  const fromInput = document.getElementById("from-location").value.trim();
  const toInput = document.getElementById("to-location").value.trim();

  if (!shapeCoordinates[fromInput] || !shapeCoordinates[toInput]) {
    alert("Lokasi tidak valid. Pastikan input Anda benar!");
    return;
  }

  const path = findPath(fromInput, toInput);

  if (path.length === 0) {
    alert("Tidak ada jalur yang ditemukan!");
  }
}

// Tambahkan event listener pada tombol Find Direction
document.getElementById("find-direction").addEventListener("click", findDirection);

// Tambahkan event listener untuk menangkap Enter di seluruh dokumen
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    // Tangkap nilai input tanpa memerlukan fokus
    const fromInput = document.getElementById("from-location").value.trim();
    const toInput = document.getElementById("to-location").value.trim();

    // Periksa jika kedua input tidak kosong
    if (fromInput && toInput) {
      findDirection();
      event.preventDefault(); // Mencegah refresh halaman
    }
  }
});

// Tambahkan event listener pada tombol Find Direction
document.getElementById("find-direction").addEventListener("click", findDirection);

function clearPoints() {
  const svg = document.getElementById("mapImage");
  const circles = svg.querySelectorAll("circle");
  circles.forEach(circle => svg.removeChild(circle));

  // Hapus polyline dan reset zoom
  const existingLine = document.getElementById("direction-line");
  if (existingLine) svg.removeChild(existingLine);
  
  resetMapView();
}

function resetMapView() {
  const svg = document.getElementById("mapImage");
  svg.style.transform = "scale(1) translate(0, 0)";
}
