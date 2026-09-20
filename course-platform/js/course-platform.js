/* =====================================================
   EDUCORE COURSE PLATFORM
===================================================== */
 
"use strict";
 
 
/* =====================================================
   SUPABASE
===================================================== */
 
/*
	IMPORTANT:
 
	Use the SAME Supabase URL and ANON KEY
	already used by the rest of EduCore.
 
	Replace these two values with your existing
	project credentials.
*/
 
const SUPABASE_URL =
    "YOUR_SUPABASE_URL";
 
const SUPABASE_ANON_KEY =
    "YOUR_SUPABASE_ANON_KEY";
 
 
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
 
	currentLesson: null,
 
    currentLessonIndex: 0,
 
	progress: {},
 
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
    	return parts[0].slice(0, 2).toUpperCase();
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
 
 
    $("#top-student-name").textContent =
    	name;
 
 
    $("#rail-avatar").textContent =
    	initials;
 
 
    $("#top-avatar").textContent =
    	initials;
 
 
    $("#profile-large-avatar").textContent =
    	initials;
 
 
    $("#profile-name").textContent =
    	name;
 
 
    $("#profile-email").textContent =
        state.user.email || "—";
 
 
	return state.user;
 
}
 
 
/* =====================================================
   COURSE
===================================================== */
 
async function loadCourse() {
 
	if (!state.courseId) {
 
    	console.warn(
        	"No course ID was supplied."
    	);
 
        renderNoCourse();
 
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
            "Course loading error:",
        	error
    	);
 
        renderCourseError();
 
    	return;
 
	}
 
 
	state.course =
    	data;
 
 
	if (!state.course) {
 
        renderNoCourse();
 
    	return;
 
	}
 
 
	renderCourse();
 
}
 
 
/* =====================================================
   COURSE RENDER
===================================================== */
 
function renderCourse() {
 
	const course =
    	state.course;
 
 
	const title =
    	course.title ||
    	course.name ||
    	"Untitled course";
 
 
	const description =
        course.description ||
        course.short_description ||
    	"Continue your learning journey with EduCore.";
 
 
	const category =
        course.category ||
        course.course_category ||
        "COURSE";
 
 
	const level =
    	course.level ||
        course.course_level ||
    	"All levels";
 
 
	const duration =
        course.duration_minutes ||
        course.duration ||
    	0;
 
 
    $("#course-category").textContent =
    	category;
 
 
    $("#course-title").textContent =
    	title;
 
 
    $("#course-description").textContent =
    	description;
 
 
    $("#course-level").textContent =
    	level;
 
 
    $("#course-duration").textContent =
        formatDuration(duration);
 
 
    $("#top-course-name").textContent =
    	title;
 
 
    updateLessonCount();
 
}
 
 
/* =====================================================
   MODULES
===================================================== */
 
async function loadModules() {
 
	if (!state.courseId) {
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
            "Module loading error:",
        	error
    	);
 
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
 
	if (!state.courseId) {
    	return;
	}
 
 
	const moduleIds =
        state.modules.map(
        	module => module.id
    	);
 
 
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
            .from("lessons")
            .select("*")
            .in("module_id", moduleIds)
            .order("sort_order", {
                ascending: true
        	});
 
 
	if (error) {
 
    	console.warn(
            "Lessons table could not be loaded:",
        	error
    	);
 
    	/*
        	The current project may still use the
        	older content structure.
 
        	We leave the lesson list empty rather
        	than inventing course content.
    	*/
 
    	state.lessons = [];
 
        renderEverything();
 
    	return;
 
	}
 
 
	state.lessons =
    	data || [];
 
 
    renderEverything();
 
}
 
 
/* =====================================================
   LESSON COUNT
===================================================== */
 
function updateLessonCount() {
 
	const count =
        state.lessons.length;
 
 
    $("#course-lesson-count").textContent =
    	`${count} ${count === 1 ? "lesson" : "lessons"}`;
 
 
    $("#stat-completed").textContent =
        countCompleted();
 
 
    $("#progress-lessons").textContent =
        countCompleted();
 
}
 
 
/* =====================================================
   PROGRESS
===================================================== */
 
