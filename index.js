
window.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("uuidInput");
    const table = document.getElementById("uuidTable");
    const inputMode = document.getElementById("inputMode");
    let dataList = JSON.parse(localStorage.getItem("rfidData")) || [];
    const warning = document.getElementById("warning");
    
    // Fokus otomatis saat halaman dibuka
    window.onload = function () {
        input.focus();
        renderTable();
        // alertBox("✅ Data berhasil disimpan!", "success");
      };

// Tambah data dari input
input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {

           const mode = inputMode.value; // "uuid" atau "nim"
    const maxLen = mode === "uuid" ? 8 : 12;

    const value = input.value.trim();
    if (!value) return;

    // Cek panjang karakter
       if (value.length !== maxLen) {
        alertBox(`❌ Panjang ${mode.toUpperCase()} harus tepat ${maxLen} karakter.`, "warning");
        return;
      }
              // Cek duplikat
    const exists = dataList.find((item) => item[mode] === value);
          if (exists) {
            alertBox(`⚠️ ${inputMode.value.toUpperCase()} "${value}" sudah ada!`, "warning");

            // alert(``);
          } else {
            const time = new Date().toLocaleString();
            const newData = {
              uuid: inputMode.value === "uuid" ? value : "",
              nim: inputMode.value === "nim" ? value : "",
              time
            };
            dataList.push(newData);
      saveData();
      renderTable();
        // Tampilkan warning sukses
        alertBox("✅ Data berhasil disimpan!", "success");
//   warning.innerText = `✅ Data "${value}" sudah disimpan`;

//   // Hilangkan warning setelah 5 detik
//   setTimeout(() => {
//     warning.innerText = "";
//   }, 3000);
        }
      input.value = "";
    }
  });
  
  // Simpan ke Excel
  function saveToExcel() {
  const uuidData = [["No", "UUID", "Waktu"]];
  const nimData = [["No", "NIM", "Waktu"]];
  
  dataList.forEach((item, i) => {
    if (item.uuid) {
      uuidData.push([i + 1, item.uuid, item.time]);
    } 
    if (item.nim) {
      nimData.push([i + 1, item.nim, item.time]);
    }
  });

  const uuidWorksheet = XLSX.utils.aoa_to_sheet(uuidData);
  const nimWorksheet = XLSX.utils.aoa_to_sheet(nimData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, uuidWorksheet, "UUID");
  XLSX.utils.book_append_sheet(workbook, nimWorksheet, "NIM");

  // Ambil tanggal sekarang dalam format YYYY-MM-DD
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 10); // Format menjadi YYYY-MM-DD

  // Nama file dengan tanggal saat ini
  const filename = `Recap_Tapping_SSKM_${formattedDate}.xlsx`;

  // Simpan file Excel dengan nama yang dihasilkan
  XLSX.writeFile(workbook, filename);
}

  
  
  // Render data ke tabel
  function renderTable() {
    table.innerHTML = "";
    dataList.forEach((item, index) => {
      const row = table.insertRow();
        row.insertCell(0).innerText = index + 1;
    row.insertCell(1).innerText = item.uuid || "-";
    row.insertCell(2).innerText = item.nim || "-";
    row.insertCell(3).innerText = item.time;
  
      const aksiCell = row.insertCell(4);
      const delBtn = document.createElement("button");
      delBtn.innerText = "❌";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => {

        alertBox("Yakin mau hapus semua data?", "confirm", (yes) => {
            if (yes) {
              dataList.splice(index, 1);
        saveData();
        renderTable();
            } else {
              // batal
              alertBox("❌ Dibatalkan", "info");
            }
          });
        
      };
      aksiCell.appendChild(delBtn);
    });
  }
  
  // Simpan ke localStorage
  function saveData() {
    localStorage.setItem("rfidData", JSON.stringify(dataList));
  }
  
  // Load dari localStorage
  function loadDataToTable() {
    renderTable();
  }
  
  // Hapus semua data
  function clearAllData() {
    alertBox("Yakin mau hapus semua data?", "confirm", (yes) => {
        if (yes) {
               dataList = [];
      saveData();
      renderTable();
    saveData();
    renderTable();
        } else {
          // batal
          alertBox("❌ Dibatalkan", "info");
        }
      });
    
    // if (confirm("Yakin ingin menghapus semua data?")) {
    //   dataList = [];
    //   saveData();
    //   renderTable();
    // }
  }
  // Tambahin ini di akhir file index.js
window.saveToExcel = saveToExcel;
window.clearAllData = clearAllData;


//Custom Alert
function alertBox(message, type = "success", callback = null) {
    const alertBox = document.getElementById("customAlert");
    const alertText = document.getElementById("alertText");
    const confirmModal = document.getElementById("confirmModal");
    const confirmMessage = document.getElementById("confirmMessage");
    const yesBtn = document.getElementById("confirmYes");
    const noBtn = document.getElementById("confirmNo");
  
    const colorMap = {
      success: "bg-green-500",
      error: "bg-red-500",
      info: "bg-blue-500",
      warning: "bg-yellow-400 text-black"
    };
  
    if (type === "confirm") {
      // Show confirmation modal
      confirmMessage.innerText = message;
      confirmModal.classList.remove("hidden");
  
      const cleanup = () => {
        confirmModal.classList.add("hidden");
        yesBtn.onclick = null;
        noBtn.onclick = null;
      };
  
      yesBtn.onclick = () => {
        cleanup();
        if (callback) callback(true);
      };
      noBtn.onclick = () => {
        cleanup();
        if (callback) callback(false);
      };
    } else {
      // Show slide alert
      alertBox.className = `fixed top-4 left-1/2 transform -translate-x-1/2 -translate-y-full opacity-0 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-500 ease-in-out ${colorMap[type] || "bg-green-500"}`;
      alertText.innerText = message;
  
      alertBox.classList.remove("hidden");
      setTimeout(() => {
        alertBox.classList.remove("-translate-y-full", "opacity-0");
        alertBox.classList.add("translate-y-0", "opacity-100");
      }, 10);
  
      setTimeout(() => {
        alertBox.classList.remove("translate-y-0", "opacity-100");
        alertBox.classList.add("-translate-y-full", "opacity-0");
        setTimeout(() => {
          alertBox.classList.add("hidden");
        }, 500);
      }, 2000);
    }
  }
  
  
  
});
