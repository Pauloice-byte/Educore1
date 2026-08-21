/* ==========================================================
   AUTONOMOUS COURSE
   LEARNING ENGINE
========================================================== */


/* ==========================================================
   COURSE DATA
========================================================== */

Const COURSE_DATA = {

    Title: “English Course”,

    Units: [

        {
            Id: 1,

            Title: “Unit 1”,

            Lessons: [

                {
                    Id: 1,

                    Title: “Getting Started”,

                    Description:
                        “Learn the key language and practise the first concepts.”,

                    Activities: [

                        {
                            Id: “welcome”,

                            Type: “explanation”,

                            Title: “Welcome to the lesson”,

                            Icon: “◆”,

                            Description:
                                “Your AI teacher introduces today’s lesson.”,

                            Text:
                                “Welcome! In this lesson you will learn the key language you need to introduce yourself and talk about basic personal information.”,

                            Duration: “5–10 min”

                        },


                        {
                            Id: “vocabulary”,

                            Type: “explanation”,

                            Title: “Key vocabulary”,

                            Icon: “Aa”,

                            Description:
                                “Learn the vocabulary you will use in this lesson.”,

                            Text:
                                “Here you will provide the vocabulary explanation for the lesson. Add examples, images, audio or an AI teacher video whenever the lesson is ready.”,

                            Duration: “5 min”

                        },


                        {
                            Id: “exercise-1”,

                            Type: “multiple-choice”,

                            Title: “Choose the correct answer”,

                            Icon: “✓”,

                            Description:
                                “Check your understanding.”,

                            Question:
                                “She ___ from Angola.”,

                            Options: [

                                “am”,

                                “is”,

                                “are”

                            ],

                            Answer: 1,

                            Explanation:
                                “We use ‘is’ with he, she and it.”

                        },


                        {
                            Id: “exercise-2”,

                            Type: “text”,

                            Title: “Complete the sentence”,

                            Icon: “⌨”,

                            Description:
                                “Type the missing word.”,

                            Question:
                                “My name ___ Paulo.”,

                            Answer:
                                “is”,

                            Explanation:
                                “The correct sentence is: My name is Paulo.”

                        },


                        {
                            Id: “listening”,

                            Type: “listening”,

                            Title: “Listening practice”,

                            Icon: “♫”,

                            Description:
                                “Listen carefully and answer the question.”,

                            Audio:
                                “”,

                            Question:
                                “What is the speaker’s name?”,

                            Options: [

                                “John”,

                                “Michael”,

                                “Peter”

                            ],

                            Answer: 0,

                            Explanation:
                                “The speaker says that his name is John.”

                        },


                        {
                            Id: “speaking”,

                            Type: “speaking”,

                            Title: “Speaking practice”,

                            Icon: “◉”,

                            Description:
                                “Have a conversation with your AI teacher.”,

                            aiOpening:
                                “Hello! My name is Alex. What’s your name?”,

                            Instructions:
                                “Introduce yourself and tell me your name, where you are from and what you do.”

                        },


                        {
                            Id: “review”,

                            Type: “multiple-choice”,

                            Title: “Lesson review”,

                            Icon: “★”,

                            Description:
                                “Final check before completing the lesson.”,

                            Question:
                                “Which sentence is correct?”,

                            Options: [

                                “I are from Angola.”,

                                “I am from Angola.”,

                                “I is from Angola.”

                            ],

                            Answer: 1,

                            Explanation:
                                “The correct sentence is ‘I am from Angola.’”

                        }

                    ]

                }

            ]

        }

    ]

};


/* ==========================================================
   APPLICATION STATE
========================================================== */

Let currentUnit = 0;

Let currentLesson = 0;

Let currentActivity = 0;

Let lessonScore = 0;

Let answeredActivities = {};

Let recognition = null;

Let isRecording = false;

Const STORAGE_KEY =
    “autonomousCourseProgress”;


/* ==========================================================
   DOM
========================================================== */

Const sidebar =
    Document.getElementById(“sidebar”);

Const sidebarOverlay =
    Document.getElementById(“sidebar-overlay”);

Const mobileMenuBtn =
    Document.getElementById(“mobile-menu-btn”);

Const closeSidebar =
    Document.getElementById(“close-sidebar”);

Const unitNavigation =
    Document.getElementById(“unit-navigation”);

Const lessonHome =
    Document.getElementById(“lesson-home”);

Const lessonCards =
    Document.getElementById(“lesson-cards”);

Const activityArea =
    Document.getElementById(“activity-area”);

Const activityContent =
    Document.getElementById(“activity-content”);

Const completionScreen =
    Document.getElementById(“completion-screen”);

Const currentUnitLabel =
    Document.getElementById(“current-unit-label”);

Const currentLessonTitle =
    Document.getElementById(“current-lesson-title”);