function countCompleted() {
 
	return state.lessons.filter(
    	lesson => {
 
        	const value =
                state.progress[lesson.id];
 
        	return (
                value?.completed === true ||
            	value === 100
        	);
 
    	}
	).length;
 
}
 
 
function calculateProgress() {
 
	const total =
        state.lessons.length;
 
 
	if (!total) {
    	return 0;
	}
 
 
	const completed =
        countCompleted();
 
 
	return Math.round(
    	(completed / total) * 100
	);
 
}
 
 
function renderProgress() {
 
	const progress =
        calculateProgress();
 
 
    $("#top-progress-value").textContent =
        `${progress}%`;
 
 
    $("#hero-progress-value").textContent =
        `${progress}%`;
 
 
    $("#progress-dashboard-value").textContent =
        `${progress}%`;
 
 
	const ring =
        $("#hero-progress");
 
 
	if (ring) {
 
    	const degrees =
        	progress * 3.6;
 
        ring.style.background =
            `conic-gradient(
                var(--purple) ${degrees}deg,
                #eeecf3 ${degrees}deg
        	)`;
 
	}
 
 
    $("#progress-streak").textContent =
    	"0";
 
 
    $("#stat-streak").textContent =
    	"0";
 
 
    $("#stat-xp").textContent =
    	String(
            countCompleted() * 10
    	);
 
 
    $("#progress-xp").textContent =
    	String(
            countCompleted() * 10
    	);
 
 
    $("#stat-completed").textContent =
        countCompleted();
 
 
    $("#progress-lessons").textContent =
        countCompleted();
 
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
 
 
	return (
        value?.completed === true ||
    	value === 100
	);
 
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
 
 
	return incomplete ||
    	state.lessons[
            state.lessons.length - 1
    	];
 
}
 
 
/* =====================================================
   MODULE LOOKUP
===================================================== */
 
function getModuleForLesson(lesson) {
 
	if (!lesson) {
    	return null;
	}
 
 
	return state.modules.find(
    	module =>
        	module.id === lesson.module_id
	) || null;
 
}
 
 
/* =====================================================
   CONTINUE CARD
===================================================== */
 
