 
/* =========================================================
   EDUCORE
   COURSE CONTENT / STUDENT LEARNING PLATFORM
   ========================================================= */
 
/* =========================================================
   SUPABASE CONFIGURATION
   ========================================================= */
 
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
 
const supabaseClient = window.supabase.createClient(
	SUPABASE_URL,
	SUPABASE_ANON_KEY
);
 
 
/* =========================================================
   GLOBAL STATE
   ========================================================= */
 
const state = {
	user: null,
	profile: null,
 
	course: null,
	modules: [],
	lessons: [],
 
	progress: {},
	currentLesson: null,
	currentLessonIndex: -1,
 
	currentScreen: "overview",
 
	savedLessons: new Set(),
 
	loading: true
};
 
 
/* =========================================================
   HELPERS
   ========================================================= */
 
const $ = (selector) => document.querySelector(selector);
 
const $$ = (selector) => document.querySelectorAll(selector);
 
 
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
 
	const parts = String(name)
    	.trim()
    	.split(/\s+/)
    	.filter(Boolean);
 
	if (parts.length === 1) {
    	return parts[0].charAt(0).toUpperCase();
	}
 
	return (
    	parts[0].charAt(0) +
    	parts[parts.length - 1].charAt(0)
	).toUpperCase();
}
 
 
function formatDuration(minutes) {
 
	const value = Number(minutes);
 
	if (!Number.isFinite(value) || value <= 0) {
    	return "Self-paced";
	}
 
	if (value < 60) {
    	return `${Math.round(value)} min`;
	}
 
	const hours = Math.floor(value / 60);
	const remaining = Math.round(value % 60);
 
	if (remaining === 0) {
    	return `${hours}h`;
	}
 
	return `${hours}h ${remaining}m`;
}
 
 
function getCourseIdentifier() {
 
	const params = new URLSearchParams(window.location.search);
 
	return {
    	id: params.get("id"),
    	slug: params.get("slug"),
    	courseId: params.get("course_id")
	};
}
 
 
function getLessonId(lesson) {
 
	if (!lesson) {
    	return null;
	}
 
	return lesson.id ||
    	lesson.lesson_id ||
    	lesson.uuid ||
    	null;
}
 
 
/* =========================================================
   LOADING SCREEN
   ========================================================= */
 
function hideLoading() {
 
	const loader = $("#app-loading");
 
	if (!loader) {
    	return;
	}
 
	loader.classList.add("hidden");
 
	setTimeout(() => {
    	loader.style.display = "none";
	}, 450);
}
 
 
function showLoading() {
 
	const loader = $("#app-loading");
 
	if (!loader) {
    	return;
	}
 
	loader.style.display = "flex";
 
	requestAnimationFrame(() => {
    	loader.classList.remove("hidden");
	});
}
 
 
/* =========================================================
   SCREEN NAVIGATION
   ========================================================= */
 
function showScreen(screenName) {
 
	if (!screenName) {
    	return;
	}
 
	const target = document.getElementById(
    	`${screenName}-screen`
	);
 
	if (!target) {
    	return;
	}
 
	$$(".screen").forEach(screen => {
    	screen.classList.remove("active");
	});
 
	target.classList.add("active");
 
	$$(".rail-button[data-screen]").forEach(button => {
    	button.classList.toggle(
        	"active",
        	button.dataset.screen === screenName
    	);
	});
 
	$$(".bottom-nav-button[data-screen]").forEach(button => {
    	button.classList.toggle(
        	"active",
        	button.dataset.screen === screenName
    	);
	});
 
	state.currentScreen = screenName;
 
	closeMoreMenu();
 
	window.scrollTo({
    	top: 0,
    	behavior: "smooth"
	});
}
 
 
function setupNavigation() {
 
	$$(".rail-button[data-screen]").forEach(button => {
 
    	button.addEventListener("click", () => {
        	showScreen(button.dataset.screen);
    	});
 
	});
 
 
	$$(".bottom-nav-button[data-screen]").forEach(button => {
 
    	button.addEventListener("click", () => {
        	showScreen(button.dataset.screen);
    	});
 
	});
 
 
	$$(".menu-option[data-screen]").forEach(button => {
 
    	button.addEventListener("click", () => {
        	showScreen(button.dataset.screen);
    	});
 
	});
 
 
	$$(".text-button[data-screen]").forEach(button => {
 
    	button.addEventListener("click", () => {
        	showScreen(button.dataset.screen);
    	});
 
	});
}
 
 
/* =========================================================
   MORE MENU
   ========================================================= */
 
function openMoreMenu() {
 
	const menu = $("#more-menu");
	const backdrop = $("#menu-backdrop");
 
	if (menu) {
    	menu.classList.add("open");
	}
 
	if (backdrop) {
    	backdrop.classList.add("open");
	}
 
	document.body.classList.add("menu-open");
}
 
 
function closeMoreMenu() {
 
	const menu = $("#more-menu");
	const backdrop = $("#menu-backdrop");
 
	if (menu) {
    	menu.classList.remove("open");
	}
 
    if (backdrop) {
    	backdrop.classList.remove("open");
	}
 
	document.body.classList.remove("menu-open");
}
 
 
function setupMoreMenu() {
 
	const moreButton = $("#more-button");
	const mobileMoreButton = $("#mobile-more-button");
	const closeButton = $("#more-menu-close");
	const backdrop = $("#menu-backdrop");
 
	if (moreButton) {
    	moreButton.addEventListener("click", () => {
 
        	const menu = $("#more-menu");
 
        	if (menu && menu.classList.contains("open")) {
            	closeMoreMenu();
        	} else {
            	openMoreMenu();
        	}
 
    	});
	}
 
 
	if (mobileMoreButton) {
    	mobileMoreButton.addEventListener("click", () => {
 
        	const menu = $("#more-menu");
 
        	if (menu && menu.classList.contains("open")) {
            	closeMoreMenu();
        	} else {
            	openMoreMenu();
        	}
 
    	});
	}
 
 
	if (closeButton) {
    	closeButton.addEventListener(
        	"click",
        	closeMoreMenu
    	);
	}
 
 
	if (backdrop) {
    	backdrop.addEventListener(
        	"click",
        	closeMoreMenu
    	);
	}
}
 
 
/* =========================================================
   PROFILE
   ========================================================= */
 
