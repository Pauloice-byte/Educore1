// ============================================================
// EduCore — Main Script
// Phase 2 — Authentication
// ============================================================


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeEduCore();

    }
);


// ============================================================
// INITIALIZE
// ============================================================

async function initializeEduCore() {

    const page =
        document.body.dataset.page;


    console.log(
        "EduCore page:",
        page
    );


    // --------------------------------------------------------
    // LOGIN PAGE
    // --------------------------------------------------------

    if (page === "login") {

        setupLoginForm();

        return;
    }


    // --------------------------------------------------------
    // REGISTER PAGE
    // --------------------------------------------------------

    if (page === "register") {

        setupRegistrationForm();

        return;
    }


    // --------------------------------------------------------
    // FORGOT PASSWORD PAGE
    // --------------------------------------------------------

    if (page === "forgot-password") {

        setupForgotPasswordForm();

        return;
    }


    // --------------------------------------------------------
    // RESET PASSWORD PAGE
    // --------------------------------------------------------

    if (page === "reset-password") {

        setupResetPasswordForm();

        return;
    }


    // --------------------------------------------------------
    // ADMIN PAGE
    // --------------------------------------------------------

    if (page === "admin") {

        await initializeAdminPage();

        return;
    }


    // --------------------------------------------------------
    // STUDENT PAGE
    // --------------------------------------------------------

    if (page === "student") {

        await initializeStudentPage();

        return;
    }

}


// ============================================================
// LOGIN FORM
// ============================================================

function setupLoginForm() {

    const form =
        document.getElementById("login-form");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document.getElementById(
                    "login-email"
                ).value;


            const password =
                document.getElementById(
                    "login-password"
                ).value;


            setMessage(
                "login-message",
                "Signing in...",
                "info"
            );


            try {

                await loginUser(
                    email,
                    password
                );


                const profile =
                    await getCurrentProfile();


                if (!profile) {

                    throw new Error(
                        "Your profile could not be loaded."
                    );
                }


                if (!profile.active) {

                    await supabaseClient.auth.signOut();

                    throw new Error(
                        "Your account is currently inactive."
                    );
                }


                // ------------------------------------------------
                // ADMIN
                // ------------------------------------------------

                if (
                    profile.role === "admin"
                ) {

                    window.location.href =
                        "admin/index.html";

                    return;
                }


                // ------------------------------------------------
                // STUDENT
                // ------------------------------------------------

                if (
                    profile.role === "student"
                ) {

                    window.location.href =
                        "student/index.html";

                    return;
                }


                // Unknown role

                await supabaseClient.auth.signOut();

                throw new Error(
                    "Your account has an invalid role."
                );

            }

            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                setMessage(
                    "login-message",
                    getAuthErrorMessage(error),
                    "error"
                );

            }

        }
    );

}


// ============================================================
// REGISTRATION FORM
// ============================================================

function setupRegistrationForm() {

    const form =
        document.getElementById(
            "register-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const fullName =
                document.getElementById(
                    "register-name"
                ).value;


            const email =
                document.getElementById(
                    "register-email"
                ).value;


            const password =
                document.getElementById(
                    "register-password"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "register-confirm-password"
                ).value;


            if (
                password !== confirmPassword
            ) {

                setMessage(
                    "register-message",
                    "Passwords do not match.",
                    "error"
                );

                return;
            }


            setMessage(
                "register-message",
                "Creating your account...",
                "info"
            );


            try {

                const data =
                    await registerStudent(
                        fullName,
                        email,
                        password
                    );


                console.log(
                    "Registration result:",
                    data
                );


                setMessage(
                    "register-message",
                    "Registration successful. Please check your email to confirm your account.",
                    "success"
                );


                form.reset();

            }

            catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                setMessage(
                    "register-message",
                    getAuthErrorMessage(error),
                    "error"
                );

            }

        }
    );

}


// ============================================================
// FORGOT PASSWORD FORM
// ============================================================

