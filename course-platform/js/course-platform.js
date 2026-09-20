/* =====================================================
   EDUCORE COURSE PLATFORM
   DATABASE ARCHITECTURE

   courses
      ↓
   modules
      ↓
   lessons
      ↓
   lesson_sections
      ↓
   activities
      ↓
   questions

   Supporting:
   media
   enrollments
   lesson_progress
   activity_progress
   activity_attempts
===================================================== */

"use strict";


/* =====================================================
   SUPABASE
===================================================== */

const SUPABASE_URL =
    "https://kioqhgkpfqdhjqidrlwf.supabase.co";

const SUPABASE_ANON_KEY =
    "Ysb_publishable_ZDAJmFtSl9WNGVlZPyvngA_ZWiv_Q4g";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* =====================================================
   APPLICATION STATE
===================================================== */

const state = {

    user: null,

    course: null,

    modules: [],

    lessons: [],

    sections: [],

    activities: [],

    questions: [],

    media: [],

    currentLesson: null,

    currentLessonIndex: 0,

    progress: {},

    activityProgress: {},

    savedLessons: new Set(),

    activeScreen: "overview",

    courseId: null

};


/* =====================================================
   HELPERS
===================================================== */

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    [...document.querySelectorAll(selector)];


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function getInitials(name) {

    if (!name) {
        return "U";
    }

    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!parts.length) {
        return "U";
    }

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


function formatDuration(minutes) {

    const value =
        Number(minutes) || 0;

    if (value <= 0) {
        return "0h";
    }

    if (value < 60) {
        return `${value}m`;
    }

    const hours =
        Math.floor(value / 60);

    const remaining =
        value % 60;

    if (!remaining) {
        return `${hours}h`;
    }

    return `${hours}h ${remaining}m`;

}


function formatActivityType(type) {

    const value =
        String(type || "")
            .trim()
            .toLowerCase();

    const labels = {

        reading: "Reading",

        text: "Reading",

        vocabulary: "Vocabulary",

        listening: "Listening",

        audio: "Listening",

        video: "Video",

        exercise: "Practice",

        practice: "Practice",

        quiz: "Quiz",

        test: "Test",

        speaking: "Speaking",

        speaking_activity: "Speaking",

        ai: "AI Activity",

        ai_interaction: "AI Activity",

        writing: "Writing",

        review: "Review",

        recall: "Recall"

    };

    return labels[value] || "Activity";

}


/* =====================================================
   COURSE ID
===================================================== */

function getCourseId() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const candidates = [

        params.get("course_id"),

        params.get("course"),

        params.get("id"),

        sessionStorage.getItem(
            "educore_course_id"
        ),

        localStorage.getItem(
            "educore_course_id"
        )

    ];

    return candidates.find(Boolean) || null;

}


/* =====================================================
   LOADING
===================================================== */

function hideLoading() {

    const loading =
        $("#app-loading");

    if (!loading) {
        return;
    }

    loading.classList.add("hidden");

}


function showLoading() {

    const loading =
        $("#app-loading");

    if (!loading) {
        return;
    }

    loading.classList.remove("hidden");

}


/* =====================================================
   NAVIGATION
===================================================== */

function showScreen(screenName) {

    const screen =
        document.getElementById(
            `${screenName}-screen`
        );

    if (!screen) {
        return;
    }

    $$(".screen").forEach(item => {

        item.classList.remove("active");

    });

    screen.classList.add("active");

    state.activeScreen =
        screenName;

    updateNavigation(screenName);

    toggleMoreMenu(false);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function updateNavigation(screenName) {

    $$("[data-screen]").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.screen === screenName
        );

    });

}


/* =====================================================
   MORE MENU
===================================================== */

function toggleMoreMenu(force) {

    const menu =
        $("#more-menu");

    if (!menu) {
        return;
    }

    if (typeof force === "boolean") {

        menu.classList.toggle(
            "open",
            force
        );

        return;

    }

    menu.classList.toggle("open");

}


function setupMoreMenu() {

    const button =
        $("#more-button");

    if (button) {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleMoreMenu();

            }
        );

    }


    $$("[data-more-screen]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const screen =
                        button.dataset.moreScreen;

                    toggleMoreMenu(false);

                    showScreen(screen);

                }
            );

        });


    document.addEventListener(
        "click",
        event => {

            const menu =
                $("#more-menu");

            if (!menu) {
                return;
            }

            if (
                !menu.contains(event.target) &&
                event.target !== $("#more-button")
            ) {

                toggleMoreMenu(false);

            }

        }
    );

}


/* =====================================================
   NAV BUTTONS
===================================================== */

function setupNavigation() {

    $$("[data-screen]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const screen =
                        button.dataset.screen;

                    showScreen(screen);

                }
            );

        });


    const profileButtons = [

        $("#profile-button"),

        $("#top-profile-button")

    ];


    profileButtons.forEach(button => {

        if (!button) {
            return;
        }

        button.addEventListener(
            "click",
            () => {

                showScreen("profile");

            }
        );

    });

}


/* =====================================================
   USER
===================================================== */

async function loadUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.warn(
            "Could not load user:",
            error
        );

        return null;

    }


    state.user =
        data?.user || null;


    if (!state.user) {
        return null;
    }


    const metadata =
        state.user.user_metadata || {};


    const name =
        metadata.full_name ||
        metadata.name ||
        metadata.display_name ||
        state.user.email?.split("@")[0] ||
        "Student";


    const initials =
        getInitials(name);


    const topStudentName =
        $("#top-student-name");

    if (topStudentName) {
        topStudentName.textContent =
            name;
    }


    const railAvatar =
        $("#rail-avatar");

    if (railAvatar) {
        railAvatar.textContent =
            initials;
    }


    const topAvatar =
        $("#top-avatar");

    if (topAvatar) {
        topAvatar.textContent =
            initials;
    }


    const profileLargeAvatar =
        $("#profile-large-avatar");

    if (profileLargeAvatar) {
        profileLargeAvatar.textContent =
            initials;
    }


    const profileName =
        $("#profile-name");

    if (profileName) {
        profileName.textContent =
            name;
    }


    const profileEmail =
        $("#profile-email");

    if (profileEmail) {
        profileEmail.textContent =
            state.user.email || "—";
    }


    return state.user;

}


/* =====================================================
   COURSE + COURSE CONTENT LOADING
=====================================================

   EduCore structure:

   courses
      ↓
   modules
      ↓
   lessons
      ↓
   lesson_sections
      ↓
   activities
      ↓
   questions

   Supporting:

   media

   IMPORTANT:

   The course ID comes from:

   course-platform.html?course_id=123

   Every level is loaded using the actual
   foreign-key relationship created by the
   Admin Builder.
===================================================== */


/* =====================================================
   COURSE ID
===================================================== */

function getCourseId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const candidates = [

        params.get("course_id"),

        params.get("course"),

        params.get("id"),

        sessionStorage.getItem(
            "educore_course_id"
        ),

        localStorage.getItem(
            "educore_course_id"
        )

    ];


    const rawId =
        candidates.find(
            value =>
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ""
        );


    if (!rawId) {

        return null;

    }


    const cleanId =
        String(rawId)
            .trim();


    /*
     * Supabase course IDs are numeric in the
     * current EduCore database.
     *
     * Keep the value as a string for URL/state
     * purposes, but validate that it is numeric
     * before querying the database.
     */

    if (!/^\d+$/.test(cleanId)) {

        console.error(
            "EduCore: Invalid course ID:",
            cleanId
        );

        return null;

    }


    return cleanId;

}