function setupProfileButtons() {
 
	const buttons = [
    	$("#profile-button"),
    	$("#top-profile")
	];
 
	buttons.forEach(button => {
 
    	if (!button) {
        	return;
    	}
 
    	button.addEventListener("click", () => {
        	showScreen("profile");
    	});
 
	});
}
 
 
function renderProfile() {
 
	const user = state.user;
	const profile = state.profile || {};
 
	const fullName =
    	profile.full_name ||
    	profile.name ||
    	profile.display_name ||
    	user?.user_metadata?.full_name ||
    	user?.user_metadata?.name ||
    	user?.email?.split("@")[0] ||
    	"Student";
 
	const email =
    	user?.email ||
    	profile.email ||
    	"--";
 
	const initials = getInitials(fullName);
 
 
	const nameTargets = [
    	"#top-student-name",
    	"#profile-name"
	];
 
	nameTargets.forEach(selector => {
 
    	const element = $(selector);
 
    	if (element) {
        	element.textContent = fullName;
    	}
 
	});
 
 
	const emailElement = $("#profile-email");
 
	if (emailElement) {
    	emailElement.textContent = email;
	}
 
 
	const avatarTargets = [
    	"#student-avatar",
  	  "#top-avatar",
    	"#profile-large-avatar"
	];
 
	avatarTargets.forEach(selector => {
 
    	const element = $(selector);
 
    	if (element) {
        	element.textContent = initials;
    	}
 
	});
}
 
 
/* =========================================================
   AUTHENTICATION
   ========================================================= */
 
async function loadAuthenticatedUser() {
 
	const {
    	data,
    	error
	} = await supabaseClient.auth.getUser();
 
	if (error) {
    	console.error(
        	"Unable to retrieve authenticated user:",
        	error
    	);
 
    	return null;
	}
 
	return data?.user || null;
}
 
 
async function loadStudentProfile(userId) {
 
	if (!userId) {
    	return null;
	}
 
	/*
   	EduCore normally stores additional user information
   	inside the profiles table.
 
   	If your profile table has a different structure,
   	this query safely falls back to auth metadata.
	*/
 
	const { data, error } = await supabaseClient
    	.from("profiles")
    	.select("*")
    	.eq("id", userId)
    	.maybeSingle();
 
	if (error) {
 
    	console.warn(
        	"Profile table could not be loaded:",
        	error.message
    	);
 
    	return null;
	}
 
	return data;
}
 
 
/* =========================================================
   COURSE IDENTIFICATION
   ========================================================= */
 
async function resolveCourse() {
 
	const identifier = getCourseIdentifier();
 
	let course = null;
 
 
	/* -----------------------------------------------------
   	COURSE BY ID
   	----------------------------------------------------- */
 
	if (identifier.id || identifier.courseId) {
 
    	const id =
        	identifier.id ||
        	identifier.courseId;
 
    	const result = await supabaseClient
        	.from("courses")
        	.select("*")
        	.eq("id", id)
        	.maybeSingle();
 
    	if (result.error) {
        	throw result.error;
    	}
 
    	course = result.data;
	}
 
 
	/* -----------------------------------------------------
   	COURSE BY SLUG
   	----------------------------------------------------- */
 
	else if (identifier.slug) {
 
    	const result = await supabaseClient
        	.from("courses")
        	.select("*")
        	.eq("slug", identifier.slug)
        	.maybeSingle();
 
    	if (result.error) {
        	throw result.error;
        }
 
    	course = result.data;
	}
 
 
	/*
   	No URL identifier.
 
   	If there is only one published course available,
   	use it. This is useful while the platform is being
   	tested before course routing is fully connected.
	*/
 
	else {
 
    	const result = await supabaseClient
        	.from("courses")
        	.select("*")
        	.eq("status", "published")
        	.order("created_at", {
            	ascending: true
        	})
        	.limit(1)
        	.maybeSingle();
 
    	if (result.error) {
        	throw result.error;
    	}
 
    	course = result.data;
	}
 
 
	if (!course) {
    	throw new Error(
        	"The selected course could not be found."
    	);
	}
 
 
	return course;
}
 
 
/* =========================================================
   LOAD COURSE MODULES
   ========================================================= */
 
async function loadModules(courseId) {
 
	if (!courseId) {
    	return [];
	}
 
 
	const { data, error } = await supabaseClient
    	.from("modules")
    	.select("*")
    	.eq("course_id", courseId)
    	.order("sort_order", {
        	ascending: true
    	});
 
 
	if (error) {
    	throw error;
	}
 
 
	return data || [];
}
 
 
/* =========================================================
   LOAD LESSONS
   ========================================================= */
 
async function loadLessons(moduleIds) {
 
	if (!moduleIds || moduleIds.length === 0) {
        return [];
	}
 
 
	const { data, error } = await supabaseClient
    	.from("lessons")
    	.select("*")
    	.in("module_id", moduleIds)
    	.order("sort_order", {
        	ascending: true
    	});
 
 
	if (error) {
    	throw error;
	}
 
 
	return data || [];
}
 
 
/* =========================================================
   LOAD COURSE STRUCTURE
   ========================================================= */
 
async function loadCourseStructure() {
 
	if (!state.course?.id) {
    	return;
	}
 
 
	state.modules = await loadModules(
    	state.course.id
	);
 
 
	const moduleIds = state.modules
    	.map(module => module.id)
    	.filter(Boolean);
 
 
	state.lessons = await loadLessons(moduleIds);
 
 
	/*
   	Add module references to lessons so the student
   	interface can easily display the learning path.
	*/
 
	state.lessons = state.lessons.map(lesson => {
 
    	const module = state.modules.find(
        	item => item.id === lesson.module_id
    	);
 
    	return {
        	...lesson,
        	module
    	};
 
	});
}
 
 
/* =========================================================
   LOAD STUDENT PROGRESS
   ========================================================= */
 
async function loadProgress() {
 
	if (!state.user?.id || !state.course?.id) {
    	return;
	}
 
 
	/*
   	Expected table:
   	progress
 
   	Common fields:
   	user_id
   	course_id
   	lesson_id
   	completed
   	progress
   	time_spent
   	updated_at
	*/
 
	const { data, error } = await supabaseClient
    	.from("progress")
    	.select("*")
    	.eq("user_id", state.user.id)
    	.eq("course_id", state.course.id);
 
 
	if (error) {
 
    	console.warn(
        	"Progress table could not be loaded:",
        	error.message
    	);
 
    	return;
	}
 
 
	state.progress = {};
 
 
	(data || []).forEach(row => {
 
    	const lessonId =
        	row.lesson_id ||
        	row.content_id;
 
    	if (!lessonId) {
        	return;
    	}
 
    	state.progress[lessonId] = row;
 
	});
 
 
	/*
   	Saved lessons may be represented by a saved field
   	in progress. This keeps the system flexible.
	*/
 
	state.savedLessons = new Set(
    	(data || [])
        	.filter(row => row.saved === true)
        	.map(row =>
            	row.lesson_id || row.content_id
        	)
        	.filter(Boolean)
	);
}
 
 
/* =========================================================
   COURSE PROGRESS CALCULATION
   ========================================================= */
 
