// ============================================================
// EduCore — Authentication
// ============================================================


// ============================================================
// GET CURRENT USER
// ============================================================

async function getCurrentUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        console.error("Unable to get current user:", error);
        return null;
    }

    return user || null;
}


// ============================================================
// GET CURRENT PROFILE
// ============================================================

async function getCurrentProfile() {

    const user = await getCurrentUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from("profiles")
        .select(`
            id,
            full_name,
            email,
            role,
            active
        `)
        .eq("id", user.id)
        .single();

    if (error) {

        console.error(
            "Unable to load profile:",
            error
        );

        return null;
    }

    return data;
}


// ============================================================
// STUDENT REGISTRATION
// ============================================================

async function registerStudent(
    fullName,
    email,
    password
) {

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
        throw new Error("Please enter your full name.");
    }

    if (!cleanEmail) {
        throw new Error("Please enter your email.");
    }

    if (!password) {
        throw new Error("Please enter a password.");
    }

    if (password.length < 6) {
        throw new Error(
            "Password must contain at least 6 characters."
        );
    }


    const {
        data,
        error
    } = await supabaseClient.auth.signUp({

        email: cleanEmail,

        password: password,

        options: {

            data: {
                full_name: cleanName
            }

        }

    });


    if (error) {
        throw error;
    }


    return data;
}


// ============================================================
// STUDENT / ADMIN LOGIN
// ============================================================

async function loginUser(
    email,
    password
) {

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
        throw new Error("Please enter your email.");
    }

    if (!password) {
        throw new Error("Please enter your password.");
    }


    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({

        email: cleanEmail,

        password: password

    });


    if (error) {
        throw error;
    }


    return data;
}


// ============================================================
// LOGOUT
// ============================================================

async function logoutUser() {

    const {
        error
    } = await supabaseClient.auth.signOut();

    if (error) {
        throw error;
    }

    window.location.href = "index.html";
}


// ============================================================
// CHECK WHETHER CURRENT USER IS ADMIN
// ============================================================

async function isCurrentUserAdmin() {

    const profile = await getCurrentProfile();

    if (!profile) {
        return false;
    }

    return (
        profile.role === "admin" &&
        profile.active === true
    );
}


// ============================================================
// REQUIRE LOGIN
// ============================================================

async function requireLogin() {

    const user = await getCurrentUser();

    if (!user) {

        window.location.href = "index.html";

        return false;
    }

    return true;
}


// ============================================================
// REQUIRE ADMIN
// ============================================================

async function requireAdmin() {

    const user = await getCurrentUser();

    if (!user) {

        window.location.href = "index.html";

        return false;
    }


    const profile = await getCurrentProfile();


    if (
        !profile ||
        profile.role !== "admin" ||
        profile.active !== true
    ) {

        console.warn(
            "Unauthorized admin access attempt."
        );

        await supabaseClient.auth.signOut();

        window.location.href = "index.html";

        return false;
    }


    return true;
}


// ============================================================
// FORGOT PASSWORD
// ============================================================

async function sendPasswordReset(email) {

    const cleanEmail =
        email.trim().toLowerCase();


    if (!cleanEmail) {
        throw new Error(
            "Please enter your email address."
        );
    }


    const {
        error
    } = await supabaseClient.auth
        .resetPasswordForEmail(
            cleanEmail,
            {
                redirectTo:
                    `${window.location.origin}/reset-password.html`
            }
        );


    if (error) {
        throw error;
    }
}


// ============================================================
// RESET PASSWORD
// ============================================================

async function resetPassword(
    newPassword,
    confirmPassword
) {

    if (!newPassword) {

        throw new Error(
            "Please enter your new password."
        );
    }


    if (newPassword.length < 6) {

        throw new Error(
            "Password must contain at least 6 characters."
        );
    }


    if (newPassword !== confirmPassword) {

        throw new Error(
            "Passwords do not match."
        );
    }


    const {
        error
    } = await supabaseClient.auth
        .updateUser({
            password: newPassword
        });


    if (error) {
        throw error;
    }
}


// ============================================================
// AUTH STATE LISTENER
// ============================================================

supabaseClient.auth.onAuthStateChange(
    async (event, session) => {

        console.log(
            "EduCore authentication event:",
            event
        );


        // User logged out
        if (event === "SIGNED_OUT") {

            return;
        }


        // Password recovery session
        if (event === "PASSWORD_RECOVERY") {

            if (
                !window.location.pathname
                    .endsWith("reset-password.html")
            ) {

                window.location.href =
                    "reset-password.html";
            }

            return;
        }


        // User successfully logged in
        if (event === "SIGNED_IN") {

            return;
        }

    }
);