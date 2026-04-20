document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const authTabs = document.querySelectorAll(".auth-tab-btn");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const resetForm = document.getElementById("reset-form");
    const authView = document.getElementById("auth-view");
    const dashboardView = document.getElementById("dashboard-view");
    const togglePasswords = document.querySelectorAll(".toggle-password");
    
    // Auth Tab Switching
    authTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            authTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            if (tab.dataset.target === "login") {
                loginForm.style.display = "block";
                registerForm.style.display = "none";
                resetForm.style.display = "none";
            } else if (tab.dataset.target === "register") {
                loginForm.style.display = "none";
                registerForm.style.display = "block";
                resetForm.style.display = "none";
            }
        });
    });
    
    // Forgot password
    document.querySelector(".forgot-pwd").addEventListener("click", (e) => {
        e.preventDefault();
        loginForm.style.display = "none";
        registerForm.style.display = "none";
        resetForm.style.display = "block";
    });
    
    document.getElementById("back-to-login").addEventListener("click", (e) => {
        e.preventDefault();
        resetForm.style.display = "none";
        loginForm.style.display = "block";
        if (authTabs.length > 1) {
            authTabs[0].classList.add("active");
            authTabs[1].classList.remove("active");
        }
    });
    
    // Toggle Password Visibility
    togglePasswords.forEach(icon => {
        icon.addEventListener("click", () => {
            const target = document.getElementById(icon.dataset.target);
            if (target && target.type === "password") {
                target.type = "text";
                icon.classList.remove("ri-eye-off-line");
                icon.classList.add("ri-eye-line");
            } else if(target) {
                target.type = "password";
                icon.classList.remove("ri-eye-line");
                icon.classList.add("ri-eye-off-line");
            }
        });
    });
    
    // API Call - Register
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const sleepGoal = document.getElementById('goal').value; 
        const confirmPassword = document.getElementById('confirm-password').value;

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, sleepGoal })
            });

            if (response.status === 200) {
                alert("Account created successfully!");
                // switch to login
                document.querySelector('[data-target="login"]').click();
            } else if (response.status === 409) {
                alert("email id already exists!Try signing in"); 
            } else {
                const text = await response.text();
                alert(text || "Something went wrong");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("Error connecting to server. Is it running?");
        }
    });

    // API Call - Login
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.status === 200) {
                // Login successful, swap to dashboard
                authView.style.display = "none";
                dashboardView.style.display = "block";
                
                // Set name, id and sleep goal
                const user = await response.json();
                document.getElementById('user-greeting').innerText = `Welcome, ${user.name || "User"}`;
                
                if (user.id) {
                    currentUserId = user.id;
                }
                
                if (user.sleepGoal) {
                    currentSleepGoal = user.sleepGoal;
                }
                
                try {
                    const recResp = await fetch(`/record/user/${currentUserId}`);
                    if (recResp.ok) {
                        const recs = await recResp.json();
                        sleepRecords = recs.map(r => ({ date: r.date, sleep: parseFloat(r.actualSleep) }));
                    }
                } catch(e) {
                    console.error("Error fetching records:", e);
                }
                
                updateAnalyticsUi();
            } else {
                const text = await response.text();
                alert(text || "Login failed");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("Error connecting to server.");
        }
    });

    // API Call - Reset
    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        const password = document.getElementById('reset-password').value;

        try {
            const response = await fetch('/api/users/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.status === 200) {
                alert("Password reset successfully! An email has been dispatched.");
                document.getElementById("back-to-login").click();
                resetForm.reset();
            } else {
                const text = await response.text();
                alert(text || "Password reset failed");
            }
        } catch (error) {
            console.error("Error during setup:", error);
            alert("Error connecting to server.");
        }
    });

    // Analytics State and Helpers
    let currentUserId = null;
    let currentSleepGoal = 0;
    let sleepRecords = [];
    let sleepChartInstance = null;

    function calculateSleepGoal(bedTime, wakeTime) {
        if (!bedTime || !wakeTime) return 0;
        const [bedH, bedM] = bedTime.split(':').map(Number);
        const [wakeH, wakeM] = wakeTime.split(':').map(Number);
        let diffH = wakeH - bedH;
        let diffM = wakeM - bedM;
        if (diffM < 0) {
            diffM += 60;
            diffH -= 1;
        }
        if (diffH < 0) {
            diffH += 24;
        }
        return diffH + (diffM / 60);
    }

    function updateAnalyticsUi() {
        const period = document.getElementById('analytics-period') ? document.getElementById('analytics-period').value : 'daily';
        const ctx = document.getElementById('sleepChart');
        
        const statGoal = document.getElementById("stat-goal");
        const statLogs = document.getElementById("stat-logs");
        const statAvg = document.getElementById("stat-avg");

        if(statGoal) statGoal.innerText = currentSleepGoal ? `${currentSleepGoal.toFixed(1)} hrs` : "-- hrs";

        const today = new Date();
        const offset = today.getTimezoneOffset();
        const localTodayStr = new Date(today.getTime() - (offset*60*1000)).toISOString().split('T')[0];
        
        let filteredRecords = [];
        if (period === 'daily') {
            filteredRecords = sleepRecords.filter(r => r.date === localTodayStr);
        } else {
            let days = 7;
            if (period === 'monthly') days = 30;
            if (period === 'yearly') days = 365;
            
            const cutoff = new Date(today);
            cutoff.setDate(cutoff.getDate() - days);
            filteredRecords = sleepRecords.filter(r => new Date(r.date) >= cutoff);
        }

        let avgSleep = 0;
        if (filteredRecords.length > 0) {
            const total = filteredRecords.reduce((sum, r) => sum + r.sleep, 0);
            avgSleep = total / filteredRecords.length;
        }
        
        if (statLogs) statLogs.innerText = filteredRecords.length;
        
        if (statAvg) {
            if (filteredRecords.length > 0) {
                statAvg.innerText = `${avgSleep.toFixed(1)} hrs`;
            } else {
                statAvg.innerText = "-- hrs";
            }
        }

        if (ctx) {
            if (sleepChartInstance) {
                sleepChartInstance.destroy();
            }

            if (period === 'daily') {
                let todaysSleep = filteredRecords.length > 0 ? filteredRecords[filteredRecords.length - 1].sleep : 0;
                sleepChartInstance = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: ['Sleep Goal (hrs)', "Today's Sleep (hrs)"],
                        datasets: [{
                            data: [currentSleepGoal, todaysSleep],
                            backgroundColor: ['rgba(236, 72, 153, 0.7)', 'rgba(52, 211, 153, 0.7)'],
                            borderColor: ['#ec4899', '#34d399'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        plugins: {
                            legend: { labels: { color: '#fff' } }
                        }
                    }
                });
            } else if (period === 'weekly') {
                let wLabels = [];
                let wGoal = [];
                let wSleep = [];
                for (let i = 6; i >= 0; i--) {
                    let d = new Date(today);
                    d.setDate(d.getDate() - i);
                    let dStr = new Date(d.getTime() - (offset*60000)).toISOString().split('T')[0];
                    let dateNum = d.getDate();
                    let suffix = 'th';
                    if(dateNum % 10 === 1 && dateNum !== 11) suffix = 'st';
                    else if(dateNum % 10 === 2 && dateNum !== 12) suffix = 'nd';
                    else if(dateNum % 10 === 3 && dateNum !== 13) suffix = 'rd';
                    wLabels.push(dateNum + suffix);
                    wGoal.push(currentSleepGoal);
                    let dr = sleepRecords.filter(r => r.date === dStr);
                    wSleep.push(dr.length > 0 ? dr[dr.length - 1].sleep : 0);
                }
                sleepChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: wLabels,
                        datasets: [
                            {
                                label: 'Sleep Goal (hrs)',
                                data: wGoal,
                                backgroundColor: 'rgba(236, 72, 153, 0.7)',
                                borderColor: '#ec4899',
                                borderWidth: 1
                            },
                            {
                                label: 'Avg. Sleep (hrs)',
                                data: wSleep,
                                backgroundColor: 'rgba(52, 211, 153, 0.7)',
                                borderColor: '#34d399',
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        scales: {
                            y: { beginAtZero: true, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                            x: { ticks: { color: '#fff', display: true }, grid: { display: false } }
                        },
                        plugins: { legend: { labels: { color: '#fff' } } }
                    }
                });
            } else if (period === 'monthly') {
                let mLabels = ["Week 1", "Week 2", "Week 3", "Week 4"];
                let mGoal = [currentSleepGoal, currentSleepGoal, currentSleepGoal, currentSleepGoal];
                let mSleep = [0, 0, 0, 0];
                for (let w = 0; w < 4; w++) {
                    let startDaysAgo = (3 - w) * 7 + 6;
                    let endDaysAgo = (3 - w) * 7;
                    let wRecords = [];
                    for (let i = startDaysAgo; i >= endDaysAgo; i--) {
                        let d = new Date(today);
                        d.setDate(d.getDate() - i);
                        let dStr = new Date(d.getTime() - (offset*60000)).toISOString().split('T')[0];
                        let dr = sleepRecords.filter(r => r.date === dStr);
                        if(dr.length > 0) wRecords.push(dr[dr.length - 1].sleep);
                    }
                    mSleep[w] = wRecords.length > 0 ? wRecords.reduce((a,b)=>a+b,0)/wRecords.length : 0;
                }
                sleepChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: mLabels,
                        datasets: [
                            {
                                label: 'Sleep Goal (hrs)',
                                data: mGoal,
                                borderColor: '#ec4899',
                                backgroundColor: 'transparent',
                                borderDash: [5, 5],
                                pointBackgroundColor: '#ec4899',
                                borderWidth: 2,
                                tension: 0.1
                            },
                            {
                                label: 'Avg. Sleep (hrs)',
                                data: mSleep,
                                borderColor: '#34d399',
                                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                                pointBackgroundColor: '#34d399',
                                pointHoverRadius: 8,
                                pointRadius: 6,
                                fill: true,
                                tension: 0.3
                            }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        scales: {
                            y: { beginAtZero: true, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                            x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                        },
                        plugins: { legend: { labels: { color: '#fff' } } }
                    }
                });
            } else if (period === 'yearly') {
                let yLabels = [];
                let yGoal = [];
                let ySleep = [];
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                for (let i = 11; i >= 0; i--) {
                    let d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    yLabels.push(monthNames[d.getMonth()]);
                    yGoal.push(currentSleepGoal);
                    let tMonth = d.getMonth() + 1;
                    let tYear = d.getFullYear();
                    let mDays = {};
                    sleepRecords.forEach(r => {
                        let p = r.date.split('-');
                        if(p.length === 3 && parseInt(p[0]) === tYear && parseInt(p[1]) === tMonth) {
                            mDays[r.date] = r.sleep;
                        }
                    });
                    let vals = Object.values(mDays);
                    ySleep.push(vals.length > 0 ? vals.reduce((a,b)=>a+b,0)/vals.length : 0);
                }
                sleepChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: yLabels,
                        datasets: [
                            {
                                label: 'Sleep Goal (hrs)',
                                data: yGoal,
                                borderColor: '#ec4899',
                                backgroundColor: 'transparent',
                                borderDash: [5, 5],
                                pointBackgroundColor: '#ec4899',
                                borderWidth: 2,
                                tension: 0.1
                            },
                            {
                                label: 'Avg. Sleep (hrs)',
                                data: ySleep,
                                borderColor: '#34d399',
                                backgroundColor: 'rgba(52, 211, 153, 0.2)',
                                pointBackgroundColor: '#34d399',
                                pointHoverRadius: 8,
                                pointRadius: 6,
                                fill: true,
                                tension: 0.3
                            }
                        ]
                    },
                    options: {
                        responsive: true, maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        scales: {
                            y: { beginAtZero: true, ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                            x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                        },
                        plugins: { legend: { labels: { color: '#fff' } } }
                    }
                });
            }
        }
    }

    // Dashboard Forms (prevent default page reload & calculate analytics)
    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Calculate Sleep Time (Not overwriting registered goal)
            const bedTime = document.getElementById("sleepTime").value;
            const wakeTime = document.getElementById("wakeTime").value;
            // Sleep Goal is now fixed to the value from registration.

            const resultMsg = document.getElementById('schedule-result');
            if (resultMsg) {
                resultMsg.innerText = "Schedule saved successfully!";
                resultMsg.style.color = "#34d399"; // Success color
                setTimeout(() => resultMsg.innerText = '', 3000);
            }
        });
    }

    const recordForm = document.getElementById('record-form');
    if (recordForm) {
        recordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Log Record and Update Average Sleep
            const actualSleep = parseFloat(document.getElementById("rec-actualSleep").value);
            const recDate = document.getElementById("rec-date").value;
            
            if (!isNaN(actualSleep) && recDate) {
                
                if (currentUserId) {
                    fetch('/record/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUserId, date: recDate, actualSleep: actualSleep })
                    }).catch(e => console.error("Failed to sync record", e));
                }
                
                sleepRecords.push({ date: recDate, sleep: actualSleep });
                updateAnalyticsUi();
            }

            const resultMsg = document.getElementById('record-result');
            if (resultMsg) {
                resultMsg.innerText = "Sleep record logged successfully!";
                resultMsg.style.color = "#34d399"; // Success color
                setTimeout(() => resultMsg.innerText = '', 3000);
            }
        });
    }

    // Dashboard Tabs
    const dashNavBtns = document.querySelectorAll(".dashboard-nav .nav-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");
    
    dashNavBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            dashNavBtns.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(p => p.classList.remove("active"));
            
            btn.classList.add("active");
            const target = document.getElementById(btn.dataset.target);
            if (target) target.classList.add("active");
        });
    });

    // Analytics Period Change
    const periodSelect = document.getElementById('analytics-period');
    if (periodSelect) {
        periodSelect.addEventListener('change', () => {
            updateAnalyticsUi();
        });
    }

    // Refresh Analytics Button
    const refreshBtn = document.getElementById('refresh-analytics-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            updateAnalyticsUi();
        });
    }

    // Logout
    document.getElementById("logout-btn").addEventListener("click", () => {
        dashboardView.style.display = "none";
        authView.style.display = "block";
        loginForm.reset();
    });
});