/* =====================================================
   LOAD COURSE
===================================================== */

async function loadCourse() {

    if (!state.courseId) {

        console.error(
            "EduCore: No course ID was supplied."
        );

        renderNoCourse();

        return false;

    }


    console.log(
        "EduCore: Loading course:",
        state.courseId
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("courses")
            .select("*")
            .eq(
                "id",
                state.courseId
            )
            .maybeSingle();


    if (error) {

        console.error(
            "EduCore: Course loading error:",
            error
        );

        renderCourseError();

        return false;

    }


    if (!data) {

        console.error(
            "EduCore: No course found for ID:",
            state.courseId
        );

        renderNoCourse();

        return false;

    }


    state.course =
        data;


    console.log(
        "EduCore: Course loaded:",
        state.course
    );


    renderCourse();


    return true;

}


/* =====================================================
   COURSE RENDER
===================================================== */

function renderCourse() {

    const course =
        state.course;


    if (!course) {
        return;
    }


    const title =
        course.title ||
        "Untitled course";


    const description =
        course.description ||
        "Continue your learning journey with EduCore.";


    const category =
        course.category ||
        course.language ||
        "COURSE";


    const level =
        course.level ||
        "All levels";


    const duration =
        Number(
            course.duration_minutes
        ) ||

        Number(
            course.duration
        ) ||

        calculateCourseDuration();


    const categoryElement =
        $("#course-category");

    if (categoryElement) {

        categoryElement.textContent =
            category;

    }


    const titleElement =
        $("#course-title");

    if (titleElement) {

        titleElement.textContent =
            title;

    }


    const descriptionElement =
        $("#course-description");

    if (descriptionElement) {

        descriptionElement.textContent =
            description;

    }


    const levelElement =
        $("#course-level");

    if (levelElement) {

        levelElement.textContent =
            level;

    }


    const durationElement =
        $("#course-duration");

    if (durationElement) {

        durationElement.textContent =
            formatDuration(duration);

    }


    const topCourseName =
        $("#top-course-name");

    if (topCourseName) {

        topCourseName.textContent =
            title;

    }


    updateLessonCount();

}


/* =====================================================
   LOAD MODULES
===================================================== */

async function loadModules() {

    state.modules = [];


    if (!state.courseId) {

        console.error(
            "EduCore: Cannot load modules without a course ID."
        );

        return false;

    }


    console.log(
        "EduCore: Loading modules for course:",
        state.courseId
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("modules")
            .select("*")
            .eq(
                "course_id",
                state.courseId
            )
            .order(
                "sort_order",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "EduCore: Module loading error:",
            error
        );

        return false;

    }


    state.modules =
        data || [];


    console.log(
        `EduCore: ${state.modules.length} module(s) loaded.`,
        state.modules
    );


    await loadLessons();


    return true;

}


/* =====================================================
   LOAD LESSONS
===================================================== */

async function loadLessons() {

    state.lessons = [];


    const moduleIds =
        state.modules.map(
            module =>
                module.id
        );


    if (!moduleIds.length) {

        console.log(
            "EduCore: No modules found for this course."
        );

        await loadLessonSections();

        return true;

    }


    console.log(
        "EduCore: Loading lessons for modules:",
        moduleIds
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("lessons")
            .select("*")
            .in(
                "module_id",
                moduleIds
            )
            .order(
                "sort_order",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "EduCore: Lesson loading error:",
            error
        );

        return false;

    }


    state.lessons =
        data || [];


    console.log(
        `EduCore: ${state.lessons.length} lesson(s) loaded.`,
        state.lessons
    );


    await loadLessonSections();


    return true;

}


/* =====================================================
   LOAD LESSON SECTIONS
===================================================== */

async function loadLessonSections() {

    state.sections = [];


    const lessonIds =
        state.lessons.map(
            lesson =>
                lesson.id
        );


    if (!lessonIds.length) {

        console.log(
            "EduCore: No lessons found. No sections to load."
        );

        await loadActivities();

        return true;

    }


    console.log(
        "EduCore: Loading sections for lessons:",
        lessonIds
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("lesson_sections")
            .select("*")
            .in(
                "lesson_id",
                lessonIds
            )
            .order(
                "sort_order",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "EduCore: Lesson section loading error:",
            error
        );

        return false;

    }


    state.sections =
        data || [];


    console.log(
        `EduCore: ${state.sections.length} section(s) loaded.`,
        state.sections
    );


    await loadActivities();


    return true;

}


/* =====================================================
   LOAD ACTIVITIES
===================================================== */

async function loadActivities() {

    state.activities = [];


    const sectionIds =
        state.sections.map(
            section =>
                section.id
        );


    if (!sectionIds.length) {

        console.log(
            "EduCore: No sections found. No activities to load."
        );

        await loadQuestions();

        return true;

    }


    console.log(
        "EduCore: Loading activities for sections:",
        sectionIds
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("activities")
            .select("*")
            .in(
                "section_id",
                sectionIds
            )
            .order(
                "sort_order",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "EduCore: Activity loading error:",
            error
        );

        return false;

    }


    state.activities =
        data || [];


    console.log(
        `EduCore: ${state.activities.length} activit(ies) loaded.`,
        state.activities
    );


    await loadQuestions();


    return true;

}


/* =====================================================
   LOAD QUESTIONS
===================================================== */

async function loadQuestions() {

    state.questions = [];


    const activityIds =
        state.activities.map(
            activity =>
                activity.id
        );


    if (!activityIds.length) {

        console.log(
            "EduCore: No activities found. No questions to load."
        );

        await loadMedia();

        return true;

    }


    console.log(
        "EduCore: Loading questions for activities:",
        activityIds
    );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("questions")
            .select("*")
            .in(
                "activity_id",
                activityIds
            )
            .order(
                "sort_order",
                {
                    ascending: true
                }
            );


    if (error) {

        /*
         * Questions are supporting content.
         *
         * A question-loading failure should not
         * prevent the course itself from loading.
         */

        console.warn(
            "EduCore: Question loading error:",
            error
        );

    } else {

        state.questions =
            data || [];

    }


    console.log(
        `EduCore: ${state.questions.length} question(s) loaded.`
    );


    await loadMedia();


    return true;

}


/* =====================================================
   LOAD MEDIA
===================================================== */

async function loadMedia() {

    state.media = [];


    /*
     * Media can belong directly to:
     *
     * course
     * lesson
     * activity
     *
     * We therefore perform separate queries
     * instead of constructing a complicated
     * PostgREST OR expression.
     *
     * This is more reliable and much easier
     * to debug.
     */

    const requests = [];


    /* -------------------------------------------------
       COURSE MEDIA
    ------------------------------------------------- */

    if (state.courseId) {

        requests.push(

            supabaseClient
                .from("media")
                .select("*")
                .eq(
                    "course_id",
                    state.courseId
                )

        );

    }


    /* -------------------------------------------------
       LESSON MEDIA
    ------------------------------------------------- */

    const lessonIds =
        state.lessons.map(
            lesson =>
                lesson.id
        );


    if (lessonIds.length) {

        requests.push(

            supabaseClient
                .from("media")
                .select("*")
                .in(
                    "lesson_id",
                    lessonIds
                )

        );

    }


    /* -------------------------------------------------
       ACTIVITY MEDIA
    ------------------------------------------------- */

    const activityIds =
        state.activities.map(
            activity =>
                activity.id
        );


    if (activityIds.length) {

        requests.push(

            supabaseClient
                .from("media")
                .select("*")
                .in(
                    "activity_id",
                    activityIds
                )

        );

    }


    if (!requests.length) {

        console.log(
            "EduCore: No media queries required."
        );

        await loadProgress();

        return true;

    }


    const results =
        await Promise.all(
            requests
        );


    const mediaMap =
        new Map();


    results.forEach(
        result => {

            if (result.error) {

                console.warn(
                    "EduCore: Media loading error:",
                    result.error
                );

                return;

            }


            (result.data || [])
                .forEach(
                    media => {

                        mediaMap.set(
                            String(media.id),
                            media
                        );

                    }
                );

        }
    );


    state.media =
        [...mediaMap.values()]
            .sort(
                (a, b) =>
                    new Date(
                        a.created_at || 0
                    ) -
                    new Date(
                        b.created_at || 0
                    )
            );


    console.log(
        `EduCore: ${state.media.length} media item(s) loaded.`,
        state.media
    );


    await loadProgress();


    return true;

}

/* =====================================================
   PROGRESS
===================================================== */

async function loadProgress() {

    state.progress = {};

    state.activityProgress = {};


    if (!state.user) {

        renderEverything();

        return;

    }


    /* -------------------------------------------------
       LESSON PROGRESS
    ------------------------------------------------- */

    if (state.lessons.length) {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("lesson_progress")
                .select("*")
                .eq("student_id", state.user.id)
                .in(
                    "lesson_id",
                    state.lessons.map(
                        lesson => lesson.id
                    )
                );


        if (!error && data) {

            data.forEach(row => {

                state.progress[row.lesson_id] =
                    row;

            });

        } else if (error) {

            console.warn(
                "Lesson progress loading error:",
                error
            );

        }

    }


    /* -------------------------------------------------
       ACTIVITY PROGRESS
    ------------------------------------------------- */

    if (state.activities.length) {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("activity_progress")
                .select("*")
                .eq("student_id", state.user.id)
                .in(
                    "activity_id",
                    state.activities.map(
                        activity => activity.id
                    )
                );


        if (!error && data) {

            data.forEach(row => {

                state.activityProgress[
                    row.activity_id
                ] = row;

            });

        } else if (error) {

            console.warn(
                "Activity progress loading error:",
                error
            );

        }

    }


    renderEverything();

}


/* =====================================================
   COURSE DURATION
===================================================== */

function calculateCourseDuration() {

    return state.lessons.reduce(
        (total, lesson) =>
            total +
            (Number(
                lesson.duration_minutes
            ) || 0),
        0
    );

}


/* =====================================================
   LESSON COUNT
===================================================== */

function updateLessonCount() {

    const count =
        state.lessons.length;


    const element =
        $("#course-lesson-count");

    if (element) {

        element.textContent =
            `${count} ${
                count === 1
                    ? "lesson"
                    : "lessons"
            }`;

    }


    const completed =
        countCompleted();


    const statCompleted =
        $("#stat-completed");

    if (statCompleted) {
        statCompleted.textContent =
            completed;
    }


    const progressLessons =
        $("#progress-lessons");

    if (progressLessons) {
        progressLessons.textContent =
            completed;
    }

}


/* =====================================================
   LESSON STATUS
===================================================== */

function lessonCompleted(lesson) {

    if (!lesson) {
        return false;
    }


    const value =
        state.progress[lesson.id];


    if (!value) {
        return false;
    }


    return (
        value.completed === true ||
        value.status === "completed" ||
        Number(value.progress_percent) >= 100
    );

}


/* =====================================================
   COUNT COMPLETED
===================================================== */

function countCompleted() {

    return state.lessons.filter(
        lesson =>
            lessonCompleted(lesson)
    ).length;

}


/* =====================================================
   COURSE PROGRESS
===================================================== */

function calculateProgress() {

    const total =
        state.lessons.length;


    if (!total) {
        return 0;
    }


    return Math.round(
        (
            countCompleted() /
            total
        ) * 100
    );

}


/* =====================================================
   PROGRESS RENDER
===================================================== */

function renderProgress() {

    const progress =
        calculateProgress();


    const top =
        $("#top-progress-value");

    if (top) {
        top.textContent =
            `${progress}%`;
    }


    const hero =
        $("#hero-progress-value");

    if (hero) {
        hero.textContent =
            `${progress}%`;
    }


    const dashboard =
        $("#progress-dashboard-value");

    if (dashboard) {
        dashboard.textContent =
            `${progress}%`;
    }


    const ring =
        $("#hero-progress");


    if (ring) {

        const degrees =
            progress * 3.6;

        ring.style.background =
            `conic-gradient(
                var(--purple)
                ${degrees}deg,
                #eeecf3
                ${degrees}deg
            )`;

    }


    const completed =
        countCompleted();


    const streak =
        $("#progress-streak");

    if (streak) {
        streak.textContent =
            "0";
    }


    const statStreak =
        $("#stat-streak");

    if (statStreak) {
        statStreak.textContent =
            "0";
    }


    const xp =
        completed * 10;


    const statXP =
        $("#stat-xp");

    if (statXP) {
        statXP.textContent =
            String(xp);
    }


    const progressXP =
        $("#progress-xp");

    if (progressXP) {
        progressXP.textContent =
            String(xp);
    }


    const statCompleted =
        $("#stat-completed");

    if (statCompleted) {
        statCompleted.textContent =
            completed;
    }


    const progressLessons =
        $("#progress-lessons");

    if (progressLessons) {
        progressLessons.textContent =
            completed;
    }


    calculateLearningTime();

}


/* =====================================================
   LEARNING TIME
===================================================== */

function calculateLearningTime() {

    const minutes =
        state.lessons.reduce(
            (total, lesson) => {

                if (
                    lessonCompleted(lesson)
                ) {

                    return total +
                        (
                            Number(
                                lesson.duration_minutes
                            ) || 0
                        );

                }

                return total;

            },
            0
        );


    const element =
        $("#stat-time");

    if (element) {

        element.textContent =
            formatDuration(minutes);

    }

}


/* =====================================================
   CONTINUE LESSON
===================================================== */

function getContinueLesson() {

    if (!state.lessons.length) {
        return null;
    }


    const incomplete =
        state.lessons.find(
            lesson =>
                !lessonCompleted(lesson)
        );


    return (
        incomplete ||
        state.lessons[
            state.lessons.length - 1
        ]
    );

}


/* =====================================================
   MODULE LOOKUP
===================================================== */

function getModuleForLesson(lesson) {

    if (!lesson) {
        return null;
    }


    return (
        state.modules.find(
            module =>
                String(module.id) ===
                String(lesson.module_id)
        ) ||
        null
    );

}


/* =====================================================
   SECTIONS FOR LESSON
===================================================== */

function getSectionsForLesson(lessonId) {

    return state.sections
        .filter(
            section =>
                String(section.lesson_id) ===
                String(lessonId)
        )
        .sort(
            (a, b) =>
                Number(a.sort_order || 0) -
                Number(b.sort_order || 0)
        );

}


/* =====================================================
   ACTIVITIES FOR SECTION
===================================================== */

function getActivitiesForSection(sectionId) {

    return state.activities
        .filter(
            activity =>
                String(activity.section_id) ===
                String(sectionId)
        )
        .sort(
            (a, b) =>
                Number(a.sort_order || 0) -
                Number(b.sort_order || 0)
        );

}


/* =====================================================
   QUESTIONS FOR ACTIVITY
===================================================== */

function getQuestionsForActivity(activityId) {

    return state.questions
        .filter(
            question =>
                String(question.activity_id) ===
                String(activityId)
        )
        .sort(
            (a, b) =>
                Number(a.sort_order || 0) -
                Number(b.sort_order || 0)
        );

}


/* =====================================================
   MEDIA FOR LESSON
===================================================== */

function getMediaForLesson(lessonId) {

    return state.media.filter(
        item =>
            String(item.lesson_id) ===
            String(lessonId)
    );

}


/* =====================================================
   MEDIA FOR ACTIVITY
===================================================== */

function getMediaForActivity(activityId) {

    return state.media.filter(
        item =>
            String(item.activity_id) ===
            String(activityId)
    );

}


/* =====================================================
   MEDIA URL
===================================================== */

function resolveMediaURL(media) {

    if (!media) {
        return "";
    }


    if (
        media.url &&
        /^https?:\/\//i.test(media.url)
    ) {

        return media.url;

    }


    if (
        media.storage_url &&
        /^https?:\/\//i.test(
            media.storage_url
        )
    ) {

        return media.storage_url;

    }


    if (
        media.public_url &&
        /^https?:\/\//i.test(
            media.public_url
        )
    ) {

        return media.public_url;

    }


    /*
       Storage bucket will be connected here.

       We deliberately don't guess the bucket
       name until the actual Storage configuration
       is confirmed.
    */

    return "";

}


