/* =====================================================
   EDUCORE COURSE PLATFORM
===================================================== */
 
"use strict";
 
 
/* =====================================================
   SUPABASE
=====================================================
 
   IMPORTANT:
   Put the SAME Supabase URL and anon key used by
   your existing EduCore project here.
 
===================================================== */
 
const SUPABASE_URL =
    window.EDUCORE_SUPABASE_URL ||
    localStorage.getItem("educore_supabase_url") ||
	"";
 
const SUPABASE_ANON_KEY =
    window.EDUCORE_SUPABASE_ANON_KEY ||
    localStorage.getItem("educore_supabase_anon_key") ||
	"";
 
 
let supabaseClient = null;
 
if (
	SUPABASE_URL &&
	SUPABASE_ANON_KEY &&
	window.supabase
) {
 
	supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
    	);
 
}
 
 
/* =====================================================
   STATE
===================================================== */
 
const state = {
 
	user: null,
 
	course: null,
 
	modules: [],
 
	lessons: [],
 
	currentLesson: null,
 
    currentLessonIndex: -1,
 
	progress: {},
 
	currentScreen: "overview",
 
	courseId: null,
 
    loadedFromDatabase: false
 
};
 
 
/* =====================================================
   HELPERS
===================================================== */
 
const $ = selector =>
    document.querySelector(selector);
 
 
const $$ = selector =>
    Array.from(document.querySelectorAll(selector));
 
 
