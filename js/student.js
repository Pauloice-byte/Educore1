document.addEventListener("DOMContentLoaded", async () => {


/* =====================================================
   ELEMENTS
===================================================== */

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const sidebarBackdrop =
    document.getElementById("sidebarBackdrop");

const logoutButton =
    document.getElementById("logoutButton");

const studentName =
    document.getElementById("studentName");

const year =
    document.getElementById("year");

const sidebarYear =
    document.getElementById("sidebarYear");

const searchInput =
    document.getElementById("courseSearchInput");

const coursesGrid =
    document.getElementById("coursesGrid");

const coursesLoading =
    document.getElementById("coursesLoading");

const coursesEmpty =
    document.getElementById("coursesEmpty");

const searchResults =
    document.getElementById("searchResults");

const searchEmpty =
    document.getElementById("searchEmpty");

const myCoursesGrid =
    document.getElementById("myCoursesGrid");

const myCoursesEmpty =
    document.getElementById("myCoursesEmpty");

const headerSectionTitle =
    document.getElementById("headerSectionTitle");


/* =====================================================
   YEAR
===================================================== */

const currentYear =
    new Date().getFullYear();

if (year) {
    year.textContent = currentYear;
}

if (sidebarYear) {
    sidebarYear.textContent = currentYear;
}


/* =====================================================
   AUTHENTICATION
===================================================== */

const user =
    await getCurrentUser();

if (!user) {

    window.location.replace(
        "index.html"
    );

    return;
}


const profile =
    await getCurrentProfile();

if (!profile) {

    await supabaseClient.auth.signOut();

    window.location.replace(
        "index.html"
    );

    return;
}


if (
    profile.active !== true
) {

    await supabaseClient.auth.signOut();

    window.location.replace(
        "index.html"
    );

    return;
}


if (
    profile.role === "admin"
) {

    window.location.replace(
        "admin.html"
    );

    return;
}


if (
    profile.role !== "student"
) {

    await supabaseClient.auth.signOut();

    window.location.replace(
        "index.html"
    );

    return;
}


/* =====================================================
   STUDENT NAME
===================================================== */

if (
    studentName &&
    profile.full_name
) {

    const firstName =
        profile.full_name
            .trim()
            .split(/\s+/)[0];

    studentName.textContent =
        firstName || "Student";

}


/* =====================================================
   SIDEBAR
===================================================== */

function openMobileSidebar() {

    if (!sidebar) return;

    sidebar.classList.add(
        "mobile-open"
    );

    if (sidebarBackdrop) {

        sidebarBackdrop.classList.add(
            "active"
        );

    }

    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


function closeMobileSidebar() {

    if (!sidebar) return;

    sidebar.classList.remove(
        "mobile-open"
    );

    if (sidebarBackdrop) {

        sidebarBackdrop.classList.remove(
            "active"
        );

    }

    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


function toggleSidebar() {

    if (!sidebar) return;

    const isMobile =
        window.innerWidth <= 900;


    if (isMobile) {

        if (
            sidebar.classList.contains(
                "mobile-open"
            )
        ) {

            closeMobileSidebar();

        } else {

            openMobileSidebar();

        }

        return;

    }


    sidebar.classList.toggle(
        "collapsed"
    );


    if (menuButton) {

        menuButton.setAttribute(
            "aria-expanded",
            String(
                !sidebar.classList.contains(
                    "collapsed"
                )
            )
        );

    }

}


if (menuButton) {

    menuButton.addEventListener(
        "click",
        toggleSidebar
    );

}


if (sidebarBackdrop) {

    sidebarBackdrop.addEventListener(
        "click",
        closeMobileSidebar
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeMobileSidebar();

        }

    }
);


window.addEventListener(
    "resize",
    () => {

        if (window.innerWidth > 900) {

            closeMobileSidebar();

        }

    }
);


/* =====================================================
   VIEW MANAGEMENT
===================================================== */

const viewNames = [
    "home",
    "courses",
    "search",
    "my-courses"
];


const viewTitles = {

    home:
        "Home",

    courses:
        "Courses",

    search:
        "Search",

    "my-courses":
        "My Courses"

};


const viewLabels = {

    home:
        "STUDENT AREA",

    courses:
        "COURSE LIBRARY",

    search:
        "COURSE SEARCH",

    "my-courses":
        "YOUR LEARNING"

};


/*
 * Prevents unnecessary duplicate history entries.
 *
 * Example:
 *
 * Home → Courses → Search
 *
 * Back:
 *
 * Search → Courses
 *
 * Back:
 *
 * Courses → Home
 *
 * Back:
 *
 * leaves the student area/page naturally.
 */

let currentView =
    null;


function normalizeView(viewName) {

    if (
        !viewNames.includes(viewName)
    ) {

        return "home";

    }

    return viewName;

}


function applyActiveView(
    viewName
) {

    viewName =
        normalizeView(viewName);


    currentView =
        viewName;


    document
        .querySelectorAll(
            ".student-view"
        )
        .forEach(
            view => {

                view.classList.toggle(
                    "active",
                    view.id ===
                    `view-${viewName}`
                );

            }
        );


    document
        .querySelectorAll(
            ".student-nav-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.view ===
                    viewName
                );

            }
        );


    document
        .querySelectorAll(
            ".bottom-nav-button"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.view ===
                    viewName
                );

            }
        );


    if (headerSectionTitle) {

        headerSectionTitle.textContent =
            viewTitles[viewName];

    }


    const headerLabel =
        document.getElementById(
            "headerSectionLabel"
        );


    if (headerLabel) {

        headerLabel.textContent =
            viewLabels[viewName];

    }


    closeMobileSidebar();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    /*
     * Load data required by the selected view.
     */

    if (
        viewName === "courses"
    ) {

        loadPublishedCourses();

    }


    if (
        viewName === "search"
    ) {

        renderSearchResults(
            searchInput
                ? searchInput.value
                : ""
        );

    }


    if (
        viewName === "my-courses"
    ) {

        loadMyCourses();

    }

}