function renderContinue() {
 
	const lesson =
        getContinueLesson();
 
 
	if (!lesson) {
 
        $("#continue-lesson").textContent =
        	"Your course is ready";
 
 
        $("#continue-description").textContent =
        	"Your first lesson will appear here.";
 
 
    	return;
 
	}
 
 
	const module =
        getModuleForLesson(lesson);
 
 
	const index =
        state.lessons.indexOf(lesson);
 
 
    $("#continue-number").textContent =
    	String(index + 1)
            .padStart(2, "0");
 
 
    $("#continue-module").textContent =
    	module?.title ||
    	"Course lesson";
 
 
    $("#continue-lesson").textContent =
    	lesson.title ||
    	lesson.name ||
        "Lesson";
 
 
    $("#continue-description").textContent =
        lesson.description ||
    	"Continue your learning journey.";
 
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
                            lesson.module_id === module.id
                	);
 
 
            	const completed =
                    moduleLessons.filter(
                        lesson =>
                            lessonCompleted(lesson)
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
                        class="path-item ${percentage === 100 ? "completed" : ""}"
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
                                ${moduleLessons.length}
                                ${moduleLessons.length === 1 ? "lesson" : "lessons"}
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
 
 
            	return `
 
                    <article
                        class="lesson-large ${completed ? "completed" : ""}"
                        data-lesson-id="${escapeHTML(lesson.id)}"
                    >
 
                        <div class="lesson-large-number">
 
                            ${String(index + 1).padStart(2, "0")}
 
                        </div>
 
 
                        <div class="lesson-large-info">
 
                            <strong>
 
                            	${escapeHTML(
                                    lesson.title ||
                                	lesson.name ||
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
                            lesson.module_id === module.id
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
                                        module.name ||
                                    	`Module ${moduleIndex + 1}`
                                	)}
 
                            	</strong>
 
 
                            	<span>
 
                                    ${moduleLessons.length}
                                    ${moduleLessons.length === 1 ? "lesson" : "lessons"}
 
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
                                        data-lesson-id="${escapeHTML(lesson.id)}"
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
                                                    lesson.name ||
                                                    `Lesson ${lessonIndex + 1}`
                                                )}
 
                                            </strong>
 
                                            <span>
                                                ${lessonCompleted(lesson) ? "Completed" : "Not started"}
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
 
}
 
 
function renderLessonPlayer() {
 
	const lesson =
        state.currentLesson;
 
 
	if (!lesson) {
    	return;
	}
 
 
	const module =
        getModuleForLesson(lesson);
 
 
    $("#lesson-module-name").textContent =
    	module?.title ||
        "Course";
 
 
    $("#lesson-position-number").textContent =
        state.currentLessonIndex + 1;
 
 
    $("#lesson-footer-status").textContent =
        lessonCompleted(lesson)
        	? "Completed"
        	: "In progress";
 
 
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
 
 
    $("#lesson-progress-fill").style.width =
        `${progress}%`;
 
 
	const previous =
        $("#previous-lesson");
 
 
	const next =
        $("#next-lesson");
 
 
	previous.disabled =
        state.currentLessonIndex <= 0;
 
 
	next.textContent =
        state.currentLessonIndex >=
        state.lessons.length - 1
        	? "Complete ✓"
        	: "Next →";
 
}
 
 
/* =====================================================
   LESSON CONTENT
===================================================== */
 
/*
	This is the future-proof part of EduCore.
 
	Supabase can provide different content blocks.
 
	Supported renderer types:
 
    	text
    	rich_text
    	image
    	audio
    	video
    	exercise
    	quiz
    	ai
    	speaking
    	html
 
	A lesson can contain multiple blocks.
*/
 
async function loadLessonContent(lesson) {
 
	const container =
        $("#lesson-body");
 
 
    container.innerHTML = `
 
    	<div class="lesson-loading">
 
            <span>
                Loading lesson...
            </span>
 
    	</div>
 
	`;
 
 
	/*
    	We intentionally check several possible
    	content structures so the platform can
    	evolve without redesigning the player.
	*/
 
 
	let content =
    	lesson.content ||
        lesson.sections ||
    	lesson.blocks ||
    	null;
 
 
	if (typeof content === "string") {
 
    	try {
 
        	content =
                JSON.parse(content);
 
    	} catch {
 
        	content = [
            	{
                    type: "text",
                    content
            	}
        	];
 
    	}
 
	}
 
 
	if (Array.isArray(content) &&
        content.length) {
 
        renderContentBlocks(content);
 
    	return;
 
	}
 
 
	/*
    	Future Supabase content table.
 
    	Expected relationship:
 
        lesson_content.lesson_id
        lesson_content.sort_order
        lesson_content.type
        lesson_content.content
        lesson_content.media_url
        lesson_content.settings
 
	*/
 
	try {
 
    	const {
        	data,
        	error
    	} =
        	await supabaseClient
                .from("lesson_content")
                .select("*")
                .eq("lesson_id", lesson.id)
                .order("sort_order", {
                    ascending: true
            	});
 
 
    	if (!error && data?.length) {
 
            renderContentBlocks(data);
 
        	return;
 
    	}
 
	} catch (error) {
 
    	console.warn(
            "Lesson content table not available yet:",
        	error
    	);
 
	}
 
 
	/*
    	Until content is connected, show the
    	lesson's basic information rather than
    	fake course material.
	*/
 
    renderFallbackLesson(lesson);
 
}
 
 
/* =====================================================
   CONTENT BLOCK RENDERER
===================================================== */
 
function renderContentBlocks(blocks) {
 
	const container =
        $("#lesson-body");
 
 
    container.innerHTML =
    	blocks.map(
        	block =>
                renderContentBlock(block)
        ).join("");
 
}
 
 
/* =====================================================
   INDIVIDUAL CONTENT TYPES
===================================================== */
 
function renderContentBlock(block) {
 
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
 
 
	const media =
        block.media_url ||
    	block.url ||
    	block.file_url ||
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
                        src="${escapeHTML(media || content)}"
                        alt="${escapeHTML(block.alt || "")}"
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
                            src="${escapeHTML(media)}"
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
                            src="${escapeHTML(media)}"
                        >
 
                    </video>
 
                </div>
 
        	`;
 
 
    	case "exercise":
 
        	return `
 
                <div class="lesson-activity content-block">
 
                    <strong>
                        Practice
                    </strong>
 
                    <p>
                        ${content}
                    </p>
 
                    <button
                        class="primary-button"
                        type="button"
                        data-action="exercise"
                    >
                        Start exercise
                    </button>
 
                </div>
 
        	`;
 
 
    	case "quiz":
 
        	return `
 
                <div class="lesson-activity content-block">
 
                    <strong>
                        Check your understanding
                    </strong>
 
                    <p>
                        ${content}
                    </p>
 
                    <button
                        class="primary-button"
                        type="button"
                        data-action="quiz"
                    >
                        Start quiz
                    </button>
 
                </div>
 
        	`;
 
 
    	case "ai":
 
    	case "ai_interaction":
 
        	return `
 
                <div class="lesson-activity content-block">
 
                    <strong>
                        AI Learning Activity
                    </strong>
 
                    <p>
                        ${content}
                    </p>
 
                    <button
                        class="primary-button"
                        type="button"
                        data-action="ai"
                    >
                        Start AI activity
                    </button>
 
                </div>
 
        	`;
 
 
    	case "speaking":
 
    	case "speaking_activity":
 
        	return `
 
                <div class="lesson-activity content-block">
 
                    <strong>
                        Speaking practice
                    </strong>
 
                    <p>
                        ${content}
                    </p>
 
                    <button
                        class="primary-button"
                        type="button"
                        data-action="speaking"
                    >
                        Start speaking
                    </button>
 
                </div>
 
        	`;
 
 
    	case "html":
 
        	return `
 
                <div class="content-block">
 
                    ${content}
 
                </div>
 
        	`;
 
 
    	default:
 
        	return `
 
                <div class="content-block">
 
                    ${content}
 
                </div>
 
        	`;
 
	}
 
}
 
 
/* =====================================================
   FALLBACK LESSON
===================================================== */
 