/* =====================================================
   CONTINUE CARD
===================================================== */

function renderContinue() {

    const lesson =
        getContinueLesson();


    if (!lesson) {

        const title =
            $("#continue-lesson");

        if (title) {
            title.textContent =
                "Your course is ready";
        }


        const description =
            $("#continue-description");

        if (description) {
            description.textContent =
                "Your first lesson will appear here.";
        }

        return;

    }


    const module =
        getModuleForLesson(lesson);


    const index =
        state.lessons.indexOf(lesson);


    const number =
        $("#continue-number");

    if (number) {
        number.textContent =
            String(index + 1)
                .padStart(2, "0");
    }


    const moduleElement =
        $("#continue-module");

    if (moduleElement) {
        moduleElement.textContent =
            module?.title ||
            "Course lesson";
    }


    const lessonElement =
        $("#continue-lesson");

    if (lessonElement) {
        lessonElement.textContent =
            lesson.title ||
            "Lesson";
    }


    const description =
        $("#continue-description");

    if (description) {
        description.textContent =
            lesson.description ||
            "Continue your learning journey.";
    }

}


/* =====================================================
   OVERVIEW PATH
===================================================== */

function renderPath() {

    const container =
        $("#overview-path");


    if (!container) {
        return;
    }


    if (!state.modules.length) {

        container.innerHTML =
            emptyPathHTML();

        return;

    }


    container.innerHTML =
        state.modules.map(
            (module, index) => {

                const moduleLessons =
                    state.lessons.filter(
                        lesson =>
                            String(
                                lesson.module_id
                            ) ===
                            String(module.id)
                    );


                const completed =
                    moduleLessons.filter(
                        lesson =>
                            lessonCompleted(
                                lesson
                            )
                    ).length;


                const percentage =
                    moduleLessons.length
                        ? Math.round(
                            completed /
                            moduleLessons.length *
                            100
                        )
                        : 0;


                return `

                    <div
                        class="path-item ${
                            percentage === 100
                                ? "completed"
                                : ""
                        }"
                    >

                        <div class="path-number">

                            ${String(index + 1)
                                .padStart(2, "0")}

                        </div>


                        <div class="path-info">

                            <strong>

                                ${escapeHTML(
                                    module.title ||
                                    `Module ${index + 1}`
                                )}

                            </strong>

                            <span>

                                ${moduleLessons.length}
                                ${
                                    moduleLessons.length === 1
                                        ? "lesson"
                                        : "lessons"
                                }

                            </span>

                        </div>


                        <div class="path-progress">

                            <div class="path-progress-track">

                                <div
                                    class="path-progress-fill"
                                    style="width:${percentage}%"
                                ></div>

                            </div>

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =====================================================
   LEARN LIST
===================================================== */

function renderLearnList() {

    const container =
        $("#learn-list");


    if (!container) {
        return;
    }


    if (!state.lessons.length) {

        container.innerHTML =
            emptyLessonHTML();

        return;

    }


    container.innerHTML =
        state.lessons.map(
            (lesson, index) => {

                const module =
                    getModuleForLesson(lesson);


                const completed =
                    lessonCompleted(lesson);


                const progress =
                    state.progress[lesson.id]
                        ?.progress_percent || 0;


                return `

                    <article
                        class="lesson-large ${
                            completed
                                ? "completed"
                                : ""
                        }"
                        data-lesson-id="${escapeHTML(
                            lesson.id
                        )}"
                    >

                        <div class="lesson-large-number">

                            ${String(index + 1)
                                .padStart(2, "0")}

                        </div>


                        <div class="lesson-large-info">

                            <strong>

                                ${escapeHTML(
                                    lesson.title ||
                                    `Lesson ${index + 1}`
                                )}

                            </strong>


                            <span>

                                ${escapeHTML(
                                    module?.title ||
                                    "Course lesson"
                                )}

                            </span>

                        </div>


                        <div class="lesson-large-status">

                            ${
                                completed
                                    ? "Completed"
                                    : progress > 0
                                        ? `${progress}%`
                                        : "Start →"
                            }

                        </div>

                    </article>

                `;

            }
        ).join("");


    $$("#learn-list .lesson-large")
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    openLesson(
                        item.dataset.lessonId
                    );

                }
            );

        });

}


/* =====================================================
   CONTENTS
===================================================== */

function renderContents() {

    const container =
        $("#contents-list");


    if (!container) {
        return;
    }


    if (!state.modules.length) {

        container.innerHTML =
            emptyPathHTML();

        return;

    }


    container.innerHTML =
        state.modules.map(
            (module, moduleIndex) => {

                const moduleLessons =
                    state.lessons.filter(
                        lesson =>
                            String(
                                lesson.module_id
                            ) ===
                            String(module.id)
                    );


                return `

                    <div class="content-module">

                        <button
                            class="content-module-header"
                            type="button"
                        >

                            <div class="content-module-number">

                                ${String(
                                    moduleIndex + 1
                                ).padStart(2, "0")}

                            </div>


                            <div class="content-module-title">

                                <strong>

                                    ${escapeHTML(
                                        module.title ||
                                        `Module ${moduleIndex + 1}`
                                    )}

                                </strong>


                                <span>

                                    ${moduleLessons.length}
                                    ${
                                        moduleLessons.length === 1
                                            ? "lesson"
                                            : "lessons"
                                    }

                                </span>

                            </div>


                            <span class="content-module-arrow">
                                ↓
                            </span>

                        </button>


                        <div class="module-lessons">

                            ${moduleLessons.map(
                                (lesson, lessonIndex) => `

                                    <button
                                        class="content-lesson"
                                        data-lesson-id="${escapeHTML(
                                            lesson.id
                                        )}"
                                        type="button"
                                    >

                                        <span class="content-lesson-icon">

                                            ${String(
                                                lessonIndex + 1
                                            ).padStart(2, "0")}

                                        </span>


                                        <span class="content-lesson-info">

                                            <strong>

                                                ${escapeHTML(
                                                    lesson.title ||
                                                    `Lesson ${lessonIndex + 1}`
                                                )}

                                            </strong>


                                            <span>

                                                ${
                                                    lessonCompleted(
                                                        lesson
                                                    )
                                                        ? "Completed"
                                                        : "Not started"
                                                }

                                            </span>

                                        </span>

                                    </button>

                                `
                            ).join("")}

                        </div>

                    </div>

                `;

            }
        ).join("");


    $$(".content-module-header")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    button
                        .closest(".content-module")
                        .classList.toggle("open");

                }
            );

        });


    $$(".content-lesson")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    openLesson(
                        button.dataset.lessonId
                    );

                }
            );

        });

}


/* =====================================================
   LESSON PLAYER
===================================================== */

async function openLesson(lessonId) {

    const lesson =
        state.lessons.find(
            item =>
                String(item.id) ===
                String(lessonId)
        );


    if (!lesson) {
        return;
    }


    state.currentLesson =
        lesson;


    state.currentLessonIndex =
        state.lessons.indexOf(lesson);


    renderLessonPlayer();


    showScreen("lesson");


    await loadLessonContent(lesson);


    if (state.user) {

        await markLessonStarted(
            lesson
        );

    }

}


/* =====================================================
   LESSON PLAYER HEADER
===================================================== */

function renderLessonPlayer() {

    const lesson =
        state.currentLesson;


    if (!lesson) {
        return;
    }


    const module =
        getModuleForLesson(lesson);


    const moduleName =
        $("#lesson-module-name");

    if (moduleName) {

        moduleName.textContent =
            module?.title ||
            "Course";

    }


    const position =
        $("#lesson-position-number");

    if (position) {

        position.textContent =
            state.currentLessonIndex + 1;

    }


    const status =
        $("#lesson-footer-status");

    if (status) {

        status.textContent =
            lessonCompleted(lesson)
                ? "Completed"
                : "In progress";

    }


    const progress =
        state.lessons.length
            ? (
                state.currentLessonIndex /
                Math.max(
                    state.lessons.length - 1,
                    1
                )
            ) * 100
            : 0;


    const progressFill =
        $("#lesson-progress-fill");

    if (progressFill) {

        progressFill.style.width =
            `${progress}%`;

    }


    const previous =
        $("#previous-lesson");

    if (previous) {

        previous.disabled =
            state.currentLessonIndex <= 0;

    }


    const next =
        $("#next-lesson");

    if (next) {

        next.textContent =
            state.currentLessonIndex >=
            state.lessons.length - 1
                ? "Complete ✓"
                : "Next →";

    }


    const save =
        $("#lesson-save");

    if (save) {

        save.textContent =
            state.savedLessons.has(
                lesson.id
            )
                ? "♥"
                : "♡";

    }

}


/* =====================================================
   LESSON CONTENT
===================================================== */

async function loadLessonContent(lesson) {

    const container =
        $("#lesson-body");


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="lesson-loading">

            <span>
                Loading lesson...
            </span>

        </div>

    `;


    const sections =
        getSectionsForLesson(
            lesson.id
        );


    if (!sections.length) {

        renderFallbackLesson(
            lesson,
            "This lesson does not have any sections yet."
        );

        return;

    }


    const lessonMedia =
        getMediaForLesson(
            lesson.id
        );


    let html = "";


    /* -------------------------------------------------
       LESSON INTRODUCTION
    ------------------------------------------------- */

    html += `

        <span class="eyebrow">
            LESSON
        </span>

        <h1>
            ${escapeHTML(
                lesson.title ||
                "Lesson"
            )}
        </h1>

    `;


    if (lesson.description) {

        html += `

            <p class="lesson-introduction">
                ${escapeHTML(
                    lesson.description
                )}
            </p>

        `;

    }


    /* -------------------------------------------------
       LESSON-LEVEL MEDIA
    ------------------------------------------------- */

    if (lessonMedia.length) {

        html += lessonMedia
            .map(
                media =>
                    renderMedia(
                        media
                    )
            )
            .join("");

    }


    /* -------------------------------------------------
       SECTIONS
    ------------------------------------------------- */

    sections.forEach(
        (section, sectionIndex) => {

            html += renderSection(
                section,
                sectionIndex
            );

        }
    );


    container.innerHTML =
        html ||
        `<div class="empty-state">
            <strong>Lesson ready</strong>
            <span>
                Content will appear here.
            </span>
        </div>`;

}


