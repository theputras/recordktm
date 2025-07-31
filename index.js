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
            const maxLen = mode === "uuid" ? 8 : 11;

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
            }
            input.value = "";
        }
    });

    // Simpan ke Excel
    window.saveToExcel = function () { // Make it globally accessible
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
    };


    // Delete Selected Rows function
    window.deleteSelectedRows = function () { // Make it globally accessible
        const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
        if (checkboxes.length === 0) {
            alertBox("⚠️ Tidak ada data yang dipilih.", "warning");
            return;
        }

        alertBox(`Yakin hapus ${checkboxes.length} data terpilih?`, "confirm", (yes) => {
            if (yes) {
                // Ambil semua index yang dipilih
                const indexes = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
                // Sort descending supaya gak kacau saat splice
                indexes.sort((a, b) => b - a);
                indexes.forEach(i => dataList.splice(i, 1));

                saveData();
                renderTable();
                alertBox("✅ Data terpilih berhasil dihapus!", "success");
            } else {
                alertBox("❌ Dibatalkan", "info");
            }
        });
    };

    document.getElementById("checkAll").addEventListener("change", function () {
        const checked = this.checked;
        document.querySelectorAll(".rowCheckbox").forEach(cb => cb.checked = checked);
    });

    // Render data ke tabel
    function renderTable() {
        table.innerHTML = "";
        dataList.forEach((item, index) => {
            const row = table.insertRow();

            // Kolom 0: checkbox
            const checkboxCell = row.insertCell(0);
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "rowCheckbox";
            checkbox.dataset.index = index;
            checkboxCell.appendChild(checkbox);

            // Kolom 1: No
            row.insertCell(1).innerText = index + 1;

            // Kolom 2: UUID
            row.insertCell(2).innerText = item.uuid || "-";

            // Kolom 3: NIM
            row.insertCell(3).innerText = item.nim || "-";

            // Kolom 4: Waktu
            row.insertCell(4).innerText = item.time;

            // Kolom 5: Aksi (hapus per baris)
            const aksiCell = row.insertCell(5);
            const delBtn = document.createElement("button");
            delBtn.innerText = "❌";
            delBtn.className = "delete-btn";
            delBtn.onclick = () => {
                alertBox("Yakin mau hapus data ini?", "confirm", (yes) => { // Changed message for single row deletion
                    if (yes) {
                        dataList.splice(index, 1);
                        saveData();
                        renderTable();
                        alertBox("✅ Data berhasil dihapus!", "success"); // Added alert for single row deletion
                    } else {
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

    // Load dari localStorage (this function is not called, but renderTable() is called on load)
    function loadDataToTable() {
        renderTable();
    }

    // Hapus semua data
    window.clearAllData = function () { // Make it globally accessible
        alertBox("Yakin mau hapus semua data?", "confirm", (yes) => {
            if (yes) {
                dataList = [];
                saveData();
                renderTable();
                alertBox("✅ Semua data berhasil dihapus!", "success"); // Added alert for clear all
            } else {
                // batal
                alertBox("❌ Dibatalkan", "info");
            }
        });
    };

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