// Game object
var game = {
    divs: ["A", "B", "C", "D"], // Array holding the ids for each answer
    questionBank: null,
    question: null, // Variable holding the question string
    answers: [], // Array holding possible answers for current question
    correctIndex: null, // Which index the correct answer is stored in
    selectedIndex: null, // Index of that answer the user picked
    correctNum: 0,
    incorrectNum: 0,
    unansweredNum: 0,
    time: 15, // Number of seconds before user runs out of time
    numQuestions: 20, // Number of questions to ask
    ready: false,
    buttonsActive: false, // Flags whether buttons are active or not
    timer: null,
    correct: false,
    bgFX: null,
    lockedInFX: null,
    correctFX: null,
    wrongFX: null,

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
        var queryURL = "https://opentdb.com/api.php?amount=" + this.numQuestions + "&category=9&difficulty=easy&type=multiple";

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

    // Populates variables with the question and answers
    newQuestion: function() {
        var q = this.questionBank.pop();
        this.question = q.question;
        this.answers = q.incorrect_answers;

        // Insert the correct answer to a random index of the answers array
        this.correctIndex = Math.floor(Math.random() * 4);
        this.answers.splice(this.correctIndex, 0, q.correct_answer);
    },

    // Displays the current question and answers
    displayQuestion: function() {
        $("#question").html(this.question);

        var boxes = ["A", "B", "C", "D"];
        for (var i = 0; i < this.answers.length; i++) {
            console.log(boxes[i] + ": " + this.answers[i]);
            $("#" + boxes[i] + " > .qString").html(this.answers[i]);
        }

        game.display();
        game.startTimer(); // Start timer
        game.bgFX.currentTime = 0;
        game.bgFX.play();

        console.log("Answer: " + game.answers[game.correctIndex]);
        this.buttonsActive = true; // Enable event handler after everything is rendered
    },

    // Checks the user's answer, outOfTime should be 'true' if the user ran out of time
    checkAnswer: function(id, outOfTime) {
        game.bgFX.pause();

        // Disable any additional events until this one is handled
        game.buttonsActive = false;
        game.timer.stop();

        var text;
        this.correct = false;

        // Check if user was out of time
        if (outOfTime) {
            console.log("OUT OF TIME!");
            text = "OUT OF TIME!<p>The correct answer is '" + this.answers[this.correctIndex] + "'.</p>";
            this.unansweredNum++;
        } else {
            // Keep selected answer highlighted
            $("#" + id).addClass("selected");

            // Check if index of clicked div matches the index for correct answer
            this.selectedIndex = this.divs.indexOf(id);
            if (this.selectedIndex === this.correctIndex) {
                console.log("CORRECT!");
                text = "CORRECT!";
                this.correctNum++;
                this.correct = true;
            } else {
                console.log("WRONG!");
                text = "WRONG!<p>The correct answer is '" + this.answers[this.correctIndex] + "'.</p>";
                this.incorrectNum++;
                $("#" + id).removeClass("selected");
                this.correct = false;
            }
        }

        this.fadeOut(id);

        // Display result immediately if user ran out of time
        if (outOfTime){
             $("#question").html(text);
             game.wrongFX.play();
        }
        // Display result after a delay if user picked an answer
        setTimeout(function() {
            var answerDiv = $("#" + game.divs[game.selectedIndex]);
            $("#question").html(text);
            answerDiv.removeClass("selected");

            // Add green/red coloring
            if (game.correct) {
                answerDiv.addClass("correct");
                game.correctFX.play();
            } else {
                answerDiv.addClass("wrong");
                game.wrongFX.play();
            }

            // Check if any questions left
            if (game.questionBank.length > 0) {
                setTimeout(function() {
                    var answerDiv = $("#" + game.divs[game.selectedIndex]);

                    // Clear green/red coloring
                    answerDiv.removeClass("correct");
                    answerDiv.removeClass("wrong");

                    game.newQuestion();
                    game.displayQuestion();
                    game.display();
                }, 4000);
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

    // Fade answers out except for the given id
    fadeOut: function(id) {
        $("#countdown").addClass("m-fadeOut");
        for (var i = 0; i < this.divs.length; i++) {
            if (this.divs[i] != id) {
                $("#" + this.divs[i]).addClass("m-fadeOut");
            }
        }
    },

    // Display text boxes
    display: function() {
        $("#countdown").removeClass("m-fadeOut");
        $(".textBox").removeClass("m-fadeOut");
    }
};

// GAME START
$(document).ready(function() {
    // Initialize audio
    game.bgFX = new Audio('assets/audio/bg.mp3');
    game.lockedInFX = new Audio('assets/audio/locked_in.mp3');
    game.correctFX = new Audio('assets/audio/correct.mp3');
    game.wrongFX = new Audio('assets/audio/wrong.mp3');

    // Initialize timer
    // Note: I know how to use setInterval, but I'm using this jQuery plugin for the timer because
    // it makes it easier to display a circular countdown timer
    game.timer = $("#countdown").countdown360({
        radius: 60,
        seconds: game.time,
        fillStyle: '#2e2da2',
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
            game.lockedInFX.play();
            game.checkAnswer($(this).attr('id'), false);
        }
    });
});