function getCompletedLessonCount() {
 
	return state.lessons.filter(lesson => {
 
    	const id = getLessonId(lesson);
 
    	return Boolean(
        	id &&
        	state.progress[id]?.completed === true
    	);
 
	}).length;
}
 
 
function getCourseProgress() {
 
	const total = state.lessons.length;
 
	if (!total) {
    	return 0;
	}
 
	const completed = getCompletedLessonCount();
 
	return Math.round(
    	(completed / total) * 100
	);
}
 
 
function getCurrentLesson() {
 
	if (!state.lessons.length) {
    	return null;
	}
 
 
	const incomplete = state.lessons.find(
    	lesson => {
 
        	const id = getLessonId(lesson);
 
        	return !(
            	id &&
            	state.progress[id]?.completed === true
        	);
 
    	}
	);
 
 
	return incomplete || state.lessons[0];
}
 
 
/* =========================================================
   COURSE HEADER
   ========================================================= */
 
function renderCourseHeader() {
 
	const course = state.course;
 
	if (!course) {
    	return;
	}
 
 
	const title =
    	course.title ||
    	course.name ||
    	"Untitled course";
 
 
	const description =
    	course.description ||
    	"Continue your learning journey with EduCore.";
 
 
	const category =
    	course.category ||
    	course.type ||
    	"COURSE";
 
 
	const level =
    	course.level ||
    	course.cefr_level ||
    	course.difficulty ||
    	"All levels";
 
 
	const duration =
    	course.duration ||
    	course.duration_minutes ||
    	course.total_duration ||
    	null;
 
 
	$("#top-course-name") &&
    	($("#top-course-name").textContent = title);
 
 
	$("#course-title") &&
    	($("#course-title").textContent = title);
 
 
	$("#course-description") &&
    	($("#course-description").textContent = description);
 
 
	$("#course-category") &&
    	($("#course-category").textContent =
        	String(category).toUpperCase());
 
 
	$("#course-level") &&
    	($("#course-level").textContent =
        	level);
 
 
	$("#course-lesson-count") &&
    	($("#course-lesson-count").textContent =
        	`${state.lessons.length} ${
            	state.lessons.length === 1
                	? "lesson"
            	    : "lessons"
        	}`);
 
 
	$("#course-duration") &&
    	($("#course-duration").textContent =
        	formatDuration(duration));
}
 
 
/* =========================================================
   PROGRESS DISPLAY
   ========================================================= */
 
function renderProgress() {
 
	const progress = getCourseProgress();
	const completed = getCompletedLessonCount();
 
 
	const topValue = $("#top-progress-value");
 
	if (topValue) {
    	topValue.textContent = `${progress}%`;
	}
 
 
	const heroValue = $("#hero-progress");
 
	if (heroValue) {
    	heroValue.textContent = `${progress}%`;
	}
 
 
	const dashboardValue =
    	$("#progress-dashboard-value");
 
	if (dashboardValue) {
    	dashboardValue.textContent = `${progress}%`;
	}
 
 
	const completedValue =
    	$("#stat-completed");
 
	if (completedValue) {
    	completedValue.textContent = completed;
	}
 
 
	const progressLessons =
    	$("#progress-lessons");
 
	if (progressLessons) {
    	progressLessons.textContent = completed;
	}
 
 
	/*
   	Progress ring.
 
   	The CSS can expose a --progress variable for the
   	visual ring without requiring a specific CSS design.
	*/
 
	const ring = $(".hero-progress-ring");
 
	if (ring) {
    	ring.style.setProperty(
        	"--progress",
        	`${progress}%`
    	);
	}
 
 
	const progressCircle =
    	$(".progress-circle");
 
	if (progressCircle) {
        progressCircle.style.setProperty(
        	"--progress",
        	`${progress}%`
    	);
	}
 
 
	const courseTime =
    	state.lessons.reduce(
        	(total, lesson) => {
 
            	const id = getLessonId(lesson);
 
            	const row =
                	state.progress[id];
 
            	return total +
                	Number(
                    	row?.time_spent ||
                    	row?.time_seconds / 60 ||
                    	0
              	  );
 
        	},
        	0
    	);
 
 
	const statTime = $("#stat-time");
 
	if (statTime) {
 
    	if (courseTime < 60) {
        	statTime.textContent =
            	`${Math.round(courseTime)}m`;
    	} else {
        	statTime.textContent =
            	`${(courseTime / 60).toFixed(1)}h`;
    	}
 
	}
 
 
	/*
   	Streak and XP may later come from a dedicated
   	learner_stats table. For now, use values available
   	in progress rows.
	*/
 
	const streak = calculateStreak();
	const xp = calculateXP();
 
 
	$("#stat-streak") &&
    	($("#stat-streak").textContent = streak);
 
 
	$("#progress-streak") &&
    	($("#progress-streak").textContent = streak);
 
 
	$("#stat-xp") &&
    	($("#stat-xp").textContent = xp);
 
 
	$("#progress-xp") &&
    	($("#progress-xp").textContent = xp);
}
 
 
/* =========================================================
   STREAK
   ========================================================= */
 
function calculateStreak() {
 
	const dates = Object.values(state.progress)
    	.map(row =>
        	row.updated_at ||
        	row.completed_at ||
        	row.last_accessed_at
    	)
    	.filter(Boolean)
    	.map(date =>
        	new Date(date).toISOString().slice(0, 10)
    	);
 
 
	const uniqueDates = [
    	...new Set(dates)
	].sort().reverse();
 
 
	if (!uniqueDates.length) {
    	return 0;
	}
 
 
	let streak = 1;
 
 
	for (let i = 0; i < uniqueDates.length - 1; i++) {
 
    	const current =
        	new Date(uniqueDates[i]);
 
    	const previous =
        	new Date(uniqueDates[i + 1]);
 
 
    	const difference =
        	Math.round(
            	(
                	current - previous
            	) /
            	(1000 * 60 * 60 * 24)
        	);
 
 
    	if (difference === 1) {
        	streak++;
    	} else {
        	break;
    	}
 
	}
 
 
	return streak;
}
 
 
/* =========================================================
   XP
   ========================================================= */
 
