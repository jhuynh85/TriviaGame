// Game object
var game = {
    questionBank: null,
    question: null,         // Variable holding the question string
    answers: [],            // Array holding possible answers for current question
    correctIndex: null,     // Which index the correct answer is stored in
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    time: 15,               // Number of seconds before user runs out of time
    numQuestions: 20,        // Number of questions to ask
    ready: false,
    inProgress: false,      // Flags whether buttons are active or not
    
    // Initializes game variables
    reset: function() {
        this.correct = 0;
        this.incorrect = 0;
        this.unanswered = 0;
        this.question = "";
        this.answers = [];
        this.correctAnswer = "";
        this.ready = false;
        this.inProgress = false;
    },

    // Get questions from Open Trivia API
    getQuestions: function() {
        var queryURL = "http://opentdb.com/api.php?amount=" + this.numQuestions + "&category=9&difficulty=easy&type=multiple";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).done(function(response) {
            console.log("Response code: "+response.response_code);
            // Status code 0 = success
            if (response.response_code === 0) {
                game.questionBank = response.results;
                game.ready = true;
            } else {
                console.log("Error retrieving questions!");
                game.ready = false;
            }
        });
    },

    // Populates object variables with the question and answers
    newQuestion: function() {
        var q = this.questionBank.pop();
        this.question = q.question;
        this.answers = q.incorrect_answers;

        // Insert the correct answer to a random index of the answers array
        this.correctIndex = Math.floor(Math.random() * 4);
        this.answers.splice(this.correctIndex, 0, q.correct_answer);
    },

    // Displays the current question
    displayQuestion: function() {
        $("#question").html(this.question);

        var boxes = ["A", "B", "C", "D"];
        for (var i = 0; i < this.answers.length; i++) {
            console.log(boxes[i] + ": " + this.answers[i]);
            $("#" + boxes[i] + " > .qString").html(this.answers[i]);
        }

        console.log("Answer: "+game.answers[game.correctIndex]);
        this.inProgress = true;
    },

    // Correct answer
    correct: function() {

    },

    // Wrong answer
    wrong: function() {

    }
};

// GAME START
$(document).ready(function() {
    game.getQuestions();

    // User clicks Start button
    $("#startBtn").on('click', function() {
        // Make sure questions have been retrieved from API before starting
        if (game.ready) {
            // $("#startBtn").hide();
            game.newQuestion();
            game.displayQuestion();
        } else {
            alert("Error retrieving questions from Open Trivia API, please refresh the page and try again!");
        }
    });

    // User clicks an answer
    $("#A, #B, #C, #D").on('click', function() {
        if (game.inProgress) {
            var answers = ["A","B","C","D"];
            // Check if index of clicked div matches the index for correct answer
            if (answers.indexOf($(this).attr('id')) === game.correctIndex) {
                console.log("CORRECT!");
            } else {
                console.log("WRONG!");
            }
        }
    });
});