function escapeHTML(value) {
 
	if (value === null || value === undefined) {
 
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
            .substring(0, 2)
            .toUpperCase();
 
	}
 
	return (
    	parts[0][0] +
        parts[parts.length - 1][0]
	).toUpperCase();
 
}
 
 
function getCourseId() {
 
	const params =
    	new URLSearchParams(
            window.location.search
    	);
 
	return (
        params.get("course_id") ||
        params.get("courseId") ||
        params.get("course") ||
        localStorage.getItem("educore_selected_course") ||
        sessionStorage.getItem("educore_selected_course") ||
    	null
	);
 
}
 
 
function formatDuration(minutes) {
 
	const value =
        Number(minutes) || 0;
 
	if (!value) {
 
    	return "0 hours";
 
	}
 
	if (value < 60) {
 
    	return `${value} min`;
 
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
 
 
function normalizeId(value) {
 
	return String(value ?? "");
 
}
 
 
function hideLoading() {
 
	const loading =
        $("#app-loading");
 
	if (loading) {
 
        loading.classList.add("hidden");
 
	}
 
}
 
 
function showLoading() {
 
	const loading =
        $("#app-loading");
 
	if (loading) {
 
        loading.classList.remove("hidden");
 
	}
 
}
 
 
function showMessage(title, description) {
 
	const body =
        $("#lesson-body-content");
 
	if (!body) {
 
    	return;
 
	}
 
	body.innerHTML = `
 
    	<div class="lesson-placeholder">
 
        	<span class="eyebrow">
                EDUCORE
            </span>
 
        	<h1>
                ${escapeHTML(title)}
            </h1>
 
        	<p class="lesson-content-description">
                ${escapeHTML(description)}
        	</p>
 
    	</div>
 
	`;
 
}
 
 
/* =====================================================
   USER
===================================================== */
 
async function loadUser() {
 
	if (!supabaseClient) {
 
    	const storedName =
            localStorage.getItem("educore_student_name");
 
    	state.user = {
 
        	id: null,
 
        	email:
                localStorage.getItem("educore_student_email") ||
                "",
 
            user_metadata: {
 
                full_name:
                    storedName ||
                    "Student"
 
        	}
 
    	};
 
        updateUserUI();
 
    	return;
 
	}
 
 
	const {
    	data,
    	error
	} =
    	await supabaseClient.auth.getUser();
 
 
	if (error) {
 
    	console.warn(
            "EduCore user error:",
        	error
    	);
 
    	return;
 
	}
 
 
	state.user =
    	data?.user || null;
 
 
	updateUserUI();
 
}
 
 
function getUserName() {
 
	const metadata =
        state.user?.user_metadata || {};
 
	return (
        metadata.full_name ||
    	metadata.name ||
        metadata.display_name ||
        state.user?.email?.split("@")[0] ||
        "Student"
	);
 
}
 
 
function updateUserUI() {
 
	const name =
    	getUserName();
 
	const initials =
        getInitials(name);
 
 
	const elements = [
 
        $("#rail-avatar"),
        $("#top-avatar"),
        $("#profile-large-avatar")
 
	];
 
 
    elements.forEach(element => {
 
    	if (element) {
 
            element.textContent =
                initials;
 
    	}
 
	});
 
 
	const topName =
        $("#top-student-name");
 
	if (topName) {
 
        topName.textContent =
        	name;
 
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
            state.user?.email ||
            "Student account";
 
	}
 
}
 
 
/* =====================================================
   COURSE ID / COURSE
===================================================== */
 
async function loadCourse() {
 
	state.courseId =
    	getCourseId();
 
 
	if (!state.courseId) {
 
        loadDemoCourse();
 
    	return;
 
	}
 
 
	if (!supabaseClient) {
 
        loadDemoCourse();
 
    	return;
 
	}
 
 
	const {
    	data,
    	error
	} =
    	await supabaseClient
            .from("courses")
            .select("*")
            .eq("id", state.courseId)
            .maybeSingle();
 
 
	if (error) {
 
    	console.error(
            "EduCore course error:",
        	error
    	);
 
        loadDemoCourse();
 
    	return;
 
	}
 
 
	if (!data) {
 
        loadDemoCourse();
 
    	return;
 
	}
 
 
	state.course =
    	data;
 
    state.loadedFromDatabase =
    	true;
 
 
	updateCourseUI();
 
	await loadModules();
 
}
 
 
/* =====================================================
   DEMO COURSE
=====================================================
 
   This keeps the interface usable while the
   Supabase connection is being configured.
 
===================================================== */
 
function loadDemoCourse() {
 
	state.course = {
 
    	id: "demo-course",
 
    	title:
            "General English",
 
    	description:
            "Build practical English through a structured learning journey designed to help you understand, practise, recall and use the language with confidence.",
 
    	category:
            "English",
 
    	level:
            "A1",
 
    	duration:
        	120,
 
    	lesson_count:
        	8
 
	};
 
 
	state.modules = [
 
    	{
 
        	id: "module-1",
 
        	title:
                "Getting Started",
 
            description:
                "Your first steps in English.",
 
            sort_order:
            	1
 
    	},
 
    	{
 
        	id: "module-2",
 
        	title:
                "Everyday Communication",
 
            description:
                "Language for real situations.",
 
            sort_order:
            	2
 
    	}
 
	];
 
 
	state.lessons = [
 
    	{
 
        	id:
                "lesson-1",
 
        	module_id:
                "module-1",
 
        	title:
                "Introducing Yourself",
 
            description:
                "Learn how to introduce yourself and ask basic questions.",
 
        	duration:
            	15,
 
            sort_order:
            	1
 
    	},
 
    	{
 
        	id:
                "lesson-2",
 
        	module_id:
                "module-1",
 
        	title:
                "Personal Information",
 
            description:
                "Talk about your name, country and basic information.",
 
        	duration:
            	15,
 
            sort_order:
            	2
 
    	},
 
    	{
 
        	id:
                "lesson-3",
 
        	module_id:
                "module-1",
 
        	title:
                "Numbers and Dates",
 
            description:
                "Practise numbers, dates and everyday information.",
 
        	duration:
            	15,
 
            sort_order:
            	3
 
    	},
 
    	{
 
        	id:
                "lesson-4",
 
        	module_id:
                "module-1",
 
        	title:
                "Daily Routines",
 
            description:
                "Talk about everyday activities.",
 
        	duration:
            	15,
 
            sort_order:
            	4
 
    	},
 
    	{
 
        	id:
                "lesson-5",
 
        	module_id:
                "module-2",
 
        	title:
                "At Work",
 
            description:
                "Use useful English in a workplace context.",
 
        	duration:
            	15,
 
            sort_order:
            	1
 
    	},
 
    	{
 
        	id:
                "lesson-6",
 
        	module_id:
                "module-2",
 
        	title:
                "Making Requests",
 
            description:
                "Make simple requests politely.",
 
        	duration:
            	15,
 
            sort_order:
            	2
 
    	},
 
    	{
 
        	id:
                "lesson-7",
 
        	module_id:
                "module-2",
 
        	title:
                "Understanding Questions",
 
            description:
                "Recognise and respond to common questions.",
 
        	duration:
            	15,
 
            sort_order:
            	3
 
    	},
 
    	{
 
        	id:
                "lesson-8",
 
        	module_id:
                "module-2",
 
        	title:
                "Review and Test",
 
            description:
                "Review the material and check your progress.",
 
        	duration:
            	15,
 
            sort_order:
            	4
 
    	}
 
	];
 
 
	updateCourseUI();
 
    renderEverything();
 
}
 
 
/* =====================================================
   MODULES
===================================================== */
 
async function loadModules() {
 
	if (!supabaseClient || !state.courseId) {
 
        renderEverything();
 
    	return;
 
	}
 
 
	const {
    	data,
    	error
	} =
    	await supabaseClient
            .from("modules")
            .select("*")
            .eq("course_id", state.courseId)
            .order("sort_order", {
                ascending: true
        	});
 
 
	if (error) {
 
    	console.error(
            "EduCore modules error:",
        	error
    	);
 
    	state.modules = [];
 
        renderEverything();
 
    	return;
 
	}
 
 
	state.modules =
    	data || [];
 
 
	await loadLessons();
 
}
 
 
/* =====================================================
   LESSONS
===================================================== */
 
async function loadLessons() {
 
	if (
        !supabaseClient ||
        !state.courseId
	) {
 
        renderEverything();
 
    	return;
 
	}
 
 
	/*
   	Primary expected structure:
 
   	content
   	├── id
   	├── module_id
   	├── title
   	├── description
   	├── duration
   	├── sort_order
 
   	The platform treats each content record as
   	a lesson.
	*/
 
 
	const moduleIds =
    	state.modules
            .map(module =>
                module.id
        	)
            .filter(Boolean);
 
 
	if (!moduleIds.length) {
 
    	state.lessons = [];
 
        renderEverything();
 
    	return;
 
	}
 
 
	const {
    	data,
    	error
	} =
    	await supabaseClient
            .from("content")
            .select("*")
            .in("module_id", moduleIds)
            .order("sort_order", {
                ascending: true
        	});
 
 
	if (error) {
 
    	console.error(
            "EduCore lessons/content error:",
        	error
    	);
 
    	state.lessons = [];
 
        renderEverything();
 
    	return;
 
	}
 
 
	state.lessons =
    	(data || []).map(
        	item => ({
 
                ...item,
 
            	title:
                    item.title ||
                    item.name ||
                    "Untitled lesson",
 
                description:
                    item.description ||
                    item.summary ||
                    "",
 
                duration:
                    Number(
                        item.duration ||
                        item.duration_minutes ||
                        0
                	)
 
        	})
    	);
 
 
    state.lessons.sort(
    	(a, b) =>
            Number(a.sort_order || 0) -
            Number(b.sort_order || 0)
	);
 
 
    renderEverything();
 
}
 
 
/* =====================================================
   COURSE UI
===================================================== */
 
function updateCourseUI() {
 
	if (!state.course) {
 
    	return;
 
	}
 
 
	const course =
    	state.course;
 
 
	const title =
    	course.title ||
    	course.name ||
        "Course";
 
 
	const description =
        course.description ||
        course.short_description ||
    	"Continue your learning journey with EduCore.";
 
 
	const category =
        course.category ||
    	course.subject ||
        "Course";
 
 
	const level =
    	course.level ||
        course.cefr_level ||
    	"All levels";
 
 
	const duration =
    	Number(
            course.duration ||
            course.duration_minutes ||
            course.hours * 60 ||
        	0
    	);
 
 
    $("#course-category").textContent =
    	category;
 
 
    $("#course-title").textContent =
    	title;
 
 
    $("#course-description").textContent =
    	description;
 
 
    $("#course-level").textContent =
    	level;
 
 
    $("#course-lesson-count").textContent =
        `${state.lessons.length || course.lesson_count || 0} lessons`;
 
 
    $("#course-duration").textContent =
        formatDuration(duration);
 
 
    $("#top-course-name").textContent =
    	title;
 
}
 
 
/* =====================================================
   PROGRESS
===================================================== */
 
function isLessonCompleted(lesson) {
 
	const id =
    	normalizeId(
        	lesson?.id
    	);
 
	return Boolean(
        state.progress[id]?.completed
	);
 
}
 
 
function getCompletedCount() {
 
	return state.lessons
    	.filter(
        	lesson =>
                isLessonCompleted(lesson)
    	)
    	.length;
 
}
 
 
function getCourseProgress() {
 
	if (!state.lessons.length) {
 
    	return 0;
 
	}
 
 
	return Math.round(
    	(
            getCompletedCount() /
            state.lessons.length
    	) * 100
	);
 
}
 
 
function updateProgressUI() {
 
	const progress =
        getCourseProgress();
 
 
	const completed =
        getCompletedCount();
 
 
    $("#hero-progress").textContent =
        `${progress}%`;
 
 
    $("#top-progress-value").textContent =
        `${progress}%`;
 
 
    $("#progress-dashboard-value").textContent =
        `${progress}%`;
 
 
    $("#stat-completed").textContent =
    	completed;
 
 
    $("#progress-lessons").textContent =
    	completed;
 
 
    $("#stat-streak").textContent =
        calculateStreak();
 
 
    $("#progress-streak").textContent =
        calculateStreak();
 
 
    $("#stat-xp").textContent =
    	completed * 50;
 
 
    $("#progress-xp").textContent =
    	completed * 50;
 
 
	const ring =
        $("#hero-progress-ring");
 
 
	if (ring) {
 
    	const degrees =
        	progress * 3.6;
 
        ring.style.background =
            `conic-gradient(
                var(--green) 0deg,
                var(--green) ${degrees}deg,
                #edf0f2 ${degrees}deg,
                #edf0f2 360deg
        	)`;
 
	}
 
}
 
 
function calculateStreak() {
 
	return Number(
        localStorage.getItem(
            "educore_learning_streak"
    	) || 0
	);
 
}
 
 
/* =====================================================
   RENDER EVERYTHING
===================================================== */
 
function renderEverything() {
 
	updateCourseUI();
 
    renderLearningPath();
 
	renderLearnList();
 
	renderContents();
 
    renderProgressModules();
 
    updateProgressUI();
 
    updateContinueCard();
 
}
 
 
/* =====================================================
   LEARNING PATH
===================================================== */
 
function renderLearningPath() {
 
	const container =
        $("#overview-path");
 
 
	if (!container) {
 
    	return;
 
	}
 
 
	if (!state.modules.length) {
 
        container.innerHTML = `
 
        	<div class="empty-state">
            	Course modules will appear here.
            </div>
 
    	`;
 
    	return;
 
	}
 
 
    container.innerHTML =
    	state.modules
        	.map(
                (module, index) => {
 
                    const lessons =
                        getModuleLessons(
                            module.id
                        );
 
                    const completed =
                        lessons.filter(
                            lesson =>
                                isLessonCompleted(
                                	lesson
                            	)
                        ).length;
 
                    const percent =
                        lessons.length
                            ? Math.round(
                            	completed /
                            	lessons.length *
                            	100
                            )
                            : 0;
 
                    return `
 
                        <div
                            class="path-item ${percent === 100 ? "completed" : ""}"
                        >
 
                            <div class="path-number">
 
                            	${String(index + 1).padStart(2, "0")}
 
                            </div>
 
 
                            <div class="path-info">
 
                            	<strong>
                                    ${escapeHTML(
                                        module.title ||
                                        module.name ||
                                    	`Module ${index + 1}`
                                	)}
                            	</strong>
 
                            	<span>
                                    ${completed}/${lessons.length} lessons completed
                            	</span>
 
                            </div>
 
 
                            <div class="path-progress">
 
                            	<div class="path-progress-track">
 
                                	<div
                                        class="path-progress-fill"
                                        style="width:${percent}%"
                                    ></div>
 
                            	</div>
 
                            </div>
 
                        </div>
 
                	`;
 
            	}
        	)
            .join("");
 
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
 
        container.innerHTML = `
 
        	<div class="empty-state">
            	No lessons are available yet.
            </div>
 
    	`;
 
    	return;
 
	}
 
 
    container.innerHTML =
    	state.lessons
        	.map(
                (lesson, index) => {
 
                    const module =
                        state.modules.find(
                            item =>
                                normalizeId(item.id) ===
                            	normalizeId(
                                    lesson.module_id
                            	)
                        );
 
 
                    const completed =
                        isLessonCompleted(
                            lesson
                        );
 
 
                    return `
 
                        <article
                            class="lesson-large"
                            data-lesson-id="${escapeHTML(
                            	lesson.id
                            )}"
                        >
 
                            <div class="lesson-large-number">
 
                            	${String(index + 1).padStart(2, "0")}
 
                            </div>
 
 
                            <div class="lesson-large-info">
 
                            	<strong>
                                    ${escapeHTML(
                                        lesson.title
                                	)}
                            	</strong>
 
                            	<span>
                                    ${escapeHTML(
                                        module?.title ||
                                        "Lesson"
                                	)}
                                    ${lesson.duration
                                    	? ` • ${lesson.duration} min`
                                    	: ""}
                            	</span>
 
                            </div>
 
 
                            <div class="lesson-large-status">
 
                            	${
                                	completed
                                    	? "Completed"
                                    	: "Start →"
                            	}
 
                            </div>
 
                        </article>
 
                	`;
 
            	}
        	)
            .join("");
 
 
    $$(".lesson-large").forEach(
    	element => {
 
            element.addEventListener(
                "click",
            	() => {
 
                    openLesson(
                        element.dataset.lessonId
                	);
 
            	}
        	);
 
    	}
	);
 
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
 
        container.innerHTML = `
 
        	<div class="empty-state">
            	Course contents will appear here.
            </div>
 
    	`;
 
    	return;
 
	}
 
 
    container.innerHTML =
    	state.modules
        	.map(
                (module, moduleIndex) => {
 
                    const lessons =
                        getModuleLessons(
                            module.id
                        );
 
 
                    return `
 
                        <div
                            class="content-module"
                            data-module-id="${escapeHTML(
                            	module.id
                            )}"
                        >
 
                            <button
                                class="content-module-header"
                                type="button"
                            >
 
                            	<div class="content-module-number">
 
                                	${String(
                                        moduleIndex + 1
                                    ).padStart(2, "0")}
 
                            	</div>
 
 
                            	<div class="content-module-info">
 
                                    <strong>
                                        ${escapeHTML(
                                            module.title ||
                                            module.name ||
                                            `Module ${moduleIndex + 1}`
                                    	)}
                                    </strong>
 
                                    <span>
                                        ${lessons.length} lessons
                                    </span>
 
                            	</div>
 
 
                            	<div class="content-module-arrow">
                                	↓
                            	</div>
 
                            </button>
 
 
                            <div class="module-lessons">
 
                            	${
                                    lessons.length
                                    	? lessons
                                            .map(
                                                (lesson, index) => `
 
                                                    <div
                                                        class="content-lesson"
                                                        data-lesson-id="${escapeHTML(
                                                            lesson.id
                                                        )}"
                                                    >
 
                                                        <div class="content-lesson-number">
 
                                                            ${String(
                                                                index + 1
                                                            ).padStart(2, "0")}
 
                                                        </div>
 
 
                                                        <div class="content-lesson-info">
 
                                                            <strong>
                                                                ${escapeHTML(
                                                                    lesson.title
                                                                )}
                                                            </strong>
 
                                                            <span>
                                                                ${
                                                                    lesson.duration
                                                                        ? `${lesson.duration} min`
                                                                        : "Lesson"
                                                                }
                                                            </span>
 
                                                        </div>
 
 
                                                        <div class="content-lesson-status">
 
                                                            ${
                                                                isLessonCompleted(
                                                                    lesson
                                                                )
                                                                    ? "✓"
                                                                    : "→"
                                                            }
 
                                                        </div>
 
                                                    </div>
 
                                                `
                                        	)
                                            .join("")
                                    	: `
                                            <div class="empty-state">
                                                No lessons in this module yet.
                                            </div>
                                    	`
                            	}
 
                            </div>
 
                        </div>
 
                	`;
 
            	}
        	)
            .join("");
 
 
    $$(".content-module-header").forEach(
    	header => {
 
            header.addEventListener(
                "click",
            	() => {
 
                    const module =
                        header.closest(
                            ".content-module"
                        );
 
                    module.classList.toggle(
                        "open"
                	);
 
            	}
        	);
 
    	}
	);
 
 
    $$(".content-lesson").forEach(
    	lesson => {
 
            lesson.addEventListener(
                "click",
            	event => {
 
                    event.stopPropagation();
 
                    openLesson(
                        lesson.dataset.lessonId
                	);
 
            	}
        	);
 
    	}
	);
 
}
 
 
/* =====================================================
   PROGRESS MODULES
===================================================== */
 