function calculateXP() {
 
	return Object.values(state.progress)
    	.reduce(
        	(total, row) => {
 
            	return total +
                	Number(
                    	row.xp ||
                    	row.points ||
                    	(
                        	row.completed
                            	? 10
                         	   : 0
                    	)
                	);
 
        	},
        	0
    	);
}
 
 
/* =========================================================
   OVERVIEW
   ========================================================= */
 
function renderOverview() {
 
	const nextLesson = getCurrentLesson();
 
 
	if (!nextLesson) {
 
    	$("#continue-lesson") &&
        	($("#continue-lesson").textContent =
            	"Your course is ready");
 
 
    	$("#continue-description") &&
        	($("#continue-description").textContent =
            	"No lessons have been added yet.");
 
 
    	$("#continue-module") &&
        	($("#continue-module").textContent =
            	"Course");
 
 
    	return;
	}
 
 
	const moduleName =
    	nextLesson.module?.title ||
    	nextLesson.module?.name ||
    	"Module";
 
 
	const lessonTitle =
    	nextLesson.title ||
    	nextLesson.name ||
    	"Untitled lesson";
 
 
	const description =
    	nextLesson.description ||
       "Continue with your next learning activity.";
 
 
	$("#continue-module") &&
    	($("#continue-module").textContent =
        	moduleName);
 
 
	$("#continue-lesson") &&
    	($("#continue-lesson").textContent =
        	lessonTitle);
 
 
	$("#continue-description") &&
    	($("#continue-description").textContent =
        	description);
 
 
	const completed =
    	state.progress[getLessonId(nextLesson)]
        	?.completed === true;
 
 
	$("#continue-button-text") &&
        ($("#continue-button-text").textContent =
        	completed
            	? "Review lesson"
            	: "Continue learning");
}
 
 
/* =========================================================
   OVERVIEW LEARNING PATH
   ========================================================= */
 
function renderOverviewPath() {
 
	const container = $("#overview-path");
 
	if (!container) {
    	return;
	}
 
 
	container.innerHTML = "";
 
 
	if (!state.modules.length) {
 
    	container.innerHTML = `
        	<div class="empty-state">
            	<div class="empty-icon">○</div>
            	<h2>Your learning path is being prepared.</h2>
            	<p>Lessons will appear here when they are added.</p>
        	</div>
    	`;
 
    	return;
	}
 
 
	state.modules.forEach((module, index) => {
 
    	const moduleLessons =
        	state.lessons.filter(
            	lesson =>
                	lesson.module_id === module.id
        	);
 
 
    	const completed =
        	moduleLessons.filter(
            	lesson =>
                	state.progress[getLessonId(lesson)]
                    	?.completed === true
        	).length;
 
 
    	const percentage =
        	moduleLessons.length
            	? Math.round(
                	(completed /
                    	moduleLessons.length) *
                	100
            	)
            	: 0;
 
 
    	const item =
        	document.createElement("div");
 
    	item.className = "path-item";
 
 
    	item.innerHTML = `
        	<div class="path-number">
            	${String(index + 1).padStart(2, "0")}
        	</div>
 
        	<div class="path-content">
            	<span>
                	MODULE ${index + 1}
            	</span>
 
            	<strong>
                	${escapeHTML(
                    	module.title ||
                    	module.name ||
                    	`Module ${index + 1}`
                	)}
   	         </strong>
 
            	<small>
                	${completed}/${moduleLessons.length}
                	lessons completed
            	</small>
        	</div>
 
        	<div class="path-progress">
            	${percentage}%
        	</div>
    	`;
 
 
    	item.addEventListener(
        	"click",
        	() => {
 
            	showScreen("contents");
 
        	}
    	);
 
 
    	container.appendChild(item);
 
	});
}
 
 
/* =========================================================
   CONTENTS SCREEN
   ========================================================= */
 
function renderContents() {
 
	const container = $("#contents-list");
 
	if (!container) {
    	return;
	}
 
 
	container.innerHTML = "";
 
 
	if (!state.modules.length) {
 
    	container.innerHTML = `
        	<div class="empty-state">
            	<div class="empty-icon">○</div>
            	<h2>No course content yet.</h2>
            	<p>
                	Your lessons will appear here
                	once the course is published.
            	</p>
        	</div>
    	`;
 
    	return;
	}
 
 
	state.modules.forEach((module, moduleIndex) => {
 
    	const lessons =
        	state.lessons.filter(
            	lesson =>
                	lesson.module_id === module.id
        	);
 
 
    	const completed =
        	lessons.filter(
            	lesson =>
                	state.progress[getLessonId(lesson)]
                    	?.completed === true
        	).length;
 
 
    	const moduleElement =
        	document.createElement("div");
 
 
    	moduleElement.className =
        	"content-module";
 
 
    	moduleElement.innerHTML = `
        	<div class="content-module-header">
 
            	<div>
                	<span class="eyebrow">
                    	MODULE ${moduleIndex + 1}
                	</span>
 
                	<h2>
        	            ${escapeHTML(
                        	module.title ||
                        	module.name ||
                        	`Module ${moduleIndex + 1}`
                    	)}
                	</h2>
 
                	${
                    	module.description
                        	? `
                            	<p>
                                	${escapeHTML(
                                    	module.description
                                	)}
   	                         </p>
                          	`
                        	: ""
                	}
            	</div>
 
            	<span class="module-completion">
                	${completed}/${lessons.length}
            	</span>
 
        	</div>
 
        	<div class="module-lessons"></div>
    	`;
 
 
    	const lessonContainer =
        	moduleElement.querySelector(
            	".module-lessons"
        	);
 
 
    	lessons.forEach((lesson, lessonIndex) => {
 
        	const id = getLessonId(lesson);
 
        	const progress =
            	state.progress[id];
 
 
        	const isCompleted =
            	progress?.completed === true;
 
 
        	const isSaved =
            	state.savedLessons.has(id);
 
 
        	const lessonElement =
            	document.createElement("button");
 
 
        	lessonElement.type = "button";
 
        	lessonElement.className =
            	"content-lesson";
 
 
        	if (isCompleted) {
            	lessonElement.classList.add(
                	"completed"
            	);
        	}
 
 
        	lessonElement.innerHTML = `
            	<span class="lesson-index">
                	${String(
                    	lessonIndex + 1
                	).padStart(2, "0")}
            	</span>
 
            	<span class="lesson-info">
 
                	<strong>
                    	${escapeHTML(
                        	lesson.title ||
                        	lesson.name ||
                        	`Lesson ${lessonIndex + 1}`
                    	)}
                	</strong>
 
                	<small>
                    	${
                        	lesson.duration
                            	? formatDuration(
                                	lesson.duration
                            	)
                            	: "Learning lesson"
                    	}
                	</small>
 
            	</span>
 
            	<span class="lesson-status">
                	${
                    	isCompleted
                        	? "✓"
                        	: isSaved
                            	? "☆"
                            	: "→"
                	}
            	</span>
        	`;
 
 
        	lessonElement.addEventListener(
            	"click",
            	() => openLesson(lesson)
        	);
 
 
        	lessonContainer.appendChild(
            	lessonElement
        	);
 
    	});
 
 
    	container.appendChild(
        	moduleElement
    	);
 
	});
}
 
 
/* =========================================================
   LEARN SCREEN
   ========================================================= */
 
