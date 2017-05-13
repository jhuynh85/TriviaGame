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
    numQuestions: 8, // Number of questions to ask
    roundCount: 0,
    ready: false,
    buttonsActive: false, // Flags whether buttons are active or not
    timer: null,
    correct: false, // Flags whether user choice was correct or not
    fiftyCount: 1, // Number of 50:50 uses left
    fiftyUsed: false, // Flags whether 50:50 was used this round
    bgFX: null,
    lockedInFX: null,
    correctFX: null,
    wrongFX: null,
    outroFX: null,
    introFX: null,
    fiftyFX: null,

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
        this.roundCount = 0;
        this.fiftyCount = 1;
        this.fiftyUsed = false;
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

        this.fiftyUsed = false;
        this.roundCount++;
        this.display();
        this.startTimer(); // Start timer
        this.bgFX.currentTime = 0;
        this.bgFX.play();

        console.log("Answer: " + game.answers[game.correctIndex]);
        this.buttonsActive = true; // Enable event handler after everything is rendered
    },

    // Checks the user's answer, outOfTime should be 'true' if the user ran out of time
    checkAnswer: function(id, outOfTime) {
        this.bgFX.pause();

        // Disable any additional events until this one is handled
        this.buttonsActive = false;
        this.timer.stop();

        var text;
        this.correct = false;
        var delay = 2500; // Delay before results are displayed

        // Check if user was out of time
        if (outOfTime) {
            console.log("OUT OF TIME!");
            text = "OUT OF TIME!<p>The correct answer is '" + this.answers[this.correctIndex] + "'.</p>";
            this.unansweredNum++;
            this.selectedIndex
            delay = 0; // No delay if user ran out of time
            // Hide all answers and timer immediately
            $("#A,#B,#C,#D,#countdown").css('visibility', 'hidden');
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
            this.fadeOut(id);
        }

        // Display result after a delay
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
                    answerDiv.removeClass("correct wrong");

                    game.newQuestion();
                    game.displayQuestion();
                }, 3500);
            }

            // Display scoreboard
            else {
                setTimeout(function() {
                    var answerDiv = $("#" + game.divs[game.selectedIndex]);
                    // Clear green/red coloring
                    answerDiv.removeClass("correct wrong");
                    game.gameOver();
                }, 3500);
            }
        }, delay);
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
        $("#countdown, #rounds, .textBox").removeClass("m-fadeOut");
        $(".textBox").css('visibility', 'visible');
        $("#rounds").text(this.roundCount + "/" + this.numQuestions);

        if (this.fiftyCount > 0){
            $("#fifty").removeClass("m-fadeOut");
        } else {
            $("#fifty").css('visibility', 'hidden');
        }
    },

    // Displays score and restart button
    gameOver: function() {
        // Play theme
        this.outroFX.currentTime = 0;
        this.outroFX.play();

        // Hide answer divs and 50-50 button in case any are still visible
        $("#A, #B, #C, #D, #fifty").css('visibility', 'hidden');

        // Display stats
        $("#question").text("GAME OVER!");
        var correct = $("<div>").html("Correct: " + this.correctNum);
        var incorrect = $("<div>").html("Incorrect: " + this.incorrectNum);
        var unanswered = $("<div>").html("Unanswered: " + this.unansweredNum);
        $("#question").append(correct, incorrect, unanswered);

        // Display restart button
        $("#rounds").text("RESTART");
        $("#rounds").addClass("textBox clickable");

        // Restart button click handler
        $("#rounds").on('click', function() {
            game.reset();
            game.getQuestions();

            // Delay in order have time to retrieve new questions from API
            setTimeout(function() {
                game.newQuestion();
                game.displayQuestion();
                game.outroFX.pause();
            }, 2500);

            // Remove click handler
            $(this).off();
            $(this).addClass("m-fadeOut");
            // Remove styling after button has completely faded out
            setTimeout(function() {
                $("#rounds").removeClass("textBox clickable");
            }, 2000);
        });
    },

    // Removes two incorrect answers
    fifty: function(){
        this.fiftyUsed = true;
        this.fiftyCount--;
        this.fiftyFX.play();

        // Hide two random incorrect answers
        var arr = [];
        while (arr.length < 2){
            var index = Math.floor(Math.random() * 4);

            if (index != this.correctIndex && arr.indexOf(index) < 0){
                arr.push(index);
                $("#"+this.divs[index]).addClass("m-fadeOut");
                console.log("Removing index: "+index);
            }
        }

        // Hide button if no uses left
        if (this.fiftyCount === 0){
            $("#fifty").addClass("m-fadeOut");
        }
    }
};

// GAME START
$(document).ready(function() {
    // Initialize audio
    game.introFX = new Audio('assets/audio/transition.mp3');
    game.outroFX = new Audio('assets/audio/outro.mp3');
    game.bgFX = new Audio('assets/audio/bg.mp3');
    game.lockedInFX = new Audio('assets/audio/locked_in.mp3');
    game.correctFX = new Audio('assets/audio/correct.mp3');
    game.wrongFX = new Audio('assets/audio/wrong.mp3');
    game.fiftyFX = new Audio('assets/audio/50_50.mp3');

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
    $("#rounds").on('click', function() {
        // Make sure questions have been retrieved from API before starting
        if (game.ready) {
            game.introFX.play();
            $(this).off();
            $("#logo").addClass("m-fadeOut");
            $(this).addClass("m-fadeOut");
            setTimeout(function() {
                game.introFX.pause();
                $("#rounds").removeClass("textBox clickable");
                game.newQuestion();
                game.displayQuestion();
            }, 3000);

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

    // User clicks 50:50
    $("#fifty").on('click', function(){
        if (game.buttonsActive && !game.fiftyUsed) {
            game.fifty();
        }
    });
});