function renderProgressModules() {
 
	const container =
        $("#progress-module-list");
 
 
	if (!container) {
 
    	return;
 
	}
 
 
    container.innerHTML =
    	state.modules
        	.map(
                (module, index) => {
 
                    const lessons =
                        getModuleLessons(
                            module.id
                        );
 
                    const completed =
                        lessons.filter(
                            isLessonCompleted
                        ).length;
 
                    const percent =
                        lessons.length
                            ? Math.round(
                            	completed /
                            	lessons.length *
                            	100
                            )
                            : 0;
 
 
                    return `
 
                        <div
                            class="path-item ${percent === 100 ? "completed" : ""}"
                        >
 
                            <div class="path-number">
 
                            	${String(
                                	index + 1
                            	).padStart(2, "0")}
 
                            </div>
 
 
                            <div class="path-info">
 
                            	<strong>
                                    ${escapeHTML(
                                        module.title ||
                                        module.name ||
                                    	`Module ${index + 1}`
                                	)}
                            	</strong>
 
                            	<span>
                                	${percent}% complete
                            	</span>
 
                            </div>
 
 
                            <div class="path-progress">
 
                            	<div class="path-progress-track">
 
                                	<div
                                        class="path-progress-fill"
                                        style="width:${percent}%"
                                    ></div>
 
                            	</div>
 
                            </div>
 
                        </div>
 
                	`;
 
            	}
        	)
            .join("");
 
}
 
 
/* =====================================================
   MODULE HELPERS
===================================================== */
 