Const welcomeTitle =
    Document.getElementById(“welcome-title”);

Const welcomeDescription =
    Document.getElementById(“welcome-description”);

Const lessonProgressText =
    Document.getElementById(“lesson-progress-text”);

Const lessonProgressBar =
    Document.getElementById(“lesson-progress-bar”);

Const courseProgressText =
    Document.getElementById(“course-progress-text”);

Const courseProgressBar =
    Document.getElementById(“course-progress-bar”);

Const activityType =
    Document.getElementById(“activity-type”);

Const activityCounter =
    Document.getElementById(“activity-counter”);

Const activityDots =
    Document.querySelector(“.activity-dots”);

Const previousActivity =
    Document.getElementById(“previous-activity”);

Const nextActivity =
    Document.getElementById(“next-activity”);

Const startLessonBtn =
    Document.getElementById(“start-lesson-btn”);

Const backToLesson =
    Document.getElementById(“back-to-lesson”);

Const finalScore =
    Document.getElementById(“final-score”);

Const completionCorrect =
    Document.getElementById(“completion-correct”);

Const completionActivities =
    Document.getElementById(“completion-activities”);

Const nextLessonBtn =
    Document.getElementById(“next-lesson-btn”);

Const reviewLessonBtn =
    Document.getElementById(“review-lesson-btn”);

Const lessonStatus =
    Document.getElementById(“lesson-status”);

Const heroProgress =
    Document.getElementById(“hero-progress”);

Const heroMiniProgress =
    Document.getElementById(“hero-mini-progress”);

Const heroActivityCount =
    Document.getElementById(“hero-activity-count”);


/* ==========================================================
   SPEAKING DOM
========================================================== */

Const speakingModal =
    Document.getElementById(“speaking-modal”);

Const closeSpeaking =
    Document.getElementById(“close-speaking”);

Const speakingTitle =
    Document.getElementById(“speaking-title”);

Const aiMessage =
    Document.getElementById(“ai-message”);

Const speakingIndicator =
    Document.getElementById(“speaking-indicator”);

Const speakingStatusText =
    Document.getElementById(“speaking-status-text”);

Const microphoneButton =
    Document.getElementById(“microphone-button”);

Const studentTranscript =
    Document.getElementById(“student-transcript”);

Const speakingSubmit =
    Document.getElementById(“speaking-submit”);


/* ==========================================================
   MEDIA
========================================================== */

Const mediaModal =
    Document.getElementById(“media-modal”);

Const closeMedia =
    Document.getElementById(“close-media”);

Const mediaContent =
    Document.getElementById(“media-content”);


/* ==========================================================
   STORAGE
========================================================== */

Function getProgress() {

    Try {

        Return JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        ) || {};

    } catch (error) {

        Console.error(error);

        Return {};

    }

}


Function saveProgress() {

    Const progress =
        getProgress();

    const unit =
        COURSE_DATA.units[currentUnit];

    Const lesson =
        Unit.lessons[currentLesson];

    Progress[
        `${unit.id}_${lesson.id}`
    ] = {

        Completed:
            Object.keys(answeredActivities).length >=
            Lesson.activities.length,

        Score:
            lessonScore,

        answered:
            answeredActivities

    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(progress)
    );


    updateCourseProgress();

}


/* ==========================================================
   INITIALISE
========================================================== */

Document.addEventListener(
    “DOMContentLoaded”,
    Initialize
);


Function initialize() {

    renderUnitNavigation();

    openLesson(0, 0);

    setupEventListeners();

    updateCourseProgress();

}


/* ==========================================================
   EVENT LISTENERS
========================================================== */

Function setupEventListeners() {

    startLessonBtn.addEventListener(
        “click”,
        () => openActivity(0)
    );


    backToLesson.addEventListener(
        “click”,
        showLessonHome
    );


    previousActivity.addEventListener(
        “click”,
        () => {

            If (currentActivity > 0) {

                openActivity(
                    currentActivity – 1
                );

            }

        }
    );


    nextActivity.addEventListener(
        “click”,
        handleNextActivity
    );


    reviewLessonBtn.addEventListener(
        “click”,
        () => {

            openActivity(0);

        }
    );


    nextLessonBtn.addEventListener(
        “click”,
        openNextLesson
    );


    mobileMenuBtn.addEventListener(
        “click”,
        openMobileSidebar
    );


    closeSidebar.addEventListener(
        “click”,
        closeMobileSidebar
    );


    sidebarOverlay.addEventListener(
        “click”,
        closeMobileSidebar
    );


    closeSpeaking.addEventListener(
        “click”,
        closeSpeakingModal
    );


    microphoneButton.addEventListener(
        “click”,
        toggleRecording
    );


    speakingSubmit.addEventListener(
        “click”,
        finishSpeaking
    );


    closeMedia.addEventListener(
        “click”,
        closeMediaModal
    );

}


