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

    // Update navigation handling
    const loginLink = document.querySelector('nav a[href="#login"]');
    
    function updateLoginButton() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const username = sessionStorage.getItem('username');
        
        if (isLoggedIn && username) {
            loginLink.style.display = 'none';
            // Add username instead of "Account"
            let userSpan = loginLink.parentNode.querySelector('span');
            if (!userSpan) {
                userSpan = document.createElement('span');
                loginLink.parentNode.appendChild(userSpan);
            }
            userSpan.textContent = `Welcome, ${username}`;
            userSpan.style.color = 'white';
        } else {
            loginLink.style.display = 'block';
            const userSpan = loginLink.parentNode.querySelector('span');
            if (userSpan) {
                userSpan.remove();
            }
        }
    }

    function updateUserInterface() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const username = sessionStorage.getItem('username');
        
        if (isLoggedIn && username) {
            document.querySelector('.nav-main').classList.remove('hidden');
            document.querySelector('.nav-login').classList.add('hidden');
            document.querySelector('.scan-section').classList.remove('hidden');
            
            const usernameDisplay = document.getElementById('username-display');
            if (usernameDisplay) {
                usernameDisplay.textContent = username;
                document.getElementById('userGreeting').classList.remove('hidden');
            }
        }
    }

    function checkSession() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            loginSection.style.display = 'none';
            mainContent.style.display = 'block';
            mainContent.style.opacity = '1';
            updateUserInterface();
            document.body.classList.add('logged-in');
            document.querySelector('.nav-login').classList.add('hidden');
            document.querySelector('.nav-main').classList.remove('hidden');
            updateLoginButton();
        } else {
            loginSection.style.display = 'block';
            mainContent.style.display = 'none';
            logoutContainer.style.display = 'none';
            document.body.classList.remove('logged-in');
            document.querySelector('.nav-login').classList.remove('hidden');
            document.querySelector('.nav-main').classList.add('hidden');
            updateLoginButton();
        }
    }

    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            console.log('Login form submitted'); // Debug log
            
            const username = this.querySelector("input[type='text']").value;
            const password = this.querySelector("input[type='password']").value;

            if (username === 'admin' && password === 'admin') {
                console.log('Login successful'); // Debug log
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('username', username); // Store username
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
            sessionStorage.removeItem('username'); // Clear username
            window.location.reload(); // Reload page to reset all states
        });
    }

    // Fix smooth scrolling navigation
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            // Don't scroll to login if already logged in
            if (targetId === '#login' && sessionStorage.getItem('isLoggedIn') === 'true') {
                return;
            }

            // Add smooth scroll with offset for header
            if (targetSection) {
                const headerOffset = 70;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Add active state to section
                targetSection.classList.add('section-active');
                setTimeout(() => {
                    targetSection.classList.remove('section-active');
                }, 1000);
            }
        });
    });

    // Add scroll to section function for reuse
    function scrollToSection(sectionId) {
        const section = document.querySelector(sectionId);
        if (section) {
            const headerOffset = 70;
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // QR Scanner Implementation
    const scannerSection = document.querySelector("#scanner");
    const scanNowBtn = document.querySelector("#scanNowBtn");
    const closeScanner = document.querySelector("#closeScanner");
    let html5QrCode = null;

    // Update scan button click handler
    if (scanNowBtn) {
        scanNowBtn.addEventListener('click', () => {
            const scanner = document.querySelector("#scanner");
            if (scanner) {
                scanner.classList.remove('hidden');
                // First scroll to scanner
                scanner.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start'
                });
                // Then initialize after scroll
                setTimeout(() => {
                    initializeScanner();
                }, 800); // Wait for scroll to complete
            }
        });
    }

    if (closeScanner) {
        closeScanner.addEventListener('click', async () => {
            if (html5QrCode) {
                try {
                    await html5QrCode.stop();
                    html5QrCode = null;
                    if (scannerSection) {
                        scannerSection.classList.add('hidden');
                    }
                } catch (err) {
                    console.error("Error stopping camera:", err);
                }
            }
        });
    }

    function initializeScanner() {
        if (html5QrCode === null) {
            html5QrCode = new Html5Qrcode("reader");
        }
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
        if (resultElement) {
            resultElement.innerHTML = `<div class="scan-success">
                <h3>QR Code Detected!</h3>
                <p>${decodedText}</p>
            </div>`;
        }
        
        if (html5QrCode) {
            html5QrCode.stop().then(() => {
                handleQRData(decodedText);
            }).catch((err) => {
                console.error("Error stopping camera:", err);
            });
        }
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

    // Update scan button click handler
    document.querySelector('.nav-scan-btn').addEventListener('click', function(e) {
        e.preventDefault();
        const scanner = document.querySelector("#scanner");
        if (scanner) {
            scanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => {
                scanner.classList.remove('hidden');
                initializeScanner();
            }, 500);
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

    // Add mouse tracking for feature items
    document.querySelectorAll('.feature-item').forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            item.style.setProperty('--x', `${x}%`);
            item.style.setProperty('--y', `${y}%`);
        });
    });

    // Add click ripple effect
    document.querySelectorAll('button, .btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
            
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            setTimeout(() => ripple.remove(), 1000);
        });
    });

    // Add reveal on scroll
    const revealElements = document.querySelectorAll('section, .feature-item');
    revealElements.forEach((element, index) => {
        element.classList.add('reveal');
        if (element.classList.contains('feature-item')) {
            element.style.setProperty('--order', index);
        }
    });

    function checkReveal() {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Initial check
});