function renderFallbackLesson(lesson) {
 
	const container =
        $("#lesson-body");
 
 
    container.innerHTML = `
 
    	<span class="eyebrow">
        	LESSON
    	</span>
 
    	<h1>
            ${escapeHTML(
                lesson.title ||
                lesson.name ||
                "Lesson"
        	)}
    	</h1>
 
    	<p>
        	${
                escapeHTML(
                    lesson.description ||
                    "This lesson is ready for content."
            	)
        	}
    	</p>
 
    	<div class="lesson-activity">
 
            <strong>
            	Your learning content will appear here
            </strong>
 
        	<p>
            	This lesson player is connected to the
            	course structure. Text, audio, video,
                exercises, quizzes and AI activities
            	can be loaded from Supabase.
        	</p>
 
    	</div>
 
	`;
 
}
 
 
/* =====================================================
   COURSE ERRORS
===================================================== */
 
function renderNoCourse() {
 
    $("#course-title").textContent =
    	"Course not selected";
 
 
    $("#course-description").textContent =
    	"No course was selected for this learning session.";
 
 
    $("#continue-lesson").textContent =
    	"Select a course to begin";
 
 
	hideLoading();
 
}
 
 
function renderCourseError() {
 
    $("#course-title").textContent =
    	"Unable to load course";
 
 
    $("#course-description").textContent =
    	"There was a problem loading this course from Supabase.";
 
 
	hideLoading();
 
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
                Modules will appear here when they are added.
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
                Lessons will appear here when the course is published.
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
 
    updateLessonCount();
 
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
 
                    openLesson(previous.id);
 
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
 
                openLesson(next.id);
 
        	}
    	);
 
 
    $("#lesson-save")
        ?.addEventListener(
            "click",
        	() => {
 
                toggleSaveCurrentLesson();
 
        	}
    	);
 
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
 
    	completed: true
 
	};
 
 
	renderProgress();
 
	renderContinue();
 
	renderLearnList();
 
	renderContents();
 
 
	/*
    	This is intentionally prepared for the
    	eventual student_progress table.
 
    	We can connect the exact schema once the
    	student progress table is finalized.
	*/
 
	if (!state.user) {
    	return;
	}
 
 
	try {
 
    	await supabaseClient
            .from("student_progress")
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
 
        	}, {
 
                onConflict:
                    "user_id,lesson_id"
 
        	});
 
	} catch (error) {
 
    	console.warn(
            "Progress could not be saved yet:",
        	error
    	);
 
	}
 
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
 
        $("#lesson-save").textContent =
        	"♡";
 
	} else {
 
        state.savedLessons.add(
        	lesson.id
    	);
 
        $("#lesson-save").textContent =
        	"♥";
 
	}
 
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
 
 
            	/*
                    The student page will eventually
                    become the proper destination.
            	*/
 
            	const destination =
                    "../student.html";
 
 
                window.location.href =
                    destination;
 
        	}
    	);
 
}
 
 
/* =====================================================
   APP INITIALIZATION
===================================================== */
 
async function init() {
 
	showLoading();
 
 
	state.courseId =
    	getCourseId();
 
 
	setupNavigation();
 
	setupMoreMenu();
 
    setupLessonNavigation();
 
    setupContinueButtons();
 
	setupExitCourse();
 
 
	try {
 
    	await loadUser();
 
    	await loadCourse();
 
    	await loadModules();
 
	} catch (error) {
 
    	console.error(
            "EduCore initialization error:",
        	error
    	);
 
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

