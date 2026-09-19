/* =========================================================
   EDUCORE COURSE PLATFORM
   STUDENT COURSE RUNNER
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       GLOBAL STATE
    ===================================================== */

    const state = {

        user: null,

        course: null,

        modules: [],

        lessons: [],

        progress: {},

        currentLesson: null,

        currentView: "dashboard",

        courseId: null

    };



    /* =====================================================
       SUPABASE
    ===================================================== */

    const client =
        window.client ||
        window.supabaseClient ||
        window.supabase;



    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const $ = (selector) =>
        document.querySelector(selector);


    const $$ = (selector) =>
        document.querySelectorAll(selector);



    /* =====================================================
       ELEMENTS
    ===================================================== */

    const loadingState =
        $("#loading-state");

    const errorState =
        $("#error-state");

    const errorMessage =
        $("#error-message");

    const dashboardView =
        $("#dashboard-view");

    const courseView =
        $("#course-view");

    const progressView =
        $("#progress-view");



    /* =====================================================
       INITIALIZATION
    ===================================================== */

    async function init() {

        try {

            getCourseId();

            setupNavigation();

            setupUserMenu();

            setupMobileNavigation();

            setupRetry();

            setupContinueButtons();

            await loadUser();

            await loadCourse();

            await loadCourseStructure();

            await loadProgress();

            renderApplication();

            showView("dashboard");

        } catch (error) {

            console.error(
                "Course platform initialization error:",
                error
            );

            showError(
                error.message ||
                "Something went wrong while loading the course."
            );

        }

    }



    /* =====================================================
       COURSE ID
    ===================================================== */

    function getCourseId() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        state.courseId =
            params.get("course");


        /*
         * Development fallback.
         *
         * Remove this once every entry point
         * passes a real course ID.
         */

        if (!state.courseId) {

            throw new Error(
                "No course was selected."
            );

        }

    }



    /* =====================================================
       AUTHENTICATION
    ===================================================== */

    async function loadUser() {

        if (!client) {

            throw new Error(
                "Supabase client was not found."
            );

        }


        const {
            data,
            error
        } =
            await client.auth.getUser();


        if (error) {

            throw error;

        }


        if (!data || !data.user) {

            window.location.href =
                "../signin.html";

            return;

        }


        state.user =
            data.user;


        updateUserInterface();

    }



    /* =====================================================
       USER INTERFACE
    ===================================================== */

    function updateUserInterface() {

        if (!state.user) {
            return;
        }


        const metadata =
            state.user.user_metadata || {};


        const fullName =
            metadata.full_name ||
            metadata.name ||
            state.user.email ||
            "Student";


        const firstLetter =
            fullName
                .trim()
                .charAt(0)
                .toUpperCase();


        $("#user-name").textContent =
            fullName;


        $("#user-avatar").textContent =
            firstLetter;

    }



    /* =====================================================
       LOAD COURSE
    ===================================================== */

    async function loadCourse() {

        const {
            data,
            error
        } =
            await client
                .from("courses")
                .select("*")
                .eq("id", state.courseId)
                .single();


        if (error) {

            throw new Error(
                "Unable to load this course."
            );

        }


        if (!data) {

            throw new Error(
                "The selected course does not exist."
            );

        }


        state.course =
            data;


        updateCourseInterface();

    }



    /* =====================================================
       COURSE INTERFACE
    ===================================================== */

    function updateCourseInterface() {

        const title =
            state.course.title ||
            "Course";


        const description =
            state.course.description ||
            "Continue your learning journey.";


        $("#nav-course-title").textContent =
            title;


        $("#dashboard-course-title").textContent =
            title;


        $("#dashboard-course-description").textContent =
            description;


        document.title =
            `EduCore | ${title}`;

    }



    /* =====================================================
       LOAD COURSE STRUCTURE
    ===================================================== */

    async function loadCourseStructure() {

        /*
         * MODULES
         */

        const {
            data: modules,
            error: modulesError
        } =
            await client
                .from("modules")
                .select("*")
                .eq("course_id", state.courseId)
                .order("sort_order", {
                    ascending: true
                });


        if (modulesError) {

            throw new Error(
                "Unable to load course modules."
            );

        }


        state.modules =
            modules || [];


        /*
         * LESSONS
         */

        if (!state.modules.length) {

            state.lessons = [];

            return;

        }


        const moduleIds =
            state.modules.map(
                module => module.id
            );


        const {
            data: lessons,
            error: lessonsError
        } =
            await client
                .from("lessons")
                .select("*")
                .in(
                    "module_id",
                    moduleIds
                )
                .order("sort_order", {
                    ascending: true
                });


        if (lessonsError) {

            throw new Error(
                "Unable to load course lessons."
            );

        }


        state.lessons =
            lessons || [];

    }



    /* =====================================================
       LOAD PROGRESS
    ===================================================== */

    async function loadProgress() {

        if (!state.user) {
            return;
        }


        if (!state.lessons.length) {

            state.progress = {};

            return;

        }


        const lessonIds =
            state.lessons.map(
                lesson => lesson.id
            );


        const {
            data,
            error
        } =
            await client
                .from("lesson_progress")
                .select("*")
                .eq(
                    "user_id",
                    state.user.id
                )
                .in(
                    "lesson_id",
                    lessonIds
                );


        if (error) {

            /*
             * Progress may not exist yet.
             *
             * We don't stop the entire course
             * from loading because of that.
             */

            console.warn(
                "Progress could not be loaded:",
                error
            );

            state.progress = {};

            return;

        }


        state.progress = {};


        (data || []).forEach(
            record => {

                state.progress[
                    record.lesson_id
                ] = record;

            }
        );

    }



    /* =====================================================
       CALCULATIONS
    ===================================================== */

    function getCompletedLessons() {

        return state.lessons.filter(
            lesson => {

                const progress =
                    state.progress[
                        lesson.id
                    ];


                return (
                    progress &&
                    progress.status ===
                        "completed"
                );

            }
        );

    }



    function getCompletedCount() {

        return getCompletedLessons().length;

    }



    function getTotalLessons() {

        return state.lessons.length;

    }



    function getRemainingLessons() {

        return Math.max(
            0,
            getTotalLessons() -
            getCompletedCount()
        );

    }



    function getCoursePercentage() {

        const total =
            getTotalLessons();


        if (!total) {
            return 0;
        }


        return Math.round(
            (
                getCompletedCount() /
                total
            ) * 100
        );

    }



    function getCurrentLesson() {

        /*
         * First incomplete lesson.
         */

        const incomplete =
            state.lessons.find(
                lesson => {

                    const progress =
                        state.progress[
                            lesson.id
                        ];


                    return !(
                        progress &&
                        progress.status ===
                            "completed"
                    );

                }
            );


        return incomplete || null;

    }



    function getModuleForLesson(
        lessonId
    ) {

        const lesson =
            state.lessons.find(
                item =>
                    item.id === lessonId
            );


        if (!lesson) {
            return null;
        }


        return state.modules.find(
            module =>
                module.id ===
                lesson.module_id
        ) || null;

    }



    function getModuleProgress(
        moduleId
    ) {

        const moduleLessons =
            state.lessons.filter(
                lesson =>
                    lesson.module_id ===
                    moduleId
            );


        if (!moduleLessons.length) {
            return 0;
        }


        const completed =
            moduleLessons.filter(
                lesson => {

                    const progress =
                        state.progress[
                            lesson.id
                        ];


                    return (
                        progress &&
                        progress.status ===
                            "completed"
                    );

                }
            ).length;


        return Math.round(
            (
                completed /
                moduleLessons.length
            ) * 100
        );

    }



    function getModuleTime(
        moduleId
    ) {

        const moduleLessons =
            state.lessons.filter(
                lesson =>
                    lesson.module_id ===
                    moduleId
            );


        return moduleLessons.reduce(
            (
                total,
                lesson
            ) =>
                total +
                (
                    Number(
                        lesson.estimated_minutes
                    ) || 0
                ),
            0
        );

    }



    /* =====================================================
       RENDER APPLICATION
    ===================================================== */

    function renderApplication() {

        renderDashboard();

        renderCourse();

        renderProgress();

    }



    /* =====================================================
       DASHBOARD
    ===================================================== */

    function renderDashboard() {

        const percentage =
            getCoursePercentage();


        const completed =
            getCompletedCount();


        const total =
            getTotalLessons();


        const remaining =
            getRemainingLessons();


        const currentLesson =
            getCurrentLesson();


        /*
         * Main statistics
         */

        $("#hero-progress-value")
            .textContent =
            `${percentage}%`;


        $("#stat-completed")
            .textContent =
            completed;


        $("#stat-total")
            .textContent =
            total;


        $("#stat-remaining")
            .textContent =
            remaining;


        /*
         * Progress ring
         */

        const circumference =
            2 * Math.PI * 50;


        const offset =
            circumference -
            (
                percentage /
                100
            ) *
            circumference;


        const ring =
            $("#progress-ring");


        ring.style.strokeDasharray =
            circumference;


        ring.style.strokeDashoffset =
            offset;



        /*
         * Current lesson
         */

        if (currentLesson) {

            const module =
                getModuleForLesson(
                    currentLesson.id
                );


            $("#stat-module")
                .textContent =
                module
                    ? module.title
                    : "—";


            $("#next-lesson-title")
                .textContent =
                currentLesson.title ||
                "Next lesson";


            $("#next-lesson-description")
                .textContent =
                currentLesson.description ||
                "Continue with your next lesson.";


            $("#next-lesson-module")
                .textContent =
                module
                    ? module.title
                    : "Course";


            const lessonIndex =
                state.lessons.indexOf(
                    currentLesson
                ) + 1;


            $("#next-lesson-number")
                .textContent =
                String(
                    lessonIndex
                ).padStart(
                    2,
                    "0"
                );


            $("#continue-button-text")
                .textContent =
                completed === 0
                    ? "Start learning"
                    : "Continue learning";


            state.currentLesson =
                currentLesson;

        } else {

            $("#stat-module")
                .textContent =
                "Completed";


            $("#next-lesson-title")
                .textContent =
                "Course completed";


            $("#next-lesson-description")
                .textContent =
                "You have completed all available lessons.";


            $("#next-lesson-module")
                .textContent =
                "Congratulations";


            $("#next-lesson-number")
                .textContent =
                "✓";


            $("#continue-button-text")
                .textContent =
                "Course completed";


            state.currentLesson =
                null;

        }



        /*
         * Total estimated time
         */

        const totalMinutes =
            state.lessons.reduce(
                (
                    total,
                    lesson
                ) =>
                    total +
                    (
                        Number(
                            lesson.estimated_minutes
                        ) || 0
                    ),
                0
            );


        $("#stat-time")
            .textContent =
            formatMinutes(
                totalMinutes
            );


        /*
         * Module cards
         */

        renderDashboardModules();

    }



    /* =====================================================
       DASHBOARD MODULES
    ===================================================== */

    function renderDashboardModules() {

        const container =
            $("#dashboard-modules");


        container.innerHTML = "";


        const modules =
            state.modules.slice(
                0,
                6
            );


        if (!modules.length) {

            container.innerHTML = `
                <div class="module-card">
                    <div class="module-number">
                        COURSE
                    </div>

                    <h3>
                        Content coming soon
                    </h3>

                    <p>
                        This course has not received
                        its learning modules yet.
                    </p>
                </div>
            `;

            return;

        }


        modules.forEach(
            (
                module,
                index
            ) => {

                const moduleLessons =
                    state.lessons.filter(
                        lesson =>
                            lesson.module_id ===
                            module.id
                    );


                const percentage =
                    getModuleProgress(
                        module.id
                    );


                const completed =
                    moduleLessons.filter(
                        lesson => {

                            const progress =
                                state.progress[
                                    lesson.id
                                ];


                            return (
                                progress &&
                                progress.status ===
                                    "completed"
                            );

                        }
                    ).length;


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "module-card";


                card.innerHTML = `

                    <div class="module-number">
                        MODULE ${String(
                            index + 1
                        ).padStart(2, "0")}
                    </div>

                    <h3>
                        ${escapeHtml(
                            module.title ||
                            "Untitled module"
                        )}
                    </h3>

                    <p>
                        ${escapeHtml(
                            module.description ||
                            `${moduleLessons.length} lessons`
                        )}
                    </p>

                    <div class="module-progress">

                        <div class="module-progress-bar">

                            <div
                                class="module-progress-fill"
                                style="width: ${percentage}%"
                            ></div>

                        </div>

                        <div class="module-progress-meta">

                            <span>
                                ${completed}/${moduleLessons.length}
                                lessons
                            </span>

                            <span>
                                ${percentage}%
                            </span>

                        </div>

                    </div>

                `;


                container.appendChild(
                    card
                );

            }
        );

    }



    /* =====================================================
       COURSE VIEW
    ===================================================== */

    function renderCourse() {

        const container =
            $("#course-modules");


        container.innerHTML = "";


        if (!state.modules.length) {

            container.innerHTML = `
                <div class="module-card">

                    <div class="module-number">
                        COURSE
                    </div>

                    <h3>
                        No modules available
                    </h3>

                    <p>
                        The course content has not
                        been created yet.
                    </p>

                </div>
            `;

            return;

        }


        state.modules.forEach(
            (
                module,
                moduleIndex
            ) => {

                const moduleLessons =
                    state.lessons.filter(
                        lesson =>
                            lesson.module_id ===
                            module.id
                    );


                const percentage =
                    getModuleProgress(
                        module.id
                    );


                const moduleElement =
                    document.createElement(
                        "article"
                    );


                moduleElement.className =
                    "course-module";


                moduleElement.innerHTML = `

                    <div
                        class="course-module-header"
                        data-module-id="${module.id}"
                    >

                        <div class="module-index">

                            ${String(
                                moduleIndex + 1
                            ).padStart(2, "0")}

                        </div>


                        <div class="course-module-title">

                            <h3>
                                ${escapeHtml(
                                    module.title ||
                                    "Untitled module"
                                )}
                            </h3>

                            <p>
                                ${
                                    moduleLessons.length
                                }
                                ${
                                    moduleLessons.length === 1
                                        ? "lesson"
                                        : "lessons"
                                }

                                ·

                                ${
                                    percentage
                                }%
                                complete
                            </p>

                        </div>


                        <span class="module-chevron">
                            ▾
                        </span>

                    </div>


                    <div class="course-module-lessons">

                        ${renderLessons(
                            moduleLessons
                        )}

                    </div>

                `;


                container.appendChild(
                    moduleElement
                );

            }
        );


        setupModuleAccordions();

        setupLessonButtons();

    }



    /* =====================================================
       LESSON HTML
    ===================================================== */

    function renderLessons(
        lessons
    ) {

        if (!lessons.length) {

            return `
                <div class="lesson-row">

                    <div class="lesson-info">

                        <strong>
                            No lessons yet
                        </strong>

                        <span>
                            Content will appear here.
                        </span>

                    </div>

                </div>
            `;

        }


        return lessons.map(
            (
                lesson,
                index
            ) => {

                const progress =
                    state.progress[
                        lesson.id
                    ];


                const completed =
                    progress &&
                    progress.status ===
                        "completed";


                return `

                    <div
                        class="
                            lesson-row
                            ${completed ? "completed" : ""}
                        "
                    >

                        <div class="lesson-status">

                            ${
                                completed
                                    ? "✓"
                                    : String(
                                        index + 1
                                    )
                            }

                        </div>


                        <div class="lesson-info">

                            <strong>
                                ${escapeHtml(
                                    lesson.title ||
                                    "Untitled lesson"
                                )}
                            </strong>

                            <span>

                                ${
                                    lesson.estimated_minutes
                                        ? `${lesson.estimated_minutes} min`
                                        : "Lesson"
                                }

                                ${
                                    completed
                                        ? " · Completed"
                                        : ""
                                }

                            </span>

                        </div>


                        <button
                            class="lesson-open"
                            type="button"
                            data-lesson-id="${lesson.id}"
                        >

                            ${
                                completed
                                    ? "Review"
                                    : "Open"
                            }

                        </button>

                    </div>

                `;

            }
        ).join("");

    }



    /* =====================================================
       PROGRESS VIEW
    ===================================================== */

    function renderProgress() {

        const percentage =
            getCoursePercentage();


        const completed =
            getCompletedCount();


        const remaining =
            getRemainingLessons();


        $("#progress-page-value")
            .textContent =
            `${percentage}%`;


        $("#progress-page-completed")
            .textContent =
            completed;


        $("#progress-page-remaining")
            .textContent =
            remaining;


        $("#progress-page-bar")
            .style.width =
            `${percentage}%`;


        const container =
            $("#progress-module-list");


        container.innerHTML = "";


        state.modules.forEach(
            (
                module,
                index
            ) => {

                const moduleLessons =
                    state.lessons.filter(
                        lesson =>
                            lesson.module_id ===
                            module.id
                    );


                const modulePercentage =
                    getModuleProgress(
                        module.id
                    );


                const item =
                    document.createElement(
                        "article"
                    );


                item.className =
                    "progress-module-item";


                item.innerHTML = `

                    <div class="progress-module-top">

                        <strong>

                            Module ${
                                index + 1
                            } ·

                            ${escapeHtml(
                                module.title ||
                                "Untitled module"
                            )}

                        </strong>

                        <span>
                            ${modulePercentage}%
                        </span>

                    </div>


                    <div class="progress-module-bar">

                        <div
                            class="progress-module-fill"
                            style="width: ${modulePercentage}%"
                        ></div>

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );

    }



    /* =====================================================
       NAVIGATION
    ===================================================== */

    function setupNavigation() {

        $$(".nav-item, .mobile-nav-item")
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const view =
                                button.dataset.view;


                            if (view) {

                                showView(
                                    view
                                );

                            }

                        }
                    );

                }
            );


        $$(".text-button")
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const view =
                                button.dataset.view;


                            if (view) {

                                showView(
                                    view
                                );

                            }

                        }
                    );

                }
            );

    }



    /* =====================================================
       SHOW VIEW
    ===================================================== */

    function showView(
        view
    ) {

        state.currentView =
            view;


        dashboardView
            .classList.toggle(
                "hidden",
                view !== "dashboard"
            );


        courseView
            .classList.toggle(
                "hidden",
                view !== "course"
            );


        progressView
            .classList.toggle(
                "hidden",
                view !== "progress"
            );


        $$(".nav-item, .mobile-nav-item")
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.view ===
                            view
                    );

                }
            );


        closeMobileNavigation();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }



    /* =====================================================
       MOBILE NAVIGATION
    ===================================================== */

    function setupMobileNavigation() {

        const button =
            $("#mobile-menu-button");


        button.addEventListener(
            "click",
            () => {

                const navigation =
                    $("#mobile-navigation");


                const isOpen =
                    navigation.classList.toggle(
                        "open"
                    );


                button.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );

    }



    function closeMobileNavigation() {

        const navigation =
            $("#mobile-navigation");


        const button =
            $("#mobile-menu-button");


        navigation.classList.remove(
            "open"
        );


        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }



    /* =====================================================
       USER MENU
    ===================================================== */

    function setupUserMenu() {

        const button =
            $("#user-button");


        const menu =
            $("#user-menu");


        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                menu.classList.toggle(
                    "open"
                );

            }
        );


        document.addEventListener(
            "click",
            () => {

                menu.classList.remove(
                    "open"
                );

            }
        );


        $("#logout-button")
            .addEventListener(
                "click",
                logout
            );

    }



    /* =====================================================
       LOGOUT
    ===================================================== */

    async function logout() {

        try {

            await client.auth.signOut();

            window.location.href =
                "../signin.html";

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    }



    /* =====================================================
       MODULE ACCORDIONS
    ===================================================== */

    function setupModuleAccordions() {

        $$(".course-module-header")
            .forEach(
                header => {

                    header.addEventListener(
                        "click",
                        () => {

                            const module =
                                header.closest(
                                    ".course-module"
                                );


                            module.classList.toggle(
                                "open"
                            );

                        }
                    );

                }
            );

    }



    /* =====================================================
       LESSON BUTTONS
    ===================================================== */

    function setupLessonButtons() {

        $$(".lesson-open")
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        event => {

                            event.stopPropagation();


                            const lessonId =
                                button.dataset.lessonId;


                            openLesson(
                                lessonId
                            );

                        }
                    );

                }
            );

    }



    /* =====================================================
       OPEN LESSON
    ===================================================== */

    function openLesson(
        lessonId
    ) {

        /*
         * The actual lesson player will be built
         * in the next stage.
         *
         * For now we preserve the selected
         * lesson and route to the future player.
         */

        const url =
            `lesson.html?course=${encodeURIComponent(
                state.courseId
            )}&lesson=${encodeURIComponent(
                lessonId
            )}`;


        window.location.href =
            url;

    }



    /* =====================================================
       CONTINUE BUTTONS
    ===================================================== */

    function setupContinueButtons() {

        $("#continue-button")
            .addEventListener(
                "click",
                () => {

                    if (
                        state.currentLesson
                    ) {

                        openLesson(
                            state.currentLesson.id
                        );

                    } else {

                        showView(
                            "progress"
                        );

                    }

                }
            );


        $("#next-lesson-button")
            .addEventListener(
                "click",
                () => {

                    if (
                        state.currentLesson
                    ) {

                        openLesson(
                            state.currentLesson.id
                        );

                    }

                }
            );

    }



    /* =====================================================
       RETRY
    ===================================================== */

    function setupRetry() {

        $("#retry-button")
            .addEventListener(
                "click",
                () => {

                    location.reload();

                }
            );

    }



    /* =====================================================
       SHOW ERROR
    ===================================================== */

    function showError(
        message
    ) {

        loadingState
            .classList.add(
                "hidden"
            );


        dashboardView
            .classList.add(
                "hidden"
            );


        courseView
            .classList.add(
                "hidden"
            );


        progressView
            .classList.add(
                "hidden"
            );


        errorState
            .classList.remove(
                "hidden"
            );


        errorMessage.textContent =
            message;

    }



    /* =====================================================
       FINISH LOADING
    ===================================================== */

    function finishLoading() {

        loadingState
            .classList.add(
                "hidden"
            );

    }



    /* =====================================================
       FORMAT MINUTES
    ===================================================== */

    function formatMinutes(
        minutes
    ) {

        if (!minutes) {
            return "—";
        }


        if (minutes < 60) {

            return `${minutes} min`;

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        const remaining =
            minutes % 60;


        if (!remaining) {

            return `${hours}h`;

        }


        return `${hours}h ${remaining}m`;

    }



    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }



    /* =====================================================
       START
    ===================================================== */

    init()
        .finally(
            () => {

                finishLoading();

            }
        );

});