function renderLearnScreen() {
 
	const container = $("#learn-list");
 
	if (!container) {
    	return;
	}
 
 
	container.innerHTML = "";
 
 
	if (!state.lessons.length) {
 
    	container.innerHTML = `
        	<div class="empty-state">
            	<div class="empty-icon">○</div>
            	<h2>No lessons available.</h2>
            	<p>
                	Your learning activities will appear here.
            	</p>
        	</div>
    	`;
 
    	return;
	}
 
 
	state.lessons.forEach(
    	(lesson, index) => {
 
        	const id =
            	getLessonId(lesson);
 
 
        	const progress =
            	state.progress[id];
 
 
      	  const completed =
            	progress?.completed === true;
 
 
        	const item =
            	document.createElement("button");
 
 
        	item.type = "button";
 
        	item.className =
            	"large-lesson-item";
 
 
        	if (completed) {
            	item.classList.add(
                	"completed"
            	);
        	}
 
 
        	item.innerHTML = `
            	<span class="large-lesson-number">
                	${String(
                	    index + 1
                	).padStart(2, "0")}
            	</span>
 
            	<span class="large-lesson-content">
 
                	<small>
                    	${escapeHTML(
                        	lesson.module?.title ||
                        	"Module"
                    	)}
                	</small>
 
                	<strong>
                    	${escapeHTML(
                        	lesson.title ||
                        	lesson.name ||
          	              `Lesson ${index + 1}`
                    	)}
                	</strong>
 
                	<span>
                    	${escapeHTML(
                        	lesson.description ||
                        	"Continue your learning activity."
                    	)}
                	</span>
 
            	</span>
 
            	<span class="large-lesson-arrow">
                	${
                    	completed
                        	? "✓"
              	          : "→"
                	}
            	</span>
        	`;
 
 
        	item.addEventListener(
            	"click",
            	() => openLesson(lesson)
        	);
 
 
        	container.appendChild(item);
 
    	}
	);
}
 
 
/* =========================================================
   LESSON RUNNER
   ========================================================= */
 
async function openLesson(lesson) {
 
	if (!lesson) {
    	return;
	}
 
 
	state.currentLesson = lesson;
 
 
	state.currentLessonIndex =
    	state.lessons.findIndex(
        	item =>
            	getLessonId(item) ===
            	getLessonId(lesson)
    	);
 
 
	renderLesson();
 
 
	showScreen("lesson");
 
 
	await registerLessonOpened(
    	lesson
	);
}
 
 
/* =========================================================
   RENDER LESSON
   ========================================================= */
 
function renderLesson() {
 
	const lesson =
    	state.currentLesson;
 
 
	if (!lesson) {
    	return;
	}
 
 
	const lessonId =
    	getLessonId(lesson);
 
 
	const moduleName =
    	lesson.module?.title ||
    	lesson.module?.name ||
    	"Module";
 
 
	const lessonIndex =
    	state.currentLessonIndex >= 0
        	? state.currentLessonIndex + 1
        	: 1;
 
 
	$("#lesson-module-name") &&
    	($("#lesson-module-name").textContent =
        	moduleName);
 
 
	$("#lesson-position-number") &&
    	($("#lesson-position-number").textContent =
        	`Lesson ${lessonIndex}`);
 
 
	const saved =
    	state.savedLessons.has(
        	lessonId
    	);
 
 
	const saveButton =
    	$("#lesson-save");
 
 
	if (saveButton) {
 
    	saveButton.textContent =
        	saved ? "★" : "☆";
 
    	saveButton.classList.toggle(
        	"saved",
        	saved
    	);
 
	}
 
 
	renderLessonBody(
    	lesson
	);
 
 
	updateLessonNavigation();
 
 
	updateLessonProgressBar();
}
 
 
/* =========================================================
   LESSON BODY
   ========================================================= */
 
function renderLessonBody(lesson) {
 
	const container =
    	$("#lesson-body");
 
 
	if (!container) {
    	return;
	}
 
 
	/*
   	The admin system can eventually store structured
   	sections in lesson.content / sections / body.
 
   	This renderer supports several formats without
   	requiring the student page to be rewritten.
	*/
 
	let content =
    	lesson.content ??
    	lesson.body ??
    	lesson.sections ??
    	lesson.content_data ??
    	null;
 
 
	if (typeof content === "string") {
 
    	try {
        	content = JSON.parse(content);
    	} catch {
        	// Plain text / HTML content.
    	}
 
	}
 
 
	container.innerHTML = "";
 
 
	/*
   	Structured sections
	*/
 
	if (Array.isArray(content)) {
 
    	content.forEach(
        	(section, index) => {
 
            	container.appendChild(
                	createLessonSection(
                    	section,
                    	index
                	)
            	);
 
        	}
    	);
 
    	return;
	}
 
 
	/*
   	Object containing sections
	*/
 
	if (
    	content &&
    	typeof content === "object" &&
    	Array.isArray(content.sections)
	) {
 
    	content.sections.forEach(
        	(section, index) => {
 
            	container.appendChild(
                	createLessonSection(
                    	section,
                    	index
                	)
            	);
 
        	}
    	);
 
    	return;
	}
 
 
	/*
   	Plain lesson body
	*/
 
	const wrapper =
    	document.createElement("div");
 
 
	wrapper.className =
    	"lesson-introduction";
 
 
	wrapper.innerHTML = `
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
 
    	${
        	lesson.description
            	? `
                	<p class="lesson-description">
                    	${escapeHTML(
                        	lesson.description
                    	)}
                	</p>
              	`
            	: ""
    	}
 
    	${
        	typeof content === "string" &&
        	content.trim()
            	? `
                	<div class="lesson-rich-content">
                    	${content}
                	</div>
              	`
            	: `
                	<div class="lesson-empty-content">
                    	<p>
                        	This lesson is being prepared.
                    	</p>
                	</div>
              	`
    	}
	`;
 
 
	container.appendChild(
    	wrapper
	);
}
 
 
/* =========================================================
   CREATE LESSON SECTION
   ========================================================= */
 
