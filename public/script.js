// ---------- helper: redirect with fade animation ----------
function redirectWithAnimation(url) {
  document.body.classList.add("fade-out");
  setTimeout(() => {
    window.location.href = url;
  }, 300);
}

// ---------- LOGIN PAGE ----------
function initLoginPage() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return; 

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const errorBox = document.getElementById("loginError");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        errorBox.textContent = "";
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("lastActivity", Date.now().toString());
        redirectWithAnimation("dashboard.html");
      } else {
        errorBox.textContent = data.error || "Invalid credentials.";
      }
    } catch (err) {
      errorBox.textContent = "Error connecting to server.";
    }
  });
}

// ---------- DASHBOARD PAGE ----------
function initDashboardPage() {
  const main = document.querySelector(".main");
  if (!main) return; 

  // --- dark mode toggle ---
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      themeToggle.textContent = "☀️";
    }
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      themeToggle.textContent = isDark ? "☀️" : "🌙";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  // --- session expiry (15 minutes) ---
  const SESSION_LIMIT = 15 * 60 * 1000;
  function startSessionTimer() {
    localStorage.setItem("lastActivity", Date.now().toString());
  }
  function checkSession() {
    const last = parseInt(localStorage.getItem("lastActivity") || "0", 10);
    if (!last) return;
    if (Date.now() - last > SESSION_LIMIT) {
      alert("Your session has expired. Please login again.");
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("role");
      redirectWithAnimation("index.html");
    }
  }
  document.addEventListener("mousemove", startSessionTimer);
  document.addEventListener("keydown", startSessionTimer);
  setInterval(checkSession, 5000);

  // --- logout popup ---
  const logoutBtn = document.getElementById("logoutBtn");
  const logoutModal = document.getElementById("logoutModal");
  const logoutConfirm = document.getElementById("logoutConfirm");
  const logoutCancel = document.getElementById("logoutCancel");

  if (logoutBtn && logoutModal) {
    logoutBtn.addEventListener("click", () => {
      logoutModal.style.display = "flex";
    });
  }
  if (logoutCancel) {
    logoutCancel.addEventListener("click", () => {
      logoutModal.style.display = "none";
    });
  }
  if (logoutConfirm) {
    logoutConfirm.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("role");
      logoutModal.style.display = "none";
      redirectWithAnimation("index.html");
    });
  }

  // --- GET STATS ---
  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      
      const messageCountEl = document.getElementById("messageCount");
      const activeContactsEl = document.getElementById("activeContacts");
      const deliveryRateEl = document.getElementById("deliveryRate");
      const pendingCampaignsEl = document.getElementById("pendingCampaigns");

      if (messageCountEl && data.messages_sent) messageCountEl.textContent = data.messages_sent.toLocaleString();
      if (activeContactsEl && data.active_contacts) activeContactsEl.textContent = data.active_contacts.toLocaleString();
      if (deliveryRateEl && data.delivery_rate) deliveryRateEl.textContent = data.delivery_rate + '%';
      if (pendingCampaignsEl && data.pending_campaigns) pendingCampaignsEl.textContent = data.pending_campaigns;
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  }
  loadStats();

  // --- charts (line + donut) mock data for now ---
  if (typeof Chart !== "undefined") {
    const perfCanvas = document.getElementById("performanceChart");
    if (perfCanvas) {
      const perfCtx = perfCanvas.getContext("2d");
      new Chart(perfCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Delivered",
              data: [65000, 70000, 83000, 92000, 105000, 118000],
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              borderWidth: 2,
              tension: 0.4,
              fill: true
            },
            {
              label: "Opened",
              data: [42000, 48000, 61000, 72000, 84000, 95000],
              borderColor: '#ec4899',
              borderWidth: 2,
              tension: 0.4,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12 } },
            tooltip: { mode: "index", intersect: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    const channelCanvas = document.getElementById("channelChart");
    if (channelCanvas) {
      const chCtx = channelCanvas.getContext("2d");
      new Chart(chCtx, {
        type: "doughnut",
        data: {
          labels: ["Email", "SMS", "WhatsApp", "Push", "Social"],
          datasets: [
            {
              data: [45, 25, 20, 7, 3],
              backgroundColor: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }

  // --- message sender + character counter + logs ---
  const messageInput = document.getElementById("messageInput");
  const charCount = document.getElementById("charCount");
  const sendBtn = document.getElementById("sendBtn");
  const logContainer = document.getElementById("logContainer");

  if (messageInput && charCount) {
    messageInput.addEventListener("input", () => {
      charCount.textContent = messageInput.value.length;
    });
  }

  async function loadHistory() {
    if (!logContainer) return;
    try {
      const res = await fetch('/api/logs');
      const logs = await res.json();
      logContainer.innerHTML = '';
      logs.forEach((item) => {
        const entry = document.createElement("div");
        entry.className = "log-entry";
        entry.textContent = `${item.text}  (${item.time})`;
        logContainer.appendChild(entry);
      });
    } catch (e) {
      console.error(e);
    }
  }
  loadHistory();
  
  // load campaigns
  const campaignTableBody = document.getElementById('campaignTableBody');
  const allCampaignsTableBody = document.getElementById('allCampaignsTableBody');
  const editModal = document.getElementById('editCampaignModal');
  const reportModal = document.getElementById('reportModal');
  const saveCampaignBtn = document.getElementById('saveCampaignBtn');
  let currentCampaigns = [];

  async function loadCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      currentCampaigns = await res.json();

      const renderRows = (container, isAll) => {
        if (!container) return;
        container.innerHTML = '';
        currentCampaigns.forEach(c => {
          const tr = document.createElement('tr');
          const badgeClass = c.status === 'completed' ? 'success' : (c.status === 'in-progress' ? 'info' : 'badge');
          const rate = c.sent > 0 ? ((c.delivered / c.sent) * 100).toFixed(1) : 0;
          
          if (isAll) {
            tr.innerHTML = `
              <td>${c.name}</td>
              <td>${c.channel}</td>
              <td>${c.sent.toLocaleString()}</td>
              <td><span class="badge ${badgeClass}">${c.status}</span></td>
              <td>
                <a href="#" class="link edit-btn" data-id="${c.id}">Edit</a> | 
                <a href="#" class="link report-btn" data-id="${c.id}">View Report</a>
              </td>
            `;
          } else {
            tr.innerHTML = `
              <td>${c.name}</td>
              <td>${c.channel}</td>
              <td>${c.sent.toLocaleString()}</td>
              <td>${c.delivered.toLocaleString()}<br /><span class="sub">${rate}% rate</span></td>
              <td><span class="badge ${badgeClass}">${c.status}</span></td>
              <td>${c.time}</td>
            `;
          }
          container.appendChild(tr);
        });
      };
      
      renderRows(campaignTableBody, false);
      renderRows(allCampaignsTableBody, true);

      // Attach event listeners
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = parseInt(e.target.dataset.id);
          const camp = currentCampaigns.find(c => c.id === id);
          if (camp && editModal) {
            document.getElementById('editCampaignId').value = camp.id;
            document.getElementById('editCampaignName').value = camp.name;
            document.getElementById('editCampaignStatus').value = camp.status;
            editModal.style.display = 'flex';
          }
        });
      });

      document.querySelectorAll('.report-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = parseInt(e.target.dataset.id);
          const camp = currentCampaigns.find(c => c.id === id);
          if (camp && reportModal) {
            const rate = camp.sent > 0 ? ((camp.delivered / camp.sent) * 100).toFixed(1) : 0;
            document.getElementById('reportCampaignTitle').textContent = 'Report: ' + camp.name;
            document.getElementById('reportSent').textContent = camp.sent.toLocaleString();
            document.getElementById('reportDelivered').textContent = camp.delivered.toLocaleString();
            document.getElementById('reportRate').textContent = rate + '%';
            
            // Render chart
            const canvas = document.getElementById('reportChart');
            if (canvas) {
              if (window.reportChartInstance) window.reportChartInstance.destroy();
              const ctx = canvas.getContext('2d');
              window.reportChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: ['Sent', 'Delivered'],
                  datasets: [{
                    data: [camp.sent, camp.delivered],
                    backgroundColor: ['#6366f1', '#10b981'],
                    borderWidth: 0
                  }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
              });
            }
            reportModal.style.display = 'flex';
          }
        });
      });

    } catch (e) {
      console.error(e);
    }
  }
  loadCampaigns();

  if (saveCampaignBtn) {
    saveCampaignBtn.addEventListener('click', async () => {
      const id = document.getElementById('editCampaignId').value;
      const name = document.getElementById('editCampaignName').value;
      const status = document.getElementById('editCampaignStatus').value;
      try {
        await fetch('/api/campaigns/' + id, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({name, status})
        });
        if (editModal) editModal.style.display = 'none';
        loadCampaigns();
      } catch (e) {
        alert("Failed to update campaign");
      }
    });
  }

  if (sendBtn && logContainer) {
    sendBtn.addEventListener("click", async () => {
      const message = (messageInput.value || "").trim();
      const channels = [
        ...document.querySelectorAll("input[type='checkbox']:checked")
      ].map((c) => c.value);

      if (!message) {
        alert("Message cannot be empty.");
        return;
      }
      if (channels.length === 0) {
        alert("Please select at least one channel.");
        return;
      }

      const campaignName = "Quick Broadcast " + new Date().toLocaleTimeString();

      try {
        // Create campaign
        await fetch('/api/campaigns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: campaignName, channel: channels, message })
        });
        
        // Log it
        for (const channel of channels) {
          await fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: `✅ Message sent successfully to ${channel}!` })
          });
        }
        
        // Update stats
        await fetch('/api/stats/increment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messagesCount: channels.length })
        });

        // reload UI
        loadHistory();
        loadCampaigns();
        fetch('/api/stats').then(r=>r.json()).then(st => {
          document.getElementById("messageCount").textContent = st.messages_sent.toLocaleString();
        });

        messageInput.value = "";
        charCount.textContent = "0";
        document.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
        showToast("Message broadcasted successfully!", "success");

      } catch (err) {
        showToast("Error sending message", "error");
        console.error("send error", err);
      }
    });
  }
}

