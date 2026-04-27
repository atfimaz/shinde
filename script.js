document.addEventListener("DOMContentLoaded", () => {
  // Patient data from page 1
  const params = new URLSearchParams(window.location.search);
  document.getElementById("pname").textContent = params.get("patient_name");
  document.getElementById("pid").textContent = params.get("patient_id");
  document.getElementById("room").textContent = params.get("room");

  const tableBody = document.getElementById("tableBody");
  const liveRow = document.getElementById("liveRow");

  /* ===== MQTT SETUP ===== */
  const broker =
    "wss://9a6560927d574292b026839c6471dc26.s1.eu.hivemq.cloud:8884/mqtt";

  const client = mqtt.connect(broker, {
    username: "CHIRAG",
    password: "CHIRAGs#1234",
    reconnectPeriod: 1000,
  });

  /* ===== CHARTS ===== */
  const labels = [];

  function chartCfg(label, color) {
    return {
      type: "line",
      data: {
        labels,
        datasets: [{ label, data: [], borderColor: color, tension: 0.4 }],
      },
      options: { animation: false },
    };
  }

  const hrChart = new Chart(
    document.getElementById("hrChart"),
    chartCfg("Heart Rate", "red"),
  );
  const spo2Chart = new Chart(
    document.getElementById("spo2Chart"),
    chartCfg("SpO₂", "blue"),
  );
  const tempChart = new Chart(
    document.getElementById("tempChart"),
    chartCfg("Temperature", "green"),
  );

  /* ===== TABLE DATA ARRAY (FIFO) ===== */
  const MAX_ROWS = 20;
  let tableData = [];

  /* ===== RENDER TABLE ===== */
  function renderTable() {
    tableBody.innerHTML = "";

    // Keep live row always on top
    tableBody.appendChild(liveRow);

    tableData.forEach((data) => {
      const row = document.createElement("tr");
      row.className = "old";

      row.innerHTML = `
      <td>${data.hr}</td>
      <td>${data.spo2}%</td>
      <td>${data.temp}</td>
      <td>${data.status}</td>
    `;

      tableBody.appendChild(row);
    });
  }

  /* ===== UPDATE FUNCTION FROM MQTT ===== */
  function updateVitals(data) {
    console.log("UPDATE CALLED:", data);

    const hr = data.heartRate;
    const spo2 = data.SpO2;
    const temp = data.temperature;
    const status = data.status;

    // ===== UPDATE LIVE ROW =====
    document.getElementById("hr").textContent = hr;
    document.getElementById("spo2").textContent = spo2 + "%";
    document.getElementById("temp").textContent = temp;
    document.getElementById("status").textContent = status;

    liveRow.classList.remove("normal", "warning", "critical");
    liveRow.classList.add(status.toLowerCase());

    // ===== UPDATE TABLE (FIFO) =====
    tableData.unshift({ hr, spo2, temp, status });

    if (tableData.length > MAX_ROWS) {
      tableData.pop();
    }

    renderTable();

    // ===== UPDATE CHARTS =====
    labels.push("");
    if (labels.length > 20) labels.shift();

    hrChart.data.datasets[0].data.push(hr);
    spo2Chart.data.datasets[0].data.push(spo2);
    tempChart.data.datasets[0].data.push(temp);

    if (hrChart.data.datasets[0].data.length > 20) {
      hrChart.data.datasets[0].data.shift();
      spo2Chart.data.datasets[0].data.shift();
      tempChart.data.datasets[0].data.shift();
    }

    hrChart.update();
    spo2Chart.update();
    tempChart.update();
  }

  /* ===== MQTT CONNECTION ===== */
  client.on("connect", () => {
    console.log("Connected to HiveMQ MQTT");

    client.subscribe("hospital/patient1", (err) => {
      if (err) {
        console.error("❌ Subscribe failed:", err);
      } else {
        console.log("✅ Subscribed to topic");
      }
    });
  });

  /* ===== RECEIVE DATA ===== */
  client.on("message", (topic, message) => {
    console.log("RAW MESSAGE:", message.toString());

    try {
      const data = JSON.parse(message.toString());
      updateVitals(data);
    } catch (e) {
      console.error("Invalid JSON:", e);
    }
  });

  /* ===== ERROR HANDLING ===== */
  client.on("error", (err) => {
    console.error("MQTT Error:", err);
  });
});