function createLessonSection(
	section,
	index
) {
 
	const wrapper =
    	document.createElement("article");
 
 
	wrapper.className =
    	"lesson-section";
 
 
	if (typeof section === "string") {
 
    	wrapper.innerHTML = `
        	<div class="section-number">
            	${String(
                	index + 1
            	).padStart(2, "0")}
        	</div>
 
        	<div>
            	${section}
   	     </div>
    	`;
 
    	return wrapper;
	}
 
 
	const type =
    	section.type ||
    	section.section_type ||
    	"content";
 
 
	const title =
    	section.title ||
    	section.heading ||
    	"";
 
 
	const text =
    	section.text ||
    	section.content ||
    	section.body ||
    	"";
 
 
	let html = `
    	<div class="lesson-section-number">
        	${String(
            	index + 1
        	).padStart(2, "0")}
    	</div>
 
    	<div class="lesson-section-content">
	`;
 
 
	if (title) {
 
    	html += `
        	<span class="eyebrow">
            	${escapeHTML(type)}
        	</span>
 
        	<h2>
            	${escapeHTML(title)}
        	</h2>
    	`;
 
	}
 
 
	if (text) {
 
    	html += `
        	<div class="section-text">
            	${
                	typeof text === "string"
                    	? text
                    	: escapeHTML(text)
            	}
        	</div>
    	`;
 
	}
 
 
	/*
   	Image
	*/
 
	if (section.image_url) {
 
    	html += `
        	<figure class="lesson-image">
            	<img
                	src="${escapeHTML(
                    	section.image_url
                	)}"
                	alt="${escapeHTML(
                    	section.image_alt ||
                    	title ||
                    	"Lesson image"
                	)}"
                	loading="lazy"
            	>
        	</figure>
    	`;
 
	}
 
 
	/*
   	Audio
	*/
 
	if (section.audio_url) {
 
    	html += `
        	<div class="lesson-audio">
            	<audio
                	controls
                	preload="metadata"
            	>
                	<source
                    	src="${escapeHTML(
                        	section.audio_url
                    	)}"
                	>
            	</audio>
        	</div>
    	`;
 
	}
 
 
	/*
   	Video
	*/
 
	if (section.video_url) {
 
    	html += `
        	<div class="lesson-video">
            	<video
                	controls
                	preload="metadata"
            	>
                	<source
                    	src="${escapeHTML(
                        	section.video_url
                    	)}"
                	>
            	</video>
        	</div>
    	`;
 
	}
 
 
	/*
   	Vocabulary
	*/
 
	if (
    	type === "vocabulary" &&
    	Array.isArray(section.items)
	) {
 
    	html += `
        	<div class="vocabulary-list">
    	`;
 
 
    	section.items.forEach(item => {
 
        	html += `
            	<div class="vocabulary-item">
 
                	<strong>
                    	${escapeHTML(
                        	item.word ||
                        	item.term ||
                        	""
                    	)}
                	</strong>
 
                	${
                    	item.meaning
                        	? `
                            	<span>
                                	${escapeHTML(
                                    	item.meaning
                                	)}
                            	</span>
                          	`
                        	: ""
                	}
 
            	</div>
        	`;
 
    	});
 
 
    	html += `
        	</div>
    	`;
 
	}
 
 
	/*
   	Dialogue
	*/
 
	if (
    	type === "dialogue" &&
    	Array.isArray(section.lines)
	) {
 
    	html += `
        	<div class="dialogue-list">
    	`;
 
 
    	section.lines.forEach(line => {
 
        	html += `
            	<div class="dialogue-line">
 
                	<strong>
                    	${escapeHTML(
                        	line.speaker ||
                        	"Speaker"
                    	)}
                	</strong>
 
                	<p>
                    	${escapeHTML(
                        	line.text ||
                        	""
                    	)}
                	</p>
 
            	</div>
        	`;
 
    	});
 
 
    	html += `
        	</div>
    	`;
 
	}
 
 
	html += `
    	</div>
	`;
 
 
	wrapper.innerHTML =
    	html;
 
 
	return wrapper;
}
 
 
/* =========================================================
   LESSON NAVIGATION
   ========================================================= */
 
function updateLessonNavigation() {
 
	const index =
    	state.currentLessonIndex;
 
 
	const previous =
    	$("#previous-lesson");
 
 
	const next =
    	$("#next-lesson");
 
 
	if (previous) {
 
    	previous.disabled =
        	index <= 0;
 
	}
 
 
	if (next) {
 
    	next.textContent =
        	index >= state.lessons.length - 1
            	? "Finish →"
            	: "Continue →";
 
	}
 
 
	const status =
    	$("#lesson-footer-status");
 
 
	if (status) {
 
        if (
        	state.currentLesson &&
        	state.progress[
            	getLessonId(
                	state.currentLesson
            	)
        	]?.completed
    	) {
 
        	status.textContent =
            	"Lesson completed";
 
    	} else {
 
        	status.textContent =
            	"Keep going";
 
    	}
 
	}
}
 
 
/* =========================================================
   LESSON PROGRESS BAR
   ========================================================= */
 
function updateLessonProgressBar() {
 
	const fill =
    	$("#lesson-progress-fill");
 
 
	if (!fill) {
    	return;
	}
 
 
	const total =
    	state.lessons.length;
 
 
	const current =
    	state.currentLessonIndex + 1;
 
 
	const percentage =
    	total
        	? Math.round(
            	(current / total) * 100
        	)
        	: 0;
 
 
	fill.style.width =
    	`${percentage}%`;
}
 
 
/* =========================================================
   MARK LESSON COMPLETE
   ========================================================= */
 