function setupForgotPasswordForm() {

    const form =
        document.getElementById(
            "forgot-password-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document.getElementById(
                    "forgot-email"
                ).value;


            setMessage(
                "forgot-message",
                "Sending reset link...",
                "info"
            );


            try {

                await sendPasswordReset(
                    email
                );


                setMessage(
                    "forgot-message",
                    "If an account exists for that email, a password reset link has been sent.",
                    "success"
                );


                form.reset();

            }

            catch (error) {

                console.error(
                    "Password reset request error:",
                    error
                );


                setMessage(
                    "forgot-message",
                    getAuthErrorMessage(error),
                    "error"
                );

            }

        }
    );

}


// ============================================================
// RESET PASSWORD FORM
// ============================================================

function setupResetPasswordForm() {

    const form =
        document.getElementById(
            "reset-password-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const password =
                document.getElementById(
                    "reset-password"
                ).value;


            const confirmPassword =
                document.getElementById(
                    "reset-confirm-password"
                ).value;


            setMessage(
                "reset-message",
                "Updating password...",
                "info"
            );


            try {

                await resetPassword(
                    password,
                    confirmPassword
                );


                setMessage(
                    "reset-message",
                    "Your password has been changed successfully.",
                    "success"
                );


                setTimeout(
                    () => {

                        window.location.href =
                            "index.html";

                    },
                    2000
                );

            }

            catch (error) {

                console.error(
                    "Password update error:",
                    error
                );


                setMessage(
                    "reset-message",
                    getAuthErrorMessage(error),
                    "error"
                );

            }

        }
    );

}


// ============================================================
// ADMIN PAGE
// ============================================================

async function initializeAdminPage() {

    const allowed =
        await requireAdmin();


    if (!allowed) {
        return;
    }


    console.log(
        "Admin authentication verified."
    );


    const profile =
        await getCurrentProfile();


    const welcome =
        document.getElementById(
            "admin-user-name"
        );


    if (welcome && profile) {

        welcome.textContent =
            profile.full_name || profile.email;

    }


    const logoutButton =
        document.getElementById(
            "admin-logout"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                try {

                    await logoutUser();

                }

                catch (error) {

                    console.error(
                        "Admin logout error:",
                        error
                    );

                }

            }
        );

    }

}


// ============================================================
// STUDENT PAGE
// ============================================================

async function initializeStudentPage() {

    const loggedIn =
        await requireLogin();


    if (!loggedIn) {
        return;
    }


    const profile =
        await getCurrentProfile();


    if (!profile) {
        return;
    }


    // A student page should never be accessible
    // to an admin through this route.

    if (
        profile.role !== "student" ||
        profile.active !== true
    ) {

        if (
            profile.role === "admin"
        ) {

            window.location.href =
                "admin/index.html";

        }
        else {

            await supabaseClient.auth.signOut();

            window.location.href =
                "index.html";

        }

        return;
    }


    const nameElement =
        document.getElementById(
            "student-user-name"
        );


    if (nameElement) {

        nameElement.textContent =
            profile.full_name ||
            profile.email;

    }


    const logoutButton =
        document.getElementById(
            "student-logout"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                try {

                    await logoutUser();

                }

                catch (error) {

                    console.error(
                        "Student logout error:",
                        error
                    );

                }

            }
        );

    }

}


// ============================================================
// MESSAGE DISPLAY
// ============================================================

function setMessage(
    elementId,
    message,
    type = "info"
) {

    const element =
        document.getElementById(elementId);


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `message ${type}`;
}


// ============================================================
// SUPABASE ERROR HANDLING
// ============================================================

function getAuthErrorMessage(error) {

    if (!error) {

        return "An unknown error occurred.";

    }


    const message =
        error.message || "";


    const lower =
        message.toLowerCase();


    if (
        lower.includes(
            "invalid login credentials"
        )
    ) {

        return "Incorrect email or password.";

    }


    if (
        lower.includes(
            "email not confirmed"
        )
    ) {

        return "Please confirm your email address before signing in.";

    }


    if (
        lower.includes(
            "user already registered"
        )
    ) {

        return "An account with this email already exists.";

    }


    if (
        lower.includes(
            "password should be at least"
        )
    ) {

        return "Your password is too short.";

    }


    if (
        lower.includes(
            "rate limit"
        )
    ) {

        return "Too many attempts. Please wait a moment and try again.";

    }


    return message ||
        "Something went wrong. Please try again.";

}