// Navigation logic
document.addEventListener("DOMContentLoaded", () => {
  const menuLinks = document.querySelectorAll(".menu a");
  const sections = document.querySelectorAll(".section");

  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuLinks.forEach(l => l.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));

      link.classList.add("active");

      const target = link.dataset.section;
      const section = document.getElementById(`section-${target}`);
      if (section) section.classList.add("active");
    });
  });
});

// Modal Logic
document.addEventListener("DOMContentLoaded", () => {
  const newCampaignBtn = document.getElementById("newCampaignBtn");
  const scheduleBtn = document.getElementById("scheduleBtn");

  const campaignModal = document.getElementById("campaignModal");
  const scheduleModal = document.getElementById("scheduleModal");

  const openModal = modal => {
    if (modal) modal.style.display = "flex";
  };

  const closeModals = () => {
    document.querySelectorAll(".modal").forEach(m => {
      m.style.display = "none";
    });
  };

  newCampaignBtn?.addEventListener("click", () => openModal(campaignModal));
  scheduleBtn?.addEventListener("click", () => openModal(scheduleModal));

  document.querySelectorAll(".modal-close, .modal-close-icon").forEach(btn => {
    btn.addEventListener("click", closeModals);
  });
});

// ---------- INIT ----------
initLoginPage();
initDashboardPage();