async function completeCurrentLesson() {
 
	const lesson =
    	state.currentLesson;
 
 
	if (!lesson || !state.user) {
    	return;
	}
 
 
	const lessonId =
    	getLessonId(lesson);
 
 
	if (!lessonId) {
    	return;
	}
 
 
	const existing =
    	state.progress[lessonId];
 
 
	const payload = {
    	user_id: state.user.id,
	    course_id: state.course.id,
    	lesson_id: lessonId,
    	completed: true,
    	progress: 100,
    	updated_at: new Date().toISOString()
	};
 
 
	/*
   	Keep fields from an existing progress row when
   	possible, without sending the primary key back
   	unnecessarily.
	*/
 
	if (
    	existing?.time_spent !== undefined
	) {
 
    	payload.time_spent =
        	existing.time_spent;
 
	}
 
 
	const {
    	data,
    	error
	} = await supabaseClient
        .from("progress")
    	.upsert(
        	payload,
        	{
            	onConflict:
                	"user_id,course_id,lesson_id"
        	}
    	)
    	.select()
    	.maybeSingle();
 
 
	if (error) {
 
    	console.error(
        	"Unable to save lesson progress:",
        	error
    	);
 
    	return false;
	}
 
 
	state.progress[lessonId] =
    	data || {
        	...existing,
        	...payload
    	};
 
 
	renderProgress();
	renderOverview();
	renderOverviewPath();
	renderContents();
	renderLearnScreen();
	updateLessonNavigation();
 
 
	return true;
}
 
 
/* =========================================================
   REGISTER LESSON OPENED
   ========================================================= */
 
async function registerLessonOpened(lesson) {
 
	if (!state.user || !state.course || !lesson) {
    	return;
	}
 
 
	const lessonId =
    	getLessonId(lesson);
 
 
	if (!lessonId) {
    	return;
	}
 
 
	const existing =
    	state.progress[lessonId];
 
 
	const payload = {
    	user_id: state.user.id,
    	course_id: state.course.id,
    	lesson_id: lessonId,
    	completed:
        	existing?.completed || false,
    	progress:
        	existing?.progress || 0,
    	updated_at:
        	new Date().toISOString()
	};
 
 
	const {
    	data,
    	error
	} = await supabaseClient
    	.from("progress")
    	.upsert(
        	payload,
        	{
	            onConflict:
                	"user_id,course_id,lesson_id"
        	}
    	)
    	.select()
    	.maybeSingle();
 
 
	if (error) {
 
    	console.warn(
        	"Lesson access could not be recorded:",
        	error.message
    	);
 
    	return;
	}
 
 
	if (data) {
    	state.progress[lessonId] =
        	data;
	}
}
 
 
/* =========================================================
   NEXT / PREVIOUS LESSON
   ========================================================= */
 
async function goToNextLesson() {
 
	if (!state.currentLesson) {
    	return;
	}
 
 
	await completeCurrentLesson();
 
 
	const nextIndex =
    	state.currentLessonIndex + 1;
 
 
	if (
    	nextIndex >=
    	state.lessons.length
	) {
 
    	renderProgress();
 
    	showScreen("progress");
 
    	return;
	}
 
 
	await openLesson(
    	state.lessons[nextIndex]
	);
}
 
 
async function goToPreviousLesson() {
 
    const previousIndex =
    	state.currentLessonIndex - 1;
 
 
	if (previousIndex < 0) {
    	return;
	}
 
 
	await openLesson(
    	state.lessons[previousIndex]
	);
}
 
 
/* =========================================================
   LESSON ACTIONS
   ========================================================= */
 
async function toggleSaveLesson() {
 
	const lesson =
    	state.currentLesson;
 
 
	if (!lesson || !state.user) {
    	return;
	}
 
 
	const lessonId =
    	getLessonId(lesson);
 
 
	if (!lessonId) {
    	return;
	}
 
 
	const currentlySaved =
    	state.savedLessons.has(
        	lessonId
    	);
 
 
	const existing =
    	state.progress[lessonId] || {};
 
 
	const payload = {
    	user_id: state.user.id,
    	course_id: state.course.id,
    	lesson_id: lessonId,
    	completed:
        	existing.completed || false,
    	progress:
        	existing.progress || 0,
    	saved:
        	!currentlySaved,
    	updated_at:
        	new Date().toISOString()
	};
 
 
	const {
    	data,
    	error
	} = await supabaseClient
    	.from("progress")
    	.upsert(
        	payload,
        	{
            	onConflict:
                	"user_id,course_id,lesson_id"
        	}
    	)
    	.select()
    	.maybeSingle();
 
 
	if (error) {
 
    	console.error(
        	"Unable to save lesson:",
        	error
    	);
 
    	return;
	}
 
 
	if (!currentlySaved) {
 
    	state.savedLessons.add(
        	lessonId
    	);
 
	} else {
 
    	state.savedLessons.delete(
        	lessonId
    	);
 
	}
 
 
	state.progress[lessonId] =
    	data || {
        	...existing,
        	...payload
    	};
 
 
	const saveButton =
    	$("#lesson-save");
 
 
	if (saveButton) {
 
    	saveButton.textContent =
        	!currentlySaved
            	? "★"
            	: "☆";
 
    	saveButton.classList.toggle(
        	"saved",
   	     !currentlySaved
    	);
 
	}
 
 
	renderContents();
}
 
 
/* =========================================================
   LESSON BACK BUTTON
   ========================================================= */
 
function setupLessonBack() {
 
	const button =
    	$("#lesson-back");
 
 
	if (!button) {
    	return;
	}
 
 
	button.addEventListener(
    	"click",
    	() => {
 
        	showScreen(
            	state.currentScreenBeforeLesson ||
            	"overview"
       	 );
 
    	}
	);
}
 
 
/* =========================================================
   CONTINUE BUTTONS
   ========================================================= */
 
function openCurrentLesson() {
 
	const lesson =
    	getCurrentLesson();
 
 
	if (!lesson) {
    	return;
	}
 
 
	state.currentScreenBeforeLesson =
    	state.currentScreen;
 
 
	openLesson(
    	lesson
	);
}
 
 
function setupContinueButtons() {
 
	const mainButton =
    	$("#continue-button");
 
 
	const cardButton =
    	$("#continue-card-button");
 
 
	if (mainButton) {
 
    	mainButton.addEventListener(
        	"click",
        	openCurrentLesson
    	);
 
	}
 
 
	if (cardButton) {
 
    	cardButton.addEventListener(
        	"click",
        	openCurrentLesson
    	);
 
	}
}
 
 
/* =========================================================
   LESSON FOOTER BUTTONS
   ========================================================= */
 