function getModuleLessons(moduleId) {
 
	return state.lessons
    	.filter(
        	lesson =>
                normalizeId(
                    lesson.module_id
            	) ===
                normalizeId(moduleId)
    	)
    	.sort(
        	(a, b) =>
                Number(a.sort_order || 0) -
                Number(b.sort_order || 0)
    	);
 
}
 
 
/* =====================================================
   CONTINUE CARD
===================================================== */
 
function getNextLesson() {
 
	const unfinished =
        state.lessons.find(
        	lesson =>
                !isLessonCompleted(
                    lesson
            	)
    	);
 
 
	return unfinished ||
        state.lessons[0] ||
    	null;
 
}
 
 
function updateContinueCard() {
 
	const lesson =
        getNextLesson();
 
 
	if (!lesson) {
 
    	return;
 
	}
 
 
	const index =
        state.lessons.findIndex(
        	item =>
                normalizeId(item.id) ===
                normalizeId(lesson.id)
    	);
 
 
	const module =
        state.modules.find(
        	item =>
                normalizeId(item.id) ===
                normalizeId(
                    lesson.module_id
            	)
    	);
 
 
    $("#continue-number").textContent =
    	String(index + 1).padStart(2, "0");
 
 
    $("#continue-module").textContent =
    	module?.title ||
        "LESSON";
 
 
    $("#continue-lesson").textContent =
    	lesson.title ||
    	"Continue learning";
 
 
    $("#continue-description").textContent =
        lesson.description ||
    	"Continue your learning journey.";
 
 
    $("#continue-button-text").textContent =
        isLessonCompleted(lesson)
        	? "Review lesson"
        	: "Continue learning";
 
 
    $("#continue-card-button").onclick =
    	() =>
            openLesson(
                lesson.id
        	);
 
 
    $("#continue-button").onclick =
    	() =>
            openLesson(
                lesson.id
        	);
 
}
 
 
/* =====================================================
   LESSON RUNNER
===================================================== */
 