/* ==========================================================
   MOBILE SIDEBAR
========================================================== */

Function openMobileSidebar() {

    Sidebar.classList.add(
        “mobile-open”
    );

    sidebarOverlay.classList.add(
        “active”
    );

}


Function closeMobileSidebar() {

    Sidebar.classList.remove(
        “mobile-open”
    );

    sidebarOverlay.classList.remove(
        “active”
    );

}


/* ==========================================================
   NAVIGATION
========================================================== */

Function renderUnitNavigation() {

    unitNavigation.innerHTML = “”;


    COURSE_DATA.units.forEach(
        (unit, unitIndex) => {

            Const wrapper =
                Document.createElement(“div”);

            Wrapper.className =
                “unit-navigation-item”;


            Const button =
                Document.createElement(“button”);

            Button.className =
                “unit-button”;

            Button.innerHTML = `

                <span>
                    ${escapeHTML(unit.title)}
                </span>

                <span class=”unit-arrow”>
                    ›
                </span>

            `;


            Button.addEventListener(
                “click”,
                () => {

                    Wrapper.classList.toggle(
                        “open”
                    );

                }
            );


            Const lessonList =
                Document.createElement(“div”);

            lessonList.className =
                “unit-lessons”;


            Unit.lessons.forEach(
                (lesson, lessonIndex) => {

                    Const lessonButton =
                        Document.createElement(“button”);

                    lessonButton.className =
                        “lesson-nav-button”;


                    If (
                        unitIndex === currentUnit &&
                        lessonIndex === currentLesson
                    ) {

                        lessonButton.classList.add(
                            “active”
                        );

                    }


                    lessonButton.textContent =
                        `Lesson ${lesson.id} — ${lesson.title}`;


                    lessonButton.addEventListener(
                        “click”,
                        () => {

                            openLesson(
                                unitIndex,
                                lessonIndex
                            );

                            closeMobileSidebar();

                        }
                    );


                    lessonList.appendChild(
                        lessonButton
                    );

                }
            );


            Wrapper.appendChild(button);

            Wrapper.appendChild(lessonList);

            unitNavigation.appendChild(wrapper);

        }
    );


    Const activeUnit =
        unitNavigation.children[currentUnit];

    if (activeUnit) {

        activeUnit.classList.add(
            “open”
        );

    }

}


/* ==========================================================
   OPEN LESSON
========================================================== */

Function openLesson(
    unitIndex,
    lessonIndex
) {

    currentUnit =
        unitIndex;

    currentLesson =
        lessonIndex;

    currentActivity = 0;

    lessonScore = 0;

    answeredActivities = {};


    const unit =
        COURSE_DATA.units[currentUnit];

    Const lesson =
        Unit.lessons[currentLesson];


    Const saved =
        getProgress()[
            `${unit.id}_${lesson.id}`
        ];


    If (saved) {

        lessonScore =
            saved.score || 0;

        answeredActivities =
            saved.answered || {};

    }


    currentUnitLabel.textContent =
        unit.title;

    currentLessonTitle.textContent =
        lesson.title;

    welcomeTitle.textContent =
        lesson.title;

    welcomeDescription.textContent =
        lesson.description;


    heroActivityCount.textContent =
        `${lesson.activities.length} activities`;


    renderLessonCards();

    updateLessonProgress();

    renderUnitNavigation();

    showLessonHome();

}


/* ==========================================================
   LESSON CARDS
========================================================== */

Function renderLessonCards() {

    lessonCards.innerHTML = “”;


    const lesson =
        COURSE_DATA
            .units[currentUnit]
            .lessons[currentLesson];


    Lesson.activities.forEach(
        (activity, index) => {

            Const card =
                Document.createElement(“article”);

            Card.className =
                “lesson-card”;


            Const completed =
                Boolean(
                    answeredActivities[
                        activity.id
                    ]
                );


            If (completed) {

                Card.classList.add(
                    “completed”
                );

            }


            Card.innerHTML = `

                <div class=”card-number”>
                    ${String(index + 1).padStart(2, “0”)}
                </div>

                <div class=”card-icon”>
                    ${escapeHTML(
                        Activity.icon ||
                        getActivityIcon(activity.type)
                    )}
                </div>

                <h3>
                    ${escapeHTML(activity.title)}
                </h3>

                <p>
                    ${escapeHTML(
                        Activity.description || “”
                    )}
                </p>

                ${
                    Completed
                    ?
                    `
                    <div class=”card-status complete”>
                        ✓ Completed
                    </div>
                    `
                    :
                    “”
                }

            `;


            Card.addEventListener(
                “click”,
                () => openActivity(index)
            );


            lessonCards.appendChild(card);

        }
    );


    updateLessonStatus();

}


/* ==========================================================
   A
