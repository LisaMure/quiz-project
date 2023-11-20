const quizQuestionEl = document.getElementById("quiz-question");
const quizAnswerEl = document.getElementById("quiz-answer");
const quizBody = document.getElementById("quiz-body");
const notificationModal = document.getElementById("notification-modal");
const progressBar = document.getElementById("progress-bar");
let quizCompleted = false; // Flag to track quiz completion

let currentQuestionIndex = 0;
let progressInterval;

// Display Quiz Question
function displayQuizQuestion(currentQuestionIndex) {
  const questionEL = document.getElementById("quiz-question-el");
  question = quizQuestions[currentQuestionIndex].question;
  questionEL.textContent = question;
}

// Display Quiz Answers
function displayQuizAnswer(currentQuestionIndex) {
  // Clear the current answers
  clearAnswers();

  // Loop through and display the possible answers
  const answers = quizQuestions[currentQuestionIndex].answers;
  const correctAnswer = quizQuestions[currentQuestionIndex].correctAnswer;

  Object.keys(answers).forEach((key, index) => {
    const div = document.createElement("div");
    div.classList.add("col-sm-6", "mb-3", "mb-sm-0", "mt-4");
    div.innerHTML = `
    <div class="card quiz-answer">
    <button id="quiz-answer-${index}">${answers[key]}</button> 
    </div>
        `;

    document.getElementById("quiz-answer-row").appendChild(div);

    const button = document.querySelector(`#quiz-answer-${index}`);

    button.addEventListener("click", () => {
      selectedAnswer = document.querySelector(
        `#quiz-answer-${index}`
      ).textContent;

      handleResponses(selectedAnswer, correctAnswer);
    });
  });
}

// Handle the user's responses
function handleResponses(selectedAnswer, correctAnswer) {
  // Notification modal
  const answerModal = new bootstrap.Modal("#exampleModal");

  function handleModal() {
    answerModal.show();

    setTimeout(() => {
      answerModal.hide();
    }, 3000);
  }

  // Handle submitted responses
  if (selectedAnswer === correctAnswer) {
    handleModal();
    notificationModal.innerHTML = "Nailed it!💃💃";
    setTimeout(displayNextQuestion, 3000);
  } else {
    handleModal();
    notificationModal.innerHTML = `Sorry😞 The correct answer is ${correctAnswer}`;
    setTimeout(displayNextQuestion, 3000);
  }
}

// Clear answers before next question
function clearAnswers() {
  const answerRow = document.getElementById("quiz-answer-row");

  while (answerRow.firstChild) {
    answerRow.removeChild(answerRow.firstChild);
  }
}

// Display the next question
function displayNextQuestion() {
  if (!quizCompleted && currentQuestionIndex < quizQuestions.length - 1) {
    // Reset the progress bar
    currentQuestionIndex++;
    clearInterval(progressInterval);
    progressBar.style.transition = "";
    progressBar.style.width = "0%";
    progressBar.setAttribute("aria-valuenow", 0);

    // Reset the timer
    setTimer(15000, displayNextQuestion);
    displayQuizQuestion(currentQuestionIndex);
    displayQuizAnswer(currentQuestionIndex);
  } else if (
    currentQuestionIndex === quizQuestions.length - 1 &&
    !quizCompleted
  ) {
    // Clear the timer
    clearInterval(progressInterval);

    // Clear the quizBody and display end of quiz message
    quizBody.innerHTML =
      "Congratulations!! You have reached the end of the quiz!";
    quizBody.style.color = "white";
    quizBody.style.fontSize = "30px";
    quizBody.style.fontWeight = "bold";
    quizBody.style.padding = "120px";
    quizCompleted = true; // Update the quiz status
  }
}

// Set up the timer and start the quiz
function setTimer(duration, callback) {
  let progress = 0;
  const intervalDuration = 50;
  const steps = duration / intervalDuration;
  const stepWidth = 100 / steps;

  progressBar.style.transition = "none";
  progressBar.style.width = "0%";
  progressBar.setAttribute("aria-valuenow", 0);

  progressInterval = setInterval(() => {
    progress += stepWidth;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute("aria-valuenow", progress);

    // Change color to red when progress bar reaches 85
    if (progress >= 85 && progress < 100) {
      progressBar.style.backgroundColor = "red";
    } else {
      progressBar.style.backgroundColor = "";
    }

    if (progress >= 100) {
      clearInterval(progressInterval);
      progressBar.style.transition = "width 0.3s ease-in-out";
      progressBar.style.width = "0%";
      progressBar.setAttribute("aria-valuenow", 0);

      setTimeout(() => {
        progressBar.style.transition = "";

        // Notification if timer runs out
        const timeUpModal = new bootstrap.Modal("#exampleModal");
        timeUpModal.show();
        notificationModal.innerHTML = "⏰Time's up!";

        setTimeout(() => {
          timeUpModal.hide();
          callback();
        }, 3000);
      }, 1000);
    }
  }, intervalDuration);
}

// Start quiz by showing the modal
function startQuiz() {
  const startModal = new bootstrap.Modal(
    document.getElementById("staticBackdrop")
  );

  startModal.show();

  displayQuizQuestion(currentQuestionIndex);
  displayQuizAnswer(currentQuestionIndex);
}

// Handle the start button on the modal
function handleStartButton() {
  setTimer(15000, displayNextQuestion);
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("start-btn")
    .addEventListener("click", handleStartButton);

  startQuiz();
});
