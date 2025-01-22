// script.js

document.addEventListener("DOMContentLoaded", () => {
    // Theme Management
    const themeToggle = document.getElementById('themeToggle');
    let isDarkTheme = localStorage.getItem('darkTheme') === 'true';

    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
        localStorage.setItem('darkTheme', isDarkTheme);
    }

    themeToggle.addEventListener('click', toggleTheme);
    // Set initial theme
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');

    // Authentication & Session Management
    const loginSection = document.getElementById('login');
    const mainContent = document.getElementById('mainContent');
    const logoutContainer = document.getElementById('logoutContainer');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');

    function checkSession() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            if (loginSection) loginSection.style.display = 'none';
            if (mainContent) mainContent.style.display = 'block';
            if (logoutContainer) logoutContainer.style.display = 'block';
        } else {
            if (loginSection) loginSection.style.display = 'block';
            if (mainContent) mainContent.style.display = 'none';
            if (logoutContainer) logoutContainer.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const username = this.querySelector("input[type='text']").value;
            const password = this.querySelector("input[type='password']").value;

            if (username === 'admin' && password === 'admin') {
                sessionStorage.setItem('isLoggedIn', 'true');
                checkSession();
                // Scroll to top after successful login
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert("Invalid credentials. Use admin/admin");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('isLoggedIn');
            checkSession();
            // Scroll to login section after logout
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // QR Scanner Implementation
    const scannerSection = document.querySelector("#scanner");
    const scanNowBtn = document.querySelector("#scanNowBtn");
    const closeScanner = document.querySelector("#closeScanner");
    let html5QrCode = null;

    scanNowBtn.addEventListener('click', () => {
        scannerSection.classList.remove('hidden');
        initializeScanner();
    });

    closeScanner.addEventListener('click', () => {
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                scannerSection.classList.add('hidden');
            });
        }
    });

    function initializeScanner() {
        html5QrCode = new Html5Qrcode("reader");
        startScanning('environment');
    }

    function startScanning(facingMode) {
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        };

        html5QrCode.start(
            { facingMode },
            config,
            handleScanSuccess,
            handleScanError
        );
    }

    function handleScanSuccess(decodedText) {
        const resultElement = document.getElementById('scanResult');
        resultElement.innerHTML = `<div class="scan-success">
            <h3>QR Code Detected!</h3>
            <p>${decodedText}</p>
        </div>`;
        
        html5QrCode.stop();
        // Add your logic to handle the QR code data here
    }

    function handleScanError(error) {
        console.warn("QR Scan Error:", error);
    }

    document.getElementById("switchCamera").addEventListener('click', () => {
        if (html5QrCode) {
            const newMode = html5QrCode._facing === 'environment' ? 'user' : 'environment';
            html5QrCode.stop().then(() => startScanning(newMode));
        }
    });

    // Check session on page load
    checkSession();

    function handleQRData(data) {
        try {
            const parsedData = JSON.parse(data);
            displayDataInTable(parsedData);
        } catch {
            displayDataInTable({ "Raw Data": data });
        }
    }

    function displayDataInTable(data) {
        const table = document.getElementById("aadharTable");
        table.innerHTML = '<tr><th>Field</th><th>Value</th></tr>';
        
        function addRowsRecursively(obj, prefix = '') {
            for (const [key, value] of Object.entries(obj)) {
                const row = table.insertRow(-1);
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                
                cell1.textContent = prefix + key;
                
                if (typeof value === 'object' && value !== null) {
                    cell2.textContent = '';
                    addRowsRecursively(value, `${prefix}${key}.`);
                } else {
                    cell2.textContent = value;
                }
            }
        }
        
        addRowsRecursively(data);
        table.style.display = "table";
    }
});