/* =====================================================
   SECTION RENDERER
===================================================== */

function renderSection(
    section,
    sectionIndex
) {

    const activities =
        getActivitiesForSection(
            section.id
        );


    let html = `

        <section class="lesson-section">

            ${
                section.title
                    ? `
                        <div class="lesson-section-heading">

                            <span class="eyebrow">
                                SECTION ${String(
                                    sectionIndex + 1
                                ).padStart(2, "0")}
                            </span>

                            <h2>
                                ${escapeHTML(
                                    section.title
                                )}
                            </h2>

                            ${
                                section.description
                                    ? `
                                        <p>
                                            ${escapeHTML(
                                                section.description
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>
                    `
                    : ""
            }

    `;


    /* -------------------------------------------------
       SECTION JSON CONTENT
    ------------------------------------------------- */

    if (
        section.content &&
        typeof section.content === "object"
    ) {

        html += renderSectionJSON(
            section.content
        );

    }


    /* -------------------------------------------------
       ACTIVITIES
    ------------------------------------------------- */

    if (activities.length) {

        html += activities
            .map(
                activity =>
                    renderActivity(
                        activity
                    )
            )
            .join("");

    }


    if (
        !activities.length &&
        !section.content
    ) {

        html += `

            <div class="lesson-activity">

                <strong>
                    Section ready
                </strong>

                <p>
                    Content for this section has
                    not been added yet.
                </p>

            </div>

        `;

    }


    html += `

        </section>

    `;


    return html;

}


/* =====================================================
   SECTION JSON CONTENT
===================================================== */

function renderSectionJSON(content) {

    if (!content) {
        return "";
    }


    if (typeof content === "string") {

        return `

            <div class="content-block text-block">

                ${escapeHTML(content)}

            </div>

        `;

    }


    if (Array.isArray(content)) {

        return content
            .map(
                item =>
                    renderContentObject(
                        item
                    )
            )
            .join("");

    }


    if (typeof content === "object") {

        if (content.blocks) {

            return Array.isArray(
                content.blocks
            )
                ? content.blocks
                    .map(
                        item =>
                            renderContentObject(
                                item
                            )
                    )
                    .join("")
                : "";

        }


        return renderContentObject(
            content
        );

    }


    return "";

}


/* =====================================================
   CONTENT OBJECT
===================================================== */

function renderContentObject(
    block
) {

    if (!block) {
        return "";
    }


    const type =
        String(
            block.type ||
            block.content_type ||
            "text"
        ).toLowerCase();


    const content =
        block.content ||
        block.body ||
        block.text ||
        "";


    switch (type) {

        case "text":

        case "rich_text":

            return `

                <div class="content-block text-block">

                    ${content}

                </div>

            `;


        case "image":

            return `

                <figure class="content-block">

                    <img
                        src="${escapeHTML(
                            block.url ||
                            block.src ||
                            ""
                        )}"
                        alt="${escapeHTML(
                            block.alt || ""
                        )}"
                    >

                </figure>

            `;


        case "audio":

            return `

                <div class="lesson-audio content-block">

                    <strong>
                        Listen
                    </strong>

                    <audio
                        controls
                        preload="metadata"
                    >

                        <source
                            src="${escapeHTML(
                                block.url ||
                                ""
                            )}"
                        >

                    </audio>

                </div>

            `;


        case "video":

            return `

                <div class="lesson-media content-block">

                    <video
                        controls
                        playsinline
                        preload="metadata"
                    >

                        <source
                            src="${escapeHTML(
                                block.url ||
                                ""
                            )}"
                        >

                    </video>

                </div>

            `;


        default:

            return `

                <div class="content-block text-block">

                    ${escapeHTML(
                        content
                    )}

                </div>

            `;

    }

}


/* =====================================================
   ACTIVITY RENDERER
===================================================== */

function renderActivity(
    activity
) {

    const type =
        String(
            activity.activity_type ||
            ""
        ).toLowerCase();


    const activityProgress =
        state.activityProgress[
            activity.id
        ];


    const completed =
        activityProgress?.completed === true;


    const questions =
        getQuestionsForActivity(
            activity.id
        );


    const media =
        getMediaForActivity(
            activity.id
        );


    let html = `

        <div
            class="lesson-activity content-block ${
                completed
                    ? "completed"
                    : ""
            }"
            data-activity-id="${escapeHTML(
                activity.id
            )}"
        >

            <div class="activity-header">

                <span class="eyebrow">
                    ${escapeHTML(
                        formatActivityType(
                            type
                        )
                    )}
                </span>

                <strong>
                    ${escapeHTML(
                        activity.title ||
                        "Learning activity"
                    )}
                </strong>

            </div>

    `;


    if (activity.instructions) {

        html += `

            <p>
                ${escapeHTML(
                    activity.instructions
                )}
            </p>

        `;

    }


    if (activity.content) {

        html += `

            <div class="activity-content">

                ${escapeHTML(
                    activity.content
                )}

            </div>

        `;

    }


    if (media.length) {

        html += media
            .map(
                item =>
                    renderMedia(
                        item
                    )
            )
            .join("");

    }


    if (
        type === "quiz" ||
        type === "test" ||
        questions.length
    ) {

        html += renderQuestions(
            activity,
            questions
        );

    } else {

        html += `

            <button
                class="primary-button"
                type="button"
                data-action="complete-activity"
                data-activity-id="${escapeHTML(
                    activity.id
                )}"
            >

                ${
                    completed
                        ? "Completed ✓"
                        : "Complete activity"
                }

            </button>

        `;

    }


    html += `

        </div>

    `;


    return html;

}


/* =====================================================
   QUESTIONS
===================================================== */

function renderQuestions(
    activity,
    questions
) {

    if (!questions.length) {

        return `

            <button
                class="primary-button"
                type="button"
                data-action="complete-activity"
                data-activity-id="${escapeHTML(
                    activity.id
                )}"
            >
                Complete activity
            </button>

        `;

    }


    return `

        <div class="activity-questions">

            ${questions.map(
                (question, index) => `

                    <div
                        class="activity-question"
                        data-question-id="${escapeHTML(
                            question.id
                        )}"
                    >

                        <strong>
                            ${index + 1}.
                            ${escapeHTML(
                                question.question_text
                            )}
                        </strong>

                        <input
                            type="text"
                            class="activity-answer"
                            data-question-id="${escapeHTML(
                                question.id
                            )}"
                            placeholder="Type your answer..."
                        >

                    </div>

                `
            ).join("")}

        </div>


        <button
            class="primary-button"
            type="button"
            data-action="submit-activity"
            data-activity-id="${escapeHTML(
                activity.id
            )}"
        >
            Check answers
        </button>

    `;

}


/* =====================================================
   MEDIA RENDERER
===================================================== */

function renderMedia(
    media
) {

    const url =
        resolveMediaURL(
            media
        );


    if (!url) {

        return `

            <div class="content-block lesson-activity">

                <strong>
                    ${escapeHTML(
                        media.file_name ||
                        "Media"
                    )}
                </strong>

                <p>
                    This media file is available
                    but its storage URL has not
                    been connected yet.
                </p>

            </div>

        `;

    }


    const type =
        String(
            media.media_type ||
            ""
        ).toLowerCase();


    if (
        type === "image" ||
        media.mime_type?.startsWith("image/")
    ) {

        return `

            <figure class="content-block">

                <img
                    src="${escapeHTML(url)}"
                    alt="${escapeHTML(
                        media.file_name || ""
                    )}"
                >

            </figure>

        `;

    }


    if (
        type === "audio" ||
        media.mime_type?.startsWith("audio/")
    ) {

        return `

            <div class="lesson-audio content-block">

                <strong>
                    Listen
                </strong>

                <audio
                    controls
                    preload="metadata"
                >

                    <source
                        src="${escapeHTML(url)}"
                    >

                </audio>

            </div>

        `;

    }


    if (
        type === "video" ||
        media.mime_type?.startsWith("video/")
    ) {

        return `

            <div class="lesson-media content-block">

                <video
                    controls
                    playsinline
                    preload="metadata"
                >

                    <source
                        src="${escapeHTML(url)}"
                    >

                </video>

            </div>

        `;

    }


    return "";

}


/* =====================================================
   FALLBACK LESSON
===================================================== */

function renderFallbackLesson(
    lesson,
    message
) {

    const container =
        $("#lesson-body");


    if (!container) {
        return;
    }


    container.innerHTML = `

        <span class="eyebrow">
            LESSON
        </span>

        <h1>
            ${escapeHTML(
                lesson.title ||
                "Lesson"
            )}
        </h1>

        <p>
            ${escapeHTML(
                lesson.description ||
                "Continue your learning journey."
            )}
        </p>

        <div class="lesson-activity">

            <strong>
                ${escapeHTML(
                    message ||
                    "This lesson is ready."
                )}
            </strong>

            <p>
                Learning content will appear here
                when it has been added by the course
                administrator.
            </p>

        </div>

    `;

}


/* =====================================================
   COMPLETE LESSON
===================================================== */

async function completeCurrentLesson() {

    const lesson =
        state.currentLesson;


    if (!lesson) {
        return;
    }


    state.progress[lesson.id] = {

        id:
            state.progress[lesson.id]?.id,

        student_id:
            state.user?.id,

        lesson_id:
            lesson.id,

        status:
            "completed",

        progress_percent:
            100,

        completed:
            true,

        completed_at:
            new Date().toISOString()

    };


    renderProgress();

    renderContinue();

    renderLearnList();

    renderContents();

    renderLessonPlayer();


    if (!state.user) {
        return;
    }


    const existing =
        state.progress[
            lesson.id
        ];


    const payload = {

        student_id:
            state.user.id,

        lesson_id:
            lesson.id,

        status:
            "completed",

        progress_percent:
            100,

        completed_at:
            new Date().toISOString(),

        updated_at:
            new Date().toISOString()

    };


    let result;


    if (existing?.id) {

        result =
            await supabaseClient
                .from("lesson_progress")
                .update(payload)
                .eq(
                    "id",
                    existing.id
                );

    } else {

        result =
            await supabaseClient
                .from("lesson_progress")
                .insert(payload);

    }


    if (result.error) {

        console.warn(
            "Lesson progress could not be saved:",
            result.error
        );

    }

}


/* =====================================================
   MARK LESSON STARTED
===================================================== */

async function markLessonStarted(
    lesson
) {

    if (!state.user || !lesson) {
        return;
    }


    const existing =
        state.progress[
            lesson.id
        ];


    if (existing?.id) {

        if (
            existing.status === "completed"
        ) {
            return;
        }


        const result =
            await supabaseClient
                .from("lesson_progress")
                .update({

                    status:
                        "in_progress",

                    progress_percent:
                        Math.max(
                            Number(
                                existing.progress_percent
                            ) || 0,
                            1
                        ),

                    started_at:
                        existing.started_at ||
                        new Date().toISOString(),

                    updated_at:
                        new Date().toISOString()

                })
                .eq(
                    "id",
                    existing.id
                );


        if (result.error) {

            console.warn(
                "Could not update lesson start:",
                result.error
            );

        }


        return;

    }


    const result =
        await supabaseClient
            .from("lesson_progress")
            .insert({

                student_id:
                    state.user.id,

                lesson_id:
                    lesson.id,

                status:
                    "in_progress",

                progress_percent:
                    1,

                started_at:
                    new Date().toISOString()

            });


    if (result.error) {

        console.warn(
            "Could not create lesson progress:",
            result.error
        );

        return;

    }


    state.progress[lesson.id] = {

        student_id:
            state.user.id,

        lesson_id:
            lesson.id,

        status:
            "in_progress",

        progress_percent:
            1

    };

}


/* =====================================================
   COMPLETE ACTIVITY
===================================================== */

async function completeActivity(
    activityId
) {

    if (!state.user) {

        markActivityLocal(
            activityId
        );

        return;

    }


    const existing =
        state.activityProgress[
            activityId
        ];


    const payload = {

        student_id:
            state.user.id,

        activity_id:
            activityId,

        completed:
            true,

        attempts:
            Number(
                existing?.attempts || 0
            ) + 1,

        updated_at:
            new Date().toISOString()

    };


    let result;


    if (existing?.id) {

        result =
            await supabaseClient
                .from("activity_progress")
                .update(payload)
                .eq(
                    "id",
                    existing.id
                );

    } else {

        result =
            await supabaseClient
                .from("activity_progress")
                .insert(payload);

    }


    if (result.error) {

        console.warn(
            "Activity progress could not be saved:",
            result.error
        );

        return;

    }


    state.activityProgress[
        activityId
    ] = {

        ...existing,

        ...payload,

        completed:
            true

    };


    await refreshCurrentLessonProgress();

    await loadProgress();

    await loadLessonContent(
        state.currentLesson
    );

}


/* =====================================================
   LOCAL ACTIVITY COMPLETION
===================================================== */

function markActivityLocal(
    activityId
) {

    state.activityProgress[
        activityId
    ] = {

        completed:
            true

    };

}


/* =====================================================
   SUBMIT ACTIVITY
===================================================== */

async function submitActivity(
    activityId
) {

    const activity =
        state.activities.find(
            item =>
                String(item.id) ===
                String(activityId)
        );


    if (!activity) {
        return;
    }


    const questions =
        getQuestionsForActivity(
            activity.id
        );


    if (!questions.length) {

        await completeActivity(
            activity.id
        );

        return;

    }


    let correct = 0;

    const answers = {};


    questions.forEach(
        question => {

            const input =
                document.querySelector(
                    `.activity-answer[data-question-id="${question.id}"]`
                );


            const answer =
                input?.value?.trim() || "";


            answers[
                question.id
            ] = answer;


            if (
                question.correct_answer &&
                answer.toLowerCase() ===
                String(
                    question.correct_answer
                )
                    .trim()
                    .toLowerCase()
            ) {

                correct++;

            }

        }
    );


    const score =
        Math.round(
            (
                correct /
                questions.length
            ) * 100
        );


    if (!state.user) {

        markActivityLocal(
            activity.id
        );

        return;

    }


    const existing =
        state.activityProgress[
            activity.id
        ];


    const attempts =
        Number(
            existing?.attempts || 0
        ) + 1;


    const progressPayload = {

        student_id:
            state.user.id,

        activity_id:
            activity.id,

        completed:
            score >= 100,

        score,

        attempts,

        last_answer:
            JSON.stringify(
                answers
            ),

        updated_at:
            new Date().toISOString()

    };


    let progressResult;


    if (existing?.id) {

        progressResult =
            await supabaseClient
                .from("activity_progress")
                .update(
                    progressPayload
                )
                .eq(
                    "id",
                    existing.id
                );

    } else {

        progressResult =
            await supabaseClient
                .from("activity_progress")
                .insert(
                    progressPayload
                );

    }


    if (progressResult.error) {

        console.error(
            "Activity progress save error:",
            progressResult.error
        );

        return;

    }


    state.activityProgress[
        activity.id
    ] = {

        ...existing,

        ...progressPayload

    };


    /* -------------------------------------------------
       ATTEMPT HISTORY
    ------------------------------------------------- */

    const attemptResult =
        await supabaseClient
            .from("activity_attempts")
            .insert({

                student_id:
                    state.user.id,

                course_id:
                    state.courseId,

                lesson_id:
                    state.currentLesson?.id ||
                    null,

                activity_id:
                    activity.id,

                attempt_number:
                    attempts,

                score,

                answer_data:
                    answers,

                completed_at:
                    new Date().toISOString()

            });


    if (attemptResult.error) {

        console.warn(
            "Activity attempt history could not be saved:",
            attemptResult.error
        );

    }


    await refreshCurrentLessonProgress();

    await loadProgress();

    await loadLessonContent(
        state.currentLesson
    );

}


/* =====================================================
   REFRESH LESSON PROGRESS
===================================================== */

async function refreshCurrentLessonProgress() {

    const lesson =
        state.currentLesson;


    if (!lesson || !state.user) {
        return;
    }


    const sections =
        getSectionsForLesson(
            lesson.id
        );


    const activities =
        sections.flatMap(
            section =>
                getActivitiesForSection(
                    section.id
                )
        );


    if (!activities.length) {
        return;
    }


    const completed =
        activities.filter(
            activity =>
                state.activityProgress[
                    activity.id
                ]?.completed === true
        ).length;


    const percentage =
        Math.round(
            (
                completed /
                activities.length
            ) * 100
        );


    const existing =
        state.progress[
            lesson.id
        ];


    const newStatus =
        percentage >= 100
            ? "completed"
            : "in_progress";


    const payload = {

        student_id:
            state.user.id,

        lesson_id:
            lesson.id,

        status:
            newStatus,

        progress_percent:
            percentage,

        started_at:
            existing?.started_at ||
            new Date().toISOString(),

        completed_at:
            percentage >= 100
                ? new Date().toISOString()
                : null,

        updated_at:
            new Date().toISOString()

    };


    let result;


    if (existing?.id) {

        result =
            await supabaseClient
                .from("lesson_progress")
                .update(payload)
                .eq(
                    "id",
                    existing.id
                );

    } else {

        result =
            await supabaseClient
                .from("lesson_progress")
                .insert(payload);

    }


    if (result.error) {

        console.warn(
            "Lesson progress update failed:",
            result.error
        );

        return;

    }


    state.progress[
        lesson.id
    ] = {

        ...existing,

        ...payload,

        completed:
            percentage >= 100

    };

}


/* =====================================================
   LESSON NAVIGATION
===================================================== */

function setupLessonNavigation() {

    $("#lesson-back")
        ?.addEventListener(
            "click",
            () => {

                showScreen("learn");

            }
        );


    $("#previous-lesson")
        ?.addEventListener(
            "click",
            () => {

                const previous =
                    state.lessons[
                        state.currentLessonIndex - 1
                    ];


                if (previous) {

                    openLesson(
                        previous.id
                    );

                }

            }
        );


    $("#next-lesson")
        ?.addEventListener(
            "click",
            async () => {

                const next =
                    state.lessons[
                        state.currentLessonIndex + 1
                    ];


                if (!next) {

                    await completeCurrentLesson();

                    showScreen("overview");

                    return;

                }


                await completeCurrentLesson();

                await openLesson(
                    next.id
                );

            }
        );


    $("#lesson-save")
        ?.addEventListener(
            "click",
            () => {

                toggleSaveCurrentLesson();

            }
        );


    document.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            const activityId =
                button.dataset.activityId;


            if (
                action ===
                "complete-activity"
            ) {

                await completeActivity(
                    activityId
                );

            }


            if (
                action ===
                "submit-activity"
            ) {

                await submitActivity(
                    activityId
                );

            }

        }
    );

}


/* =====================================================
   SAVED LESSONS
===================================================== */

function toggleSaveCurrentLesson() {

    const lesson =
        state.currentLesson;


    if (!lesson) {
        return;
    }


    if (
        state.savedLessons.has(
            lesson.id
        )
    ) {

        state.savedLessons.delete(
            lesson.id
        );

    } else {

        state.savedLessons.add(
            lesson.id
        );

    }


    renderLessonPlayer();

    renderSavedLessons();

}


/* =====================================================
   SAVED SCREEN
===================================================== */

function renderSavedLessons() {

    const screen =
        $("#saved-screen");


    if (!screen) {
        return;
    }


    const lessons =
        state.lessons.filter(
            lesson =>
                state.savedLessons.has(
                    lesson.id
                )
        );


    const existing =
        screen.querySelector(
            ".saved-lessons-list"
        );


    if (existing) {
        existing.remove();
    }


    const list =
        document.createElement(
            "div"
        );


    list.className =
        "saved-lessons-list";


    if (!lessons.length) {

        list.innerHTML = `

            <div class="empty-state">

                <strong>
                    Nothing saved yet
                </strong>

                <span>
                    Save lessons while learning
                    to find them here.
                </span>

            </div>

        `;

    } else {

        list.innerHTML =
            lessons.map(
                lesson => `

                    <button
                        class="content-lesson"
                        type="button"
                        data-saved-lesson="${escapeHTML(
                            lesson.id
                        )}"
                    >

                        <span class="content-lesson-icon">
                            ✓
                        </span>

                        <span class="content-lesson-info">

                            <strong>
                                ${escapeHTML(
                                    lesson.title
                                )}
                            </strong>

                            <span>
                                Saved lesson
                            </span>

                        </span>

                    </button>

                `
            ).join("");

    }


    screen.appendChild(list);


    list.querySelectorAll(
        "[data-saved-lesson]"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openLesson(
                    button.dataset.savedLesson
                );

            }
        );

    });

}


/* =====================================================
   CONTINUE BUTTONS
===================================================== */

function setupContinueButtons() {

    const openContinue =
        () => {

            const lesson =
                getContinueLesson();


            if (lesson) {

                openLesson(
                    lesson.id
                );

            }

        };


    $("#continue-button")
        ?.addEventListener(
            "click",
            openContinue
        );


    $("#continue-card-button")
        ?.addEventListener(
            "click",
            openContinue
        );

}


/* =====================================================
   EXIT COURSE
===================================================== */

function setupExitCourse() {

    $("#exit-course")
        ?.addEventListener(
            "click",
            () => {

                toggleMoreMenu(false);

                window.location.href =
                    "../student.html";

            }
        );

}


/* =====================================================
   EMPTY STATES
===================================================== */

function emptyPathHTML() {

    return `

        <div class="empty-state">

            <strong>
                Course structure coming soon
            </strong>

            <span>
                Modules will appear here when
                they are added.
            </span>

        </div>

    `;

}


function emptyLessonHTML() {

    return `

        <div class="empty-state">

            <strong>
                No lessons yet
            </strong>

            <span>
                Lessons will appear here when
                the course is built.
            </span>

        </div>

    `;

}


/* =====================================================
   RENDER EVERYTHING
===================================================== */

function renderEverything() {

    renderCourse();

    renderContinue();

    renderPath();

    renderLearnList();

    renderContents();

    renderProgress();

    renderSavedLessons();

    updateLessonCount();

}


/* =====================================================
   ERRORS
===================================================== */

function renderNoCourse() {

    const title =
        $("#course-title");

    if (title) {
        title.textContent =
            "Course not selected";
    }


    const description =
        $("#course-description");

    if (description) {

        description.textContent =
            "No course was selected for this learning session.";

    }


    const continueLesson =
        $("#continue-lesson");

    if (continueLesson) {

        continueLesson.textContent =
            "Select a course to begin";

    }


    hideLoading();

}


function renderCourseError() {

    const title =
        $("#course-title");

    if (title) {

        title.textContent =
            "Unable to load course";

    }


    const description =
        $("#course-description");

    if (description) {

        description.textContent =
            "There was a problem loading this course from Supabase.";

    }


    hideLoading();

}


/* =====================================================
   INITIALIZATION
===================================================== */

async function init() {

    showLoading();


    /*
     * 1. Get the course ID from the URL.
     */

    state.courseId =
        getCourseId();


    console.log(
        "================================================"
    );

    console.log(
        "EDUCORE COURSE PLATFORM"
    );

    console.log(
        "Course ID:",
        state.courseId
    );

    console.log(
        "================================================"
    );


    setupNavigation();

    setupMoreMenu();

    setupLessonNavigation();

    setupContinueButtons();

    setupExitCourse();


    try {

        /*
         * 2. Load authenticated student.
         */

        await loadUser();


        /*
         * 3. Load the selected course.
         */

        const courseLoaded =
            await loadCourse();


        if (!courseLoaded) {

            console.error(
                "EduCore: Course could not be loaded."
            );

            return;

        }


        /*
         * 4. Load the complete course tree.
         *
         * courses
         *    ↓
         * modules
         *    ↓
         * lessons
         *    ↓
         * sections
         *    ↓
         * activities
         *    ↓
         * questions
         *    +
         * media
         */

        await loadModules();


        /*
         * 5. Render the complete platform.
         */

        renderEverything();


        console.log(
            "================================================"
        );

        console.log(
            "EDUCORE COURSE LOADING COMPLETE"
        );

        console.log(
            "Course:",
            state.course
        );

        console.log(
            "Modules:",
            state.modules.length
        );

        console.log(
            "Lessons:",
            state.lessons.length
        );

        console.log(
            "Sections:",
            state.sections.length
        );

        console.log(
            "Activities:",
            state.activities.length
        );

        console.log(
            "Questions:",
            state.questions.length
        );

        console.log(
            "Media:",
            state.media.length
        );

        console.log(
            "================================================"
        );


    } catch (error) {

        console.error(
            "EduCore initialization error:",
            error
        );

        renderCourseError();

    } finally {

        hideLoading();

    }

}


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    init
);