function setupLessonFooter() {
 
	const previous =
    	$("#previous-lesson");
 
 
	const next =
    	$("#next-lesson");
 
 
	if (previous) {
 
    	previous.addEventListener(
        	"click",
        	goToPreviousLesson
    	);
 
	}
 
 
	if (next) {
 
    	next.addEventListener(
        	"click",
        	goToNextLesson
    	);
 
	}
}
 
 
/* =========================================================
   LESSON SAVE
   ========================================================= */
 
function setupLessonSave() {
 
	const button =
    	$("#lesson-save");
 
 
	if (!button) {
    	return;
	}
 
 
	button.addEventListener(
    	"click",
    	toggleSaveLesson
	);
}
 
 
/* =========================================================
   LESSON MORE
   ========================================================= */
 
function setupLessonMore() {
 
	const button =
    	$("#lesson-more");
 
 
	if (!button) {
    	return;
	}
 
 
	button.addEventListener(
    	"click",
    	() => {
 
        	/*
           	Reserved for lesson actions such as:
           	- Report content
           	- Add note
           	- Share
           	- AI assistance
        	*/
 
        	button.classList.toggle(
            	"active"
        	);
 
    	}
	);
}
 
 
/* =========================================================
   SETTINGS TOGGLES
   ========================================================= */
 
function setupSettings() {
 
	$$(".toggle").forEach(
    	toggle => {
 
    	    toggle.addEventListener(
            	"click",
            	() => {
 
                	toggle.classList.toggle(
                    	"active"
                	);
 
            	}
        	);
 
    	}
	);
}
 
 
/* =========================================================
   EXIT COURSE
   ========================================================= */
 
function setupExitCourse() {
 
	const button =
    	$("#exit-course");
 
 
	if (!button) {
    	return;
	}
 
 
	button.addEventListener(
    	"click",
    	() => {
 
        	window.location.href =
            	"../student.html";
 
    	}
	);
}
 
 
/* =========================================================
   BROWSER BACK BUTTON
   ========================================================= */
 
function setupBrowserBack() {
 
	window.addEventListener(
    	"popstate",
    	() => {
 
        	const lessonScreen =
            	$("#lesson-screen");
 
 
        	if (
            	lessonScreen &&
            	lessonScreen.classList.contains(
                	"active"
            	)
        	) {
 
            	showScreen(
                	state.currentScreenBeforeLesson ||
                	"overview"
            	);
 
        	}
 
    	}
	);
}
 
 
/* =========================================================
   ERROR STATE
   ========================================================= */
 
function showCourseError(message) {
 
	const page =
    	$(".page");
 
 
	if (!page) {
    	return;
	}
 
 
	page.innerHTML = `
    	<div class="empty-state course-error">
 
        	<div class="empty-icon">
            	!
        	</div>
 
        	<h2>
            	We couldn't load this course.
        	</h2>
 
        	<p>
            	${escapeHTML(
                	message ||
                	"Please return to your courses and try again."
            	)}
        	</p>
 
        	<button
            	class="primary-button"
            	id="course-error-back"
        	>
            	Back to my courses
        	</button>
 
    	</div>
	`;
 
 
	const button =
    	$("#course-error-back");
 
 
	if (button) {
 
    	button.addEventListener(
        	"click",
        	() => {
 
            	window.location.href =
                	"../student.html";
 
        	}
    	);
 
	}
}
 
 
/* =========================================================
   AUTH STATE LISTENER
   ========================================================= */
 
function setupAuthListener() {
 
	supabaseClient.auth.onAuthStateChange(
    	async (event, session) => {
 
        	if (
            	event === "SIGNED_OUT"
        	) {
 
            	window.location.href =
                	"../index.html";
 
        	}
 
    	}
	);
}
 
 
/* =========================================================
   INITIAL DATA LOAD
   ========================================================= */
 
async function loadApplication() {
 
	try {
 
    	showLoading();
 
 
    	/* -------------------------------------------------
       	USER
    	------------------------------------------------- */
 
    	state.user =
        	await loadAuthenticatedUser();
 
 
    	if (!state.user) {
 
        	window.location.href =
            	"../index.html";
 
        	return;
    	}
 
 
    	/* -------------------------------------------------
       	PROFILE
    	------------------------------------------------- */
 
    	state.profile =
        	await loadStudentProfile(
            	state.user.id
        	);
 
 
    	renderProfile();
 
 
    	/* -------------------------------------------------
       	COURSE
    	------------------------------------------------- */
 
    	state.course =
        	await resolveCourse();
 
 
    	/* -------------------------------------------------
       	STRUCTURE
    	------------------------------------------------- */
 
    	await loadCourseStructure();
 
 
    	/* -------------------------------------------------
       	PROGRESS
    	------------------------------------------------- */
 
    	await loadProgress();
 
 
    	/* -------------------------------------------------
       	RENDER
    	------------------------------------------------- */
 
    	renderCourseHeader();
 
    	renderProgress();
 
    	renderOverview();
 
    	renderOverviewPath();
 
    	renderContents();
 
    	renderLearnScreen();
 
 
    	/*
       	Open the lesson specified in the URL if present.
    	*/
 
    	const params =
        	new URLSearchParams(
            	window.location.search
        	);
 
 
    	const lessonId =
        	params.get("lesson");
 
 
    	if (lessonId) {
 
        	const lesson =
            	state.lessons.find(
                	item =>
                    	String(
                       	 getLessonId(item)
                    	) ===
                    	String(lessonId)
            	);
 
 
        	if (lesson) {
 
            	state.currentScreenBeforeLesson =
                	"overview";
 
            	await openLesson(
                	lesson
            	);
 
        	}
 
    	}
 
 
    	hideLoading();
 
 
	} catch (error) {
 
    	console.error(
        	"EduCore course loading error:",
        	error
    	);
 
 
    	hideLoading();
 
 
    	showCourseError(
        	error?.message ||
        	"An unexpected error occurred while loading the course."
    	);
 
	} finally {
 
    	state.loading = false;
 
	}
}
 
 
/* =========================================================
   INITIALIZATION
   ========================================================= */
 
async function init() {
 
	setupNavigation();
 
	setupMoreMenu();
 
	setupProfileButtons();
 
	setupContinueButtons();
 
	setupLessonBack();
 
	setupLessonFooter();
 
    setupLessonSave();
 
	setupLessonMore();
 
	setupSettings();
 
	setupExitCourse();
 
	setupBrowserBack();
 
	setupAuthListener();
 
 
	await loadApplication();
 
}
 
 
/* =========================================================
   START
   ========================================================= */
 
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
 

