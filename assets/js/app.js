// Game object
var game = {
    questionBank: null,
    question: null,         // Variable holding the question string
    answers: [],            // Array holding possible answers for current question
    correctAnswer: "",      // Variable holding the correct answer string      
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    time: 15,           // Number of seconds before user runs out of time
    numQuestions: 8,    // Number of questions to ask

    // Initializes game variables
    reset: function() {
        this.correct = 0;
        this.incorrect = 0;
        this.unanswered = 0;
        this.question = "";
        this.answers = [];
        this.correctAnswer = "";
    },

    // Get questions from Open Trivia API, returns true if successful
    getQuestions: function() {
        var queryURL = "http://opentdb.com/api.php?amount=" + numQuestions + "&category=9&difficulty=easy&type=multiple";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).done(function(response) {
            // Status code 0 = success
            if (response.response_code === 0) {
                game.questionBank = response.results;
                return true;
            } else {
                console.log("Error retrieving questions!");
                return false;
            }
        });
    },

    // Populates object variables with the question and answers
    newQuestion: function() {
        var q = questionBank.pop();
        this.question = q.question;
        this.answers = q.incorrect_answers;
        this.correctAnswer = q.correct_answer;

        // Insert the correct answer to a random index of the answers array
        this.answers.splice(Math.floor(Math.random()*4), 0, this.correctAnswer);
    },

    // Displays the current question
    displayQuestion: function() {

    }
};

// GAME START
$(document).ready(function() {
    // User clicks Start button
    $("#startBtn").on('click', function() {
        $("#startBtn").hide();
    });
});
