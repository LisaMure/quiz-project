const quizQuestionEl = document.getElementById("quiz-question");
const quizAnswerEl = document.getElementById("quiz-answer");
const quizBody = document.getElementById("quiz-body");
const quizContainer = document.getElementById("quiz-container");
const notificationModal = document.getElementById("notification-modal");
const progressBar = document.getElementById("progress-bar");
let quizCompleted = false; // Flag to track quiz completion
let progressInterval;
let data = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;

//Get data from API
function fetchQuizData() {
  axios
    .get("https://the-trivia-api.com/v2/questions?difficulty=easy")
    .then((response) => {
      data = response.data;
      displayQuizQuestion(data, currentQuestionIndex);
      displayQuizAnswer(data, currentQuestionIndex);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Display Quiz Question
function displayQuizQuestion(data, currentQuestionIndex) {
  const questionEL = document.getElementById("quiz-question-el");
  const question = data[currentQuestionIndex].question.text;
  questionEL.textContent = question;
}

// Display Quiz Answers
function displayQuizAnswer(data, currentQuestionIndex) {
  // Clear the current answers
  clearAnswers();

  // Get the current question data
  const currentQuestion = data[currentQuestionIndex];

  // Loop through and display the possible answers
  const correctAnswer = currentQuestion.correctAnswer;
  const incorrectAnswers = currentQuestion.incorrectAnswers;
  const allAnswers = [correctAnswer, ...incorrectAnswers];

  // Shuffle the answers in the array
  const shuffledAnswers = shuffleArray(allAnswers);

  shuffledAnswers.forEach((answer, index) => {
    const div = document.createElement("div");
    div.classList.add("col-sm-6", "mb-3", "mb-sm-0", "mt-4");
    div.innerHTML = `
    <div class="card quiz-answer">
    <button id="quiz-answer-${index}">${answer}</button> 
    </div>
        `;

    document.getElementById("quiz-answer-row").appendChild(div);

    // Event listener to handle clicked answers
    const button = document.querySelector(`#quiz-answer-${index}`);
    button.addEventListener("click", () => {
      selectedAnswer = document.querySelector(
        `#quiz-answer-${index}`
      ).textContent;
      // Call function to handle responses
      handleResponses(selectedAnswer, correctAnswer, data);
    });
  });
}

// Shuffle the array with answers
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Handle the user's responses
function handleResponses(selectedAnswer, correctAnswer, data) {
  // Notification modal
  const answerModal = new bootstrap.Modal("#exampleModal");

  function handleModal() {
    answerModal.show();

    setTimeout(() => {
      answerModal.hide();
      displayNextQuestion(data);
    }, 3000);
  }

  // Handle submitted responses
  if (selectedAnswer === correctAnswer) {
    // Count the correct answers and set to local storage
    correctAnswers++;
    localStorage.setItem("Total Correct Answers", correctAnswers);
    handleModal();
    notificationModal.innerHTML = `<i class="fa-solid fa-circle-check fa-xl" style="color: #419b45;"></i> Nailed it!`;
    setTimeout(displayNextQuestion, 3000);
  } else {
    handleModal();
    notificationModal.innerHTML = `<i class="fa-solid fa-circle-xmark fa-xl" style="color: #c30909;"></i> Oops! The correct answer is ${correctAnswer}`;
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
function displayNextQuestion(data) {
  if (
    !quizCompleted &&
    Array.isArray(data) &&
    currentQuestionIndex < data.length - 1
  ) {
    currentQuestionIndex++;

    // Reset the progress bar
    clearInterval(progressInterval);
    progressBar.style.transition = "";
    progressBar.style.width = "0%";
    progressBar.setAttribute("aria-valuenow", 0);

    // Reset the timer
    setTimer(15000, displayNextQuestion);
    displayQuizQuestion(data, currentQuestionIndex);
    displayQuizAnswer(data, currentQuestionIndex);
  } else if (
    data &&
    currentQuestionIndex === data.length - 1 &&
    !quizCompleted
  ) {
    // Clear the timer
    clearInterval(progressInterval);
    // Call function to handle end of quiz
    handleEndOfQuiz();
    // Call function to restart the quiz
    restartBtn();
  }
}

function restartBtn() {
  const restartBtn = document.createElement("button");
  restartBtn.textContent = "Restart Quiz";
  restartBtn.classList.add("restart-btn", "mt-5", "p-2");
  restartBtn.addEventListener("click", () => {
    // Clear local storage
    localStorage.clear();
    location.reload();
  });
  quizBody.appendChild(restartBtn);
}

function handleEndOfQuiz() {
  // Get stored answers
  const storedAnswers = localStorage.getItem("Total Correct Answers");
  // Set the default message
  let endOfQuizMessage = `Congratulations!! You have reached the end of the quiz!<br> <br><strong> Total Answers: </strong>`;

  // Check if there are stored answers
  if (storedAnswers !== null && parseInt(storedAnswers) !== 0) {
    endOfQuizMessage += `${storedAnswers}/10`;
  } else {
    endOfQuizMessage += `0/10`;
  }

  // Display the end-of-quiz message
  quizBody.innerHTML = endOfQuizMessage;
  quizBody.classList.add("quiz-body-js");

  // Update the quiz status
  quizCompleted = true;
}

// Set up the timer and start the quiz
function setTimer(duration) {
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

    if (progress >= 100) {
      clearInterval(progressInterval);
      progressBar.style.transition = "width 0.3s ease-in-out";
      progressBar.style.width = "0%";
      progressBar.setAttribute("aria-valuenow", 0);

      setTimeout(() => {
        progressBar.style.transition = "";
        const timeUpModal = new bootstrap.Modal("#exampleModal");
        timeUpModal.show();
        notificationModal.innerHTML = "⏰Time's up!";

        setTimeout(() => {
          console.log("Data in setTimer function:", data);
          timeUpModal.hide();
          displayNextQuestion(data); // Move to the next question after timer ends
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

  fetchQuizData();
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
