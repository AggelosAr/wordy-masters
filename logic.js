
const WORD_URL = "https://words.dev-apis.com/word-of-the-day";
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word";

const loading = document.querySelector('.loading');
const gameBoard = document.querySelector('.game-board');
const allLetters = document.querySelectorAll('.letter');

const RAINBOW = "rainbow-anime";
const WRONG_ANSWER_ANIMATION = "wrong-answer";
const FREEZE = 1500;


// Toggle off the key listener
let toggle = true;

let correctLetters = {};
let correctWord = "";

// Optional add a word here , else it will try to get the word from the server
const testWord = "";

const GAMEOVER = 6;
const WORD_LEN = 5;

let guessCount = 0;
let currentWord = [];

// Add keyboard listener on doc if the user has clicked on the GAME BOARD
// ## TODO ## If the user clicks away in the meantime we must DISABLE THIS 
// Defocus game board in click elsewhere
gameBoard.addEventListener('click', (event)=> {
    //console.log('CLICKED THE GAME BOARD MUST FOCUS NOW!');
});

document.addEventListener("keydown", (event) => {
    handleGame(event.key);
});

getWord(testWord);

async function handleGame(letter) {
    if (!toggle) {
        return;
    }
    if ((letter === "Enter") && (currentWord.length == WORD_LEN)){
        toggle = false;
        loading.style.opacity = 1;
        let validation = await validateWord();
        if (validation){
            showWinnerScreen();
            return ;
        }
        if (guessCount == GAMEOVER){
            showLoserScreen();
            return ;
        }
        toggle = true;
        loading.style.opacity = 0;
    }
    else if (letter === "Backspace") {
        currentWord.pop();
        modifyBoardLetter("");
    }
    else if (isLetter(letter)){
        if (currentWord.length == WORD_LEN){
            currentWord.pop();
        }
        letter = letter.toUpperCase();
        modifyBoardLetter(letter);
        currentWord.push(letter);
    }
}

async function validateWord() {
   
    let wordExists = await checkExistence();
    if (!wordExists){
        // action -> used to differentiate between adding and removing the animation
        // add class animation to the row 
        triggerError(1);
        // freeze for ~2 sec for the animation to go off
        await new Promise(r => setTimeout(r, FREEZE));
        // remove the animation class
        triggerError(0);
        return false;
    }
    const isWin = currentWord.join('') === correctWord;
    // Fill up the greens first 
    iterateGreens(isWin);
    // Fill up the rest
    if (!isWin)
    {
        iterateElse();
    }
    guessCount += 1;
    currentWord = [];
    return isWin;
}

async function triggerError(action) {
    currentWord.forEach((letter, idx) => {
        if (action == 1){
            allLetters[ flattenIdx() - WORD_LEN + idx ].classList.add(WRONG_ANSWER_ANIMATION);
        }
        else{
            allLetters[ flattenIdx() - WORD_LEN + idx ].classList.remove(WRONG_ANSWER_ANIMATION);
        }
        
    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function flattenIdx() {
    return (guessCount * WORD_LEN) + currentWord.length;
}

function modifyBoardLetter(letter) {
    allLetters[flattenIdx()].innerText = letter;
}

function iterateGreens(flag){
    currentWord.forEach((letter, idx) => {
        if (flag) {
            allLetters[ flattenIdx() - currentWord.length + idx ].style.backgroundColor = "green";
        }
        else if (letter in correctLetters){
            if ((letter === correctWord[idx]) && (letter in correctLetters)) {
                allLetters[ flattenIdx() - currentWord.length + idx ].style.backgroundColor = "green";
            }
        }
    });
}

function iterateElse(){
    currentWord.forEach((letter, idx) => {
        let color = "grey";
        if (letter in correctLetters){
            
            color = "yellow";
            
        }
        // Change it ONLY it is not changed else leave it alone.
        const currentCol = allLetters[ flattenIdx() - currentWord.length + idx ].style.backgroundColor;
        if (currentCol !== "green"){
            allLetters[ flattenIdx() - currentWord.length + idx ].style.backgroundColor = color;
        }
    });
}

function showWinnerScreen(){
    let delay = 0;
    document.querySelectorAll('*').forEach((el) => {
        el.classList.add(RAINBOW);
        
        el.style.animationDelay = `${delay}ms`;
        delay += 400;
        }
    );
    allLetters.forEach((el) => {
        el.classList.add("spinner");
        }
    );
    
}

function showLoserScreen(){
    console.log('REFRESH LOSER');
    return;
}

async function getWord(optionalWord){
    toggle = false;
    loading.style.opacity = 1;


    let promisedWord = optionalWord;
    let word = optionalWord;
    
    if (optionalWord === "") {
        const promise = await fetch(WORD_URL);
        promisedWord = await promise.json();
        word = promisedWord.word.toUpperCase();
    }
    
    for (const char of word) {
        if (correctLetters[char]) {
            correctLetters[char]++;
        } else {
            correctLetters[char] = 1;
        }
    }
    correctWord = word;
    toggle = true;
    loading.style.opacity = 0;
}

function initWord(word) {

}

async function checkExistence(){
    const promise = await fetch(VALIDATE_WORD_URL, {
        method: "POST",
        body: JSON.stringify(
            {
                word: currentWord.join('')
            }),
        headers: 
            {
                "Content-type": "application/json; charset=UTF-8"
            }
      })
      const res = await promise.json();
      const validWord = res.validWord;
      return validWord;
}