function openLesson(lessonId) {
 
	const index =
        state.lessons.findIndex(
        	lesson =>
                normalizeId(lesson.id) ===
                normalizeId(lessonId)
    	);
 
 
	if (index === -1) {
 
    	return;
 
	}
 
 
    state.currentLessonIndex =
    	index;
 
 
    state.currentLesson =
        state.lessons[index];
 
 
	renderLesson();
 
	showScreen(
        "lesson"
	);
 
}
 
 
function renderLesson() {
 
	const lesson =
        state.currentLesson;
 
 
	if (!lesson) {
 
    	return;
 
	}
 
 
	const module =
        state.modules.find(
        	item =>
                normalizeId(item.id) ===
                normalizeId(
                    lesson.module_id
            	)
    	);
 
 
    $("#lesson-module-name").textContent =
    	module?.title ||
        "LESSON";
 
 
    $("#lesson-position-number").textContent =
        state.currentLessonIndex + 1;
 
 
	const progress =
        state.lessons.length
        	? (
                state.currentLessonIndex /
                state.lessons.length
        	) * 100
        	: 0;
 
 
    $("#lesson-progress-fill").style.width =
        `${progress}%`;
 
 
	const body =
        $("#lesson-body-content");
 
 
	body.innerHTML = `
 
    	<div class="lesson-placeholder">
 
        	<span class="eyebrow">
                ${escapeHTML(
                    module?.title ||
                    "LESSON"
            	)}
            </span>
 
        	<h1 class="lesson-content-title">
                ${escapeHTML(
                    lesson.title ||
                    "Untitled lesson"
            	)}
            </h1>
 
        	<p class="lesson-content-description">
                ${escapeHTML(
                    lesson.description ||
                    "Begin this lesson and work through the learning activities."
            	)}
        	</p>
 
        	<div
                style="
                    margin-top:28px;
                    padding:20px;
                    border:1px solid var(--border);
                    border-radius:16px;
                    background:var(--surface-soft);
            	"
        	>
 
                <strong style="font-size:13px;">
                    Your learning journey
                </strong>
 
            	<p
                    style="
                        margin-top:8px;
                        color:var(--text-muted);
                        font-size:12px;
                        line-height:1.7;
                    "
            	>
                    This lesson area is ready for the structured
                    EduCore learning experience: Understand → See →
                    Hear → Practice → Recall → Speak → Test → Review.
                </p>
 
            </div>
 
    	</div>
 
	`;
 
 
    $("#lesson-footer-status").textContent =
        isLessonCompleted(lesson)
        	? "Completed"
        	: lesson.duration
            	? `${lesson.duration} min`
            	: "Ready";
 
 
    $("#previous-lesson").disabled =
        state.currentLessonIndex <= 0;
 
 
    $("#next-lesson").textContent =
        state.currentLessonIndex >=
        state.lessons.length - 1
        	? "Finish ✓"
        	: "Next →";
 
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
 
 
	state.progress[
        normalizeId(lesson.id)
	] = {
 
    	completed:
        	true,
 
    	completed_at:
        	new Date().toISOString()
 
	};
 
 
    saveLocalProgress();
 
 
	if (
    	supabaseClient &&
    	state.user?.id
	) {
 
    	/*
       	This is intentionally prepared for the
       	existing EduCore progress table.
 
       	If your actual progress table has a
       	different name/column structure, keep
       	the local progress behavior and connect
       	this section to that schema later.
    	*/
 
    	try {
 
        	await supabaseClient
                .from("progress")
                .upsert({
 
                    user_id:
                        state.user.id,
 
                    course_id:
                        state.courseId,
 
                    lesson_id:
                        lesson.id,
 
                    completed:
                        true,
 
                    completed_at:
                        new Date().toISOString()
 
            	});
 
    	} catch (error) {
 
            console.warn(
                "Progress sync skipped:",
            	error
        	);
 
    	}
 
	}
 
 
    updateProgressUI();
 
    renderEverything();
 
}
 
 
/* =====================================================
   LOCAL PROGRESS
===================================================== */
 
function progressStorageKey() {
 
	return `educore_progress_${
    	state.courseId || "default"
	}`;
 
}
 
 
function loadLocalProgress() {
 
	try {
 
    	const raw =
            localStorage.getItem(
                progressStorageKey()
        	);
 
 
    	state.progress =
        	raw
            	? JSON.parse(raw)
            	: {};
 
	} catch {
 
    	state.progress = {};
 
	}
 
}
 
 
function saveLocalProgress() {
 
	try {
 
        localStorage.setItem(
            progressStorageKey(),
            JSON.stringify(
                state.progress
        	)
    	);
 
	} catch {
 
    	/* Ignore storage errors */
 
	}
 
}
 
 
/* =====================================================
   NAVIGATION
===================================================== */
 
function showScreen(screenName) {
 
	const screen =
        $(`#${screenName}-screen`);
 
 
	if (!screen) {
 
    	return;
 
	}
 
 
    $$(".screen").forEach(
    	item =>
            item.classList.remove(
                "active"
        	)
	);
 
 
    screen.classList.add(
        "active"
	);
 
 
    state.currentScreen =
    	screenName;
 
 
    updateNavigationState(
    	screenName
	);
 
 
	closeMoreMenu();
 
 
	window.scrollTo({
    	top: 0,
    	behavior: "smooth"
	});
 
}
 
 
function updateNavigationState(screenName) {
 
    $$(".rail-button[data-screen], .bottom-nav-button[data-screen]")
    	.forEach(
        	button => {
 
                button.classList.toggle(
                    "active",
                    button.dataset.screen ===
                    screenName
            	);
 
        	}
    	);
 
}
 
 
/* =====================================================
   MORE MENU
===================================================== */
 
function openMoreMenu() {
 
	const menu =
        $("#more-menu");
 
 
	if (!menu) {
 
    	return;
 
	}
 
 
	const desktopButton =
        $("#more-button");
 
 
	const mobileButton =
        $("#mobile-more-button");
 
 
	const activeButton =
        window.innerWidth <= 800
        	? mobileButton
        	: desktopButton;
 
 
	if (
        window.innerWidth > 800 &&
    	desktopButton
	) {
 
    	const rect =
            desktopButton.getBoundingClientRect();
 
 
    	menu.style.top =
            `${rect.bottom + 8}px`;
 
 
        menu.style.right =
            `${window.innerWidth - rect.right}px`;
 
	}
 
 
    menu.classList.add(
        "open"
	);
 
 
	menu.setAttribute(
        "aria-hidden",
        "false"
	);
 
 
	if (desktopButton) {
 
        desktopButton.setAttribute(
            "aria-expanded",
            "true"
    	);
 
	}
 
 
	if (activeButton) {
 
        activeButton.classList.add(
            "active"
    	);
 
	}
 
}
 
 
function closeMoreMenu() {
 
	const menu =
        $("#more-menu");
 
 
	if (!menu) {
 
    	return;
 
	}
 
 
    menu.classList.remove(
        "open"
	);
 
 
	menu.setAttribute(
        "aria-hidden",
        "true"
	);
 
 
	const desktopButton =
        $("#more-button");
 
 
	if (desktopButton) {
 
        desktopButton.setAttribute(
            "aria-expanded",
            "false"
    	);
 
	}
 
 
    $("#mobile-more-button")
        ?.classList.remove(
            "active"
    	);
 
}
 
 
function toggleMoreMenu() {
 
	const menu =
        $("#more-menu");
 
 
	if (
        menu?.classList.contains(
            "open"
    	)
	) {
 
        closeMoreMenu();
 
	} else {
 
        openMoreMenu();
 
	}
 
}
 
 
/* =====================================================
   EVENT SETUP
===================================================== */
 
function setupNavigation() {
 
    $$("[data-screen]")
    	.forEach(
        	button => {
 
                button.addEventListener(
                    "click",
                	() => {
 
                        const screen =
                            button.dataset.screen;
 
 
                        if (
                            screen &&
                            $(`#${screen}-screen`)
                        ) {
 
                            showScreen(
                            	screen
                            );
 
                        }
 
                	}
            	);
 
        	}
    	);
 
 
    $("#brand-button")
        ?.addEventListener(
            "click",
        	() =>
                showScreen(
                    "overview"
            	)
    	);
 
 
    $("#mobile-brand-button")
        ?.addEventListener(
            "click",
        	() =>
                showScreen(
                    "overview"
            	)
    	);
 
 
    $("#profile-button")
        ?.addEventListener(
            "click",
        	() =>
                showScreen(
                    "profile"
            	)
    	);
 
 
    $("#top-profile-button")
        ?.addEventListener(
            "click",
        	() =>
                showScreen(
                    "profile"
            	)
    	);
 
 
    $("#more-button")
        ?.addEventListener(
            "click",
        	event => {
 
                event.stopPropagation();
 
                toggleMoreMenu();
 
        	}
    	);
 
 
    $("#mobile-more-button")
        ?.addEventListener(
            "click",
        	event => {
 
                event.stopPropagation();
 
                toggleMoreMenu();
 
        	}
    	);
 
 
    document.addEventListener(
        "click",
    	event => {
 
        	const menu =
                $("#more-menu");
 
 
        	if (
            	menu &&
                !menu.contains(
                    event.target
            	) &&
                !event.target.closest(
                    "#more-button"
            	) &&
                !event.target.closest(
                    "#mobile-more-button"
            	)
        	) {
 
                closeMoreMenu();
 
        	}
 
    	}
	);
 
}
 
 
function setupLessonControls() {
 
    $("#lesson-back")
        ?.addEventListener(
            "click",
        	() => {
 
                showScreen(
                    "learn"
            	);
 
        	}
    	);
 
 
    $("#previous-lesson")
        ?.addEventListener(
            "click",
        	() => {
 
            	if (
                    state.currentLessonIndex <= 0
            	) {
 
                    return;
 
            	}
 
 
                openLesson(
                    state.lessons[
                        state.currentLessonIndex - 1
                    ].id
            	);
 
        	}
    	);
 
 
    $("#next-lesson")
        ?.addEventListener(
            "click",
        	async () => {
 
            	await completeCurrentLesson();
 
 
            	if (
                    state.currentLessonIndex <
                    state.lessons.length - 1
            	) {
 
                    openLesson(
                        state.lessons[
                            state.currentLessonIndex + 1
                        ].id
                	);
 
            	} else {
 
                    showScreen(
                        "overview"
                	);
 
            	}
 
        	}
    	);
 
 
    $("#lesson-save")
        ?.addEventListener(
            "click",
        	() => {
 
            	const lesson =
                    state.currentLesson;
 
 
            	if (!lesson) {
 
                    return;
 
            	}
 
 
            	const key =
                    `educore_saved_${lesson.id}`;
 
 
            	const saved =
                    localStorage.getItem(
                        key
                	);
 
 
            	if (saved) {
 
                    localStorage.removeItem(
                        key
                	);
 
                    $("#lesson-save").textContent =
                        "Save";
 
            	} else {
 
                    localStorage.setItem(
                        key,
                        "true"
                	);
 
                    $("#lesson-save").textContent =
                        "Saved ✓";
 
            	}
 
        	}
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
 
                closeMoreMenu();
 
 
            	/*
                   Return to the public course catalogue.
               	If the public homepage is located elsewhere,
                   change only this path.
            	*/
 
                window.location.href =
                    "../index.html";
 
        	}
    	);
 
}
 
 
/* =====================================================
   BACK BUTTON
===================================================== */
 
function setupBrowserBack() {
 
    window.addEventListener(
        "popstate",
    	event => {
 
        	if (
                state.currentScreen !==
                "overview"
        	) {
 
                showScreen(
                    "overview"
            	);
 
                return;
 
        	}
 
        	/*
           	Allow the browser to perform its
           	normal history behavior when already
           	at the main course screen.
        	*/
 
    	}
	);
 
}
 
 
/* =====================================================
   INITIALIZE
===================================================== */
 
async function init() {
 
	try {
 
    	showLoading();
 
 
        setupNavigation();
 
        setupLessonControls();
 
        setupExitCourse();
 
        setupBrowserBack();
 
 
        loadLocalProgress();
 
    	await loadUser();
 
    	await loadCourse();
 
 
    	hideLoading();
 
 
	} catch (error) {
 
    	console.error(
            "EduCore initialization error:",
        	error
    	);
 
 
    	hideLoading();
 
	}
 
}
 
 
/* =====================================================
   START
===================================================== */
 
if (
    document.readyState ===
    "loading"
) {
 
    document.addEventListener(
        "DOMContentLoaded",
    	init
	);
 
} else {
 
	init();
 
}