// --- Capstone Upgrades ---

// 1. Toast Notifications
window.showToast = function(msg, type="info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = msg;
  container.appendChild(toast);
  setTimeout(() => {
    if (container.contains(toast)) container.removeChild(toast);
  }, 3000);
};

// Replace old alerts
window.alert = function(msg) { showToast(msg, "error"); };

// 2. Mobile Responsive Nav
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburgerMenu");
  const sidebar = document.querySelector(".sidebar");
  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // 3. Analytics
  let currentLineChart = null;
  let currentDogChart = null;

  async function loadAnalytics() {
    const lineCanvas = document.getElementById("advancedLineChart");
    const dogCanvas = document.getElementById("advancedDoughnutChart");
    if (!lineCanvas || !dogCanvas) return;
    
    const timeframeSelect = document.getElementById("analyticsTimeframe");
    const tf = timeframeSelect ? timeframeSelect.value : "30d";

    try {
      const res = await fetch(`/api/analytics?timeframe=${tf}`);
      const data = await res.json();
      
      if (currentLineChart) currentLineChart.destroy();
      currentLineChart = new Chart(lineCanvas.getContext("2d"), {
        type: "line",
        data: {
          labels: data.labels,
          datasets: [{
            label: "Engagement",
            data: data.lineData,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            fill: true,
            tension: 0.4
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });

      if (currentDogChart) currentDogChart.destroy();
      currentDogChart = new Chart(dogCanvas.getContext("2d"), {
        type: "doughnut",
        data: {
          labels: data.doughnutLabels,
          datasets: [{
            data: data.doughnutData,
            backgroundColor: ["#6366f1", "#10b981", "#8b5cf6"],
            borderWidth: 0
          }]
        },
        options: { 
          responsive: true, maintainAspectRatio: false,
          cutout: "70%",
          plugins: { legend: { position: "bottom" } }
        }
      });
    } catch(e) {
      console.error(e);
    }
  }

  const menuLinks = document.querySelectorAll(".menu a");
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (link.dataset.section === "analytics" && !window.analyticsLoaded) {
        loadAnalytics();
        window.analyticsLoaded = true;
      }
    });
  });

  const timeframeSelect = document.getElementById("analyticsTimeframe");
  if (timeframeSelect) {
    timeframeSelect.addEventListener("change", () => {
      showToast("Fetching historical data...", "info");
      setTimeout(() => {
        loadAnalytics();
        showToast("Analytics updated constraint: " + timeframeSelect.options[timeframeSelect.selectedIndex].text, "success");
      }, 600);
    });
  }

  // 4. CSV Import & Export
  const exportBtn = document.getElementById("exportCampaignsBtn");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      window.open("/api/campaigns/export", "_blank");
      showToast("Download started...", "success");
    });
  }

  const importBtn = document.getElementById("importContactsBtn");
  const fileInput = document.getElementById("csvFileInput");
  if (importBtn && fileInput) {
    importBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      showToast("Uploading CSV...", "info");
      try {
        const res = await fetch("/api/contacts/import", {
          method: "POST",
          body: file
        });
        const parse = await res.json();
        if (parse.success) {
          showToast(`Successfully imported ${parse.added} contacts!`, "success");
        } else {
          showToast("Import failed: " + parse.error, "error");
        }
      } catch (err) {
        showToast("Import failed", "error");
      }
      fileInput.value = "";
    });
  }

  // 5. AI Campaign Assistant
  const aiDraftBtn = document.getElementById("aiDraftBtn");
  const aiPromptContainer = document.getElementById("aiPromptContainer");
  const generateAiMsgBtn = document.getElementById("generateAiMsgBtn");
  const aiPromptInput = document.getElementById("aiPromptInput");
  const campaignModalMessage = document.getElementById("campaignModalMessage");

  if (aiDraftBtn && aiPromptContainer) {
    aiDraftBtn.addEventListener("click", () => {
      aiPromptContainer.style.display = aiPromptContainer.style.display === "none" ? "block" : "none";
    });
    
    generateAiMsgBtn.addEventListener("click", async () => {
      const prompt = aiPromptInput.value;
      if (!prompt) return showToast("Enter a prompt first!", "error");
      
      generateAiMsgBtn.textContent = "Generating...";
      generateAiMsgBtn.disabled = true;
      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        if (data.success) {
           campaignModalMessage.value = data.result;
           showToast("Message generated by AI!", "success");
           aiPromptContainer.style.display = "none";
           aiPromptInput.value = "";
        }
      } catch(e) {
        showToast("AI Generation Failed", "error");
      } finally {
        generateAiMsgBtn.textContent = "Generate";
        generateAiMsgBtn.disabled = false;
      }
    });
  }
});