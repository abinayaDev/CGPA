// Initialize Supabase
let supabaseClient;
let currentUser = null;

async function initAuth() {
    try {
        const response = await fetch(API_BASE_URL + "/api/config");
        const config = await response.json();

        supabaseClient = supabase.createClient(config.url, config.key);

        // Check session
        const { data: { session } } = await supabaseClient.auth.getSession();

        const path = window.location.pathname;
        const isLoginPage = path === "/" || path === "/index.html";

        if (session) {
            currentUser = session.user;
            // RBAC: If studentit@gmail.com, strict access to predict.html
            const isStudent = currentUser.email === "studentit@gmail.com";

            if (isLoginPage) {
                window.location.href = isStudent ? "/predict.html" : "/upload.html";
            } else if (path === "/upload.html" && isStudent) {
                // Prevent student from accessing upload page
                window.location.href = "/predict.html";
            }

            // UI Manipulation for Student
            if (isStudent) {
                // Hide Upload Link in Navbar
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    if (link.textContent.trim() === "Upload" || link.getAttribute('href') === "/upload") {
                        link.style.display = "none";
                    }
                });

                // Hide Export Button (if present)
                const btnExportAll = document.getElementById("btnExportAll");
                if (btnExportAll) {
                    btnExportAll.style.display = "none";
                }
            }
        } else {
            // If not logged in and NOT on login page, redirect to login
            if (!isLoginPage) {
                window.location.href = "/";
            }
        }

        setupAuthListeners();

    } catch (e) {
        console.error("Failed to init auth", e);
    }
}

function setupAuthListeners() {
    const btnLogin = document.getElementById("btnLogin");
    const btnSignup = document.getElementById("btnSignup");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const authMessage = document.getElementById("authMessage");
    const btnLogout = document.getElementById("btnLogout");

    // Login Action
    if (btnLogin) {
        btnLogin.addEventListener("click", async () => {
            const email = emailInput ? emailInput.value : "";
            const password = passwordInput ? passwordInput.value : "";

            if (!email || !password) {
                if (authMessage) authMessage.innerHTML = "<div class='alert alert-warning'>Please enter email and password</div>";
                return;
            }

            if (authMessage) authMessage.innerHTML = "Logging in...";

            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                if (authMessage) authMessage.innerHTML = `<div class='alert alert-danger'>Login Failed: ${error.message}</div>`;
            } else {
                // Check user role for redirect
                const user = data.user;
                if (user && user.email === "studentit@gmail.com") {
                    window.location.href = "/predict.html";
                } else {
                    window.location.href = "/upload.html";
                }
            }
        });
    }

    // Signup Action
    if (btnSignup) {
        btnSignup.addEventListener("click", async () => {
            const email = emailInput ? emailInput.value : "";
            const password = passwordInput ? passwordInput.value : "";

            if (!email || !password) {
                if (authMessage) authMessage.innerHTML = "<div class='alert alert-warning'>Please enter email and password</div>";
                return;
            }

            if (authMessage) authMessage.innerHTML = "Signing up...";

            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password
            });

            if (error) {
                if (authMessage) authMessage.innerHTML = `<div class='alert alert-danger'>Signup Failed: ${error.message}</div>`;
            } else {
                if (authMessage) authMessage.innerHTML = `<div class='alert alert-success'>Account created! Please check your email to confirm, then Login.</div>`;
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            await supabaseClient.auth.signOut();
            window.location.href = "index.html";
        });
    }
}

initAuth();