function setActiveView(
    viewName,
    addHistory = true
) {

    viewName =
        normalizeView(viewName);


    /*
     * Do nothing if the requested view
     * is already active.
     */

    if (
        viewName === currentView
    ) {

        return;

    }


    if (addHistory) {

        window.history.pushState(
            {
                studentView:
                    viewName
            },
            "",
            `#${viewName}`
        );

    }


    applyActiveView(
        viewName
    );

}


/* =====================================================
   STUDENT NAVIGATION
===================================================== */

document
    .querySelectorAll(
        ".student-nav-button[data-view]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setActiveView(
                        button.dataset.view,
                        true
                    );

                }
            );

        }
    );


document
    .querySelectorAll(
        ".bottom-nav-button[data-view]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setActiveView(
                        button.dataset.view,
                        true
                    );

                }
            );

        }
    );


document
    .querySelectorAll(
        "[data-view-target]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setActiveView(
                        button.dataset.viewTarget,
                        true
                    );

                }
            );

        }
    );


/* =====================================================
   BROWSER / PHONE BACK BUTTON
===================================================== */

window.addEventListener(
    "popstate",
    event => {

        let viewName = null;


        /*
         * Prefer the history state.
         */

        if (
            event.state &&
            event.state.studentView
        ) {

            viewName =
                event.state.studentView;

        }


        /*
         * Fall back to the URL hash.
         */

        if (!viewName) {

            viewName =
                window.location.hash
                    .replace("#", "")
                    .trim();

        }


        viewName =
            normalizeView(
                viewName
            );


        applyActiveView(
            viewName
        );

    }
);


/*
 * Hash changes can also happen independently
 * of popstate in some browsers/webview environments.
 */

window.addEventListener(
    "hashchange",
    () => {

        const viewName =
            normalizeView(
                window.location.hash
                    .replace("#", "")
                    .trim()
            );


        if (
            viewName !== currentView
        ) {

            applyActiveView(
                viewName
            );

        }

    }
);


/* =====================================================
   PLACEHOLDER LINKS
===================================================== */

document
    .querySelectorAll(
        ".placeholder-link"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                }
            );

        }
    );


/* =====================================================
   COURSE DATA
===================================================== */

let publishedCourses = [];


