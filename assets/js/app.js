// Game object
var game = {
    questionBank: null,
    question: null, // Variable holding the question string
    answers: [], // Array holding possible answers for current question
    correctIndex: null, // Which index the correct answer is stored in
    correctNum: 0,
    incorrectNum: 0,
    unansweredNum: 0,
    time: 15, // Number of seconds before user runs out of time
    numQuestions: 20, // Number of questions to ask
    ready: false,
    buttonsActive: false, // Flags whether buttons are active or not
    timer: null,

    // Initializes game variables
    reset: function() {
        this.correctNum = 0;
        this.incorrectNum = 0;
        this.unansweredNum = 0;
        this.question = "";
        this.answers = [];
        this.correctAnswer = "";
        this.ready = false;
        this.buttonsActive = false;
    },

    // Get questions from Open Trivia API
    getQuestions: function() {
        var queryURL = "http://opentdb.com/api.php?amount=" + this.numQuestions + "&category=9&difficulty=easy&type=multiple";

        $.ajax({
            url: queryURL,
            method: "GET"
        }).done(function(response) {
            console.log("Response code: " + response.response_code);
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

        game.slideIn();

        game.startTimer();  // Start timer

        console.log("Answer: " + game.answers[game.correctIndex]);
        this.buttonsActive = true; // Enable event handler
    },

    // Checks the user's answer, outOfTime should be 'true' if the user ran out of time
    checkAnswer: function(id, outOfTime) {
        // Disable any additional events until this one is handled
        game.buttonsActive = false;
        game.timer.stop();

        var answers = ["A", "B", "C", "D"];
        var text;   

        // Check if user was out of time
        if (outOfTime) {
            console.log("OUT OF TIME!");
            text = "OUT OF TIME!<p>The correct answer is '" + this.answers[this.correctIndex] + "'.</p>";
            this.unansweredNum++;
        } else {
            // Check if index of clicked div matches the index for correct answer
            if (answers.indexOf(id) === this.correctIndex) {
                console.log("CORRECT!");
                text = "CORRECT!";
                this.correctNum++;
            } else {
                console.log("WRONG!");
                text = "WRONG!<p>The correct answer is '" + this.answers[this.correctIndex] + "'.</p>";
                this.incorrectNum++;
            }
        }

        this.slideOut();
        setTimeout(function() {
            $("#question").html(text);
            $("#question").show();

            // Check if any questions left
            if (game.questionBank.length > 0) {
                setTimeout(function() {
                    game.newQuestion();
                    game.displayQuestion();
                    game.slideIn();
                }, 5000);
            }

            // Display scoreboard
            else {

            }
        }, 2500);
    },

    // Starts timer
    startTimer: function() {
        this.timer.start();
    },


    // Fades text boxes out
    slideOut: function() {
        $("#countdown").addClass("m-fadeOut");
        $(".textBox").fadeOut(2000);
    },

    // Fades text boxes in
    slideIn: function() {
        $("#countdown").removeClass("m-fadeOut");
        $(".textBox").fadeIn();
    }
};

// GAME START
$(document).ready(function() {
    // Initialize timer
    game.timer = $("#countdown").countdown360({
        radius: 60,
        seconds: game.time,
        fillStyle: '#3131ff',
        strokeStyle: '#ffffff',
        fontSize: 50,
        fontColor: '#ffffff',
        autostart: false,
        smooth: true,
        label: ["second", "seconds"],
        onComplete: function() {
            game.checkAnswer("", true);
        }
    });

    // Retrieve questions from API
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
        if (game.buttonsActive) {
            game.checkAnswer($(this).attr('id'), false);
        }
    });
});