async function loadPublishedCourses() {

    if (!coursesGrid) return;


    coursesLoading.classList.remove(
        "hidden"
    );

    coursesGrid.innerHTML = "";

    coursesEmpty.classList.add(
        "hidden"
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("courses")
            .select("*")
            .eq(
                "status",
                "published"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    coursesLoading.classList.add(
        "hidden"
    );


    if (error) {

        console.error(
            "Unable to load courses:",
            error
        );


        coursesEmpty.classList.remove(
            "hidden"
        );


        coursesEmpty.querySelector(
            ".dashboard-empty-title"
        ).textContent =
            "Unable to load courses";


        coursesEmpty.querySelector(
            ".dashboard-empty-text"
        ).textContent =
            "There was a problem loading the course catalogue.";


        return;

    }


    publishedCourses =
        data || [];


    renderCourses(
        publishedCourses,
        coursesGrid
    );


    if (
        publishedCourses.length === 0
    ) {

        coursesEmpty.classList.remove(
            "hidden"
        );

    }

}


/* =====================================================
   COURSE CARD
===================================================== */

function renderCourses(
    courses,
    container
) {

    if (!container) return;


    container.innerHTML = "";


    courses.forEach(
        course => {

            const card =
                createCourseCard(
                    course
                );


            container.appendChild(
                card
            );

        }
    );

}


function createCourseCard(
    course
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "student-course-card";


    const cover =
        document.createElement(
            "div"
        );


    cover.className =
        "student-course-cover";


    if (course.cover_image) {

        const image =
            document.createElement(
                "img"
            );


        image.src =
            course.cover_image;


        image.alt =
            course.title ||
            "Course";


        image.loading =
            "lazy";


        cover.appendChild(
            image
        );

    } else {

        const placeholder =
            document.createElement(
                "div"
            );


        placeholder.className =
            "student-course-cover-placeholder";


        placeholder.textContent =
            course.title ||
            "EDUCORE COURSE";


        cover.appendChild(
            placeholder
        );

    }


    const information =
        document.createElement(
            "div"
        );


    information.className =
        "student-course-information";


    const language =
        document.createElement(
            "div"
        );


    language.className =
        "student-course-language";


    language.textContent =
        course.language ||
        "COURSE";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "student-course-title";


    title.textContent =
        course.title ||
        "Untitled Course";


    const level =
        document.createElement(
            "div"
        );


    level.className =
        "student-course-level";


    level.textContent =
        course.level ||
        "Level information unavailable";


    information.appendChild(
        language
    );


    information.appendChild(
        title
    );


    information.appendChild(
        level
    );


    card.appendChild(
        cover
    );


    card.appendChild(
        information
    );


    card.addEventListener(
        "click",
        () => {

            /*
             * Course page will be connected
             * in the next phase.
             */

            console.log(
                "Selected course:",
                course
            );

        }
    );


    return card;

}


/* =====================================================
   SEARCH
===================================================== */

function renderSearchResults(
    query
) {

    if (
        !searchResults ||
        !searchEmpty
    ) {

        return;

    }


    const cleanQuery =
        query
            .trim()
            .toLowerCase();


    if (!cleanQuery) {

        searchResults.innerHTML = "";


        searchEmpty.classList.remove(
            "hidden"
        );


        searchEmpty.querySelector(
            ".dashboard-empty-title"
        ).textContent =
            "Search the course catalogue";


        searchEmpty.querySelector(
            ".dashboard-empty-text"
        ).textContent =
            "Start typing to find courses available on EduCore.";


        return;

    }


    const results =
        publishedCourses.filter(
            course => {

                const searchableText = [

                    course.title,
                    course.language,
                    course.level,
                    course.description

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return searchableText.includes(
                    cleanQuery
                );

            }
        );


    searchResults.innerHTML = "";


    if (
        results.length === 0
    ) {

        searchEmpty.classList.remove(
            "hidden"
        );


        searchEmpty.querySelector(
            ".dashboard-empty-title"
        ).textContent =
            "No courses found";


        searchEmpty.querySelector(
            ".dashboard-empty-text"
        ).textContent =
            "Try another course name, language or level.";


        return;

    }


    searchEmpty.classList.add(
        "hidden"
    );


    renderCourses(
        results,
        searchResults
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        event => {

            if (
                publishedCourses.length === 0
            ) {

                loadPublishedCourses()
                    .then(
                        () => {

                            renderSearchResults(
                                event.target.value
                            );

                        }
                    );

                return;

            }


            renderSearchResults(
                event.target.value
            );

        }
    );

}


/* =====================================================
   MY COURSES
   Enrollment system comes next.
===================================================== */

async function loadMyCourses() {

    if (
        !myCoursesGrid ||
        !myCoursesEmpty
    ) {

        return;

    }


    myCoursesGrid.innerHTML = "";


    myCoursesEmpty.classList.remove(
        "hidden"
    );


    /*
     * Enrollment data will be connected
     * when the student enrollment table
     * is created.
     */

}


/* =====================================================
   LOGOUT
===================================================== */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            try {

                await logoutUser();

            } catch (error) {

                console.error(
                    "Logout failed:",
                    error
                );

            }

        }
    );

}


/* =====================================================
   INITIAL VIEW
===================================================== */

/*
 * IMPORTANT:
 *
 * When a student opens student.html directly
 * without a hash, always start at Home.
 *
 * We deliberately replace the current URL with
 * #home rather than pushing another history entry.
 *
 * This gives us a clean starting point:
 *
 * Previous page
 *      ↓
 * student.html#home
 *
 * Then navigation creates:
 *
 * student.html#home
 *      ↓
 * student.html#courses
 *      ↓
 * student.html#search
 *
 * Therefore the phone Back button first moves
 * through the Student Area instead of immediately
 * leaving the app.
 */

let initialView =
    window.location.hash
        .replace("#", "")
        .trim();


if (
    !viewNames.includes(
        initialView
    )
) {

    initialView =
        "home";


    window.history.replaceState(
        {
            studentView:
                "home"
        },
        "",
        `${window.location.pathname}#home`
    );

} else {

    /*
     * Convert an existing hash into a proper
     * student history state.
     */

    window.history.replaceState(
        {
            studentView:
                initialView
        },
        "",
        `${window.location.pathname}#${initialView}`
    );

}


/*
 * Apply the dashboard/view immediately.
 */

applyActiveView(
    initialView
);


/* =====================================================
   PRELOAD COURSE CATALOGUE
===================================================== */

await loadPublishedCourses();


});
