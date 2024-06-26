// import { hangmanHelpers } from "./Assets/Libraries/GameController.js";

let globalReferences = {
  hangman: null,
  lexicon: null,
  guessesRemaining: null,
  HANGMANASCII: [
    "<img src ='Images/HangmanAscii1.png' />",
    "<img src = 'Images/HangmanAscii2.png' />",
    "<img src = 'Images/HangmanAscii3.png' />",
    "<img src = 'Images/HangmanAscii4.png' />",
    "<img src = 'Images/HangmanAscii5.png' />",
    "<img src = 'Images/HangmanAscii6.png' />",
    "<img src = 'Images/HangmanAscii7.png' />",
  ],
};

window.onload = function () {
  FetchVocabularyData();
  globalReferences.displayCategoriesButton = document.querySelector(
    "#displayCategoriesBtn"
  );
  globalReferences.displayCategoriesButton.addEventListener(
    "click",
    function () {
      DisplayGameCategories(globalReferences.hangmanData);
    }
  );
  globalReferences.categorySection = document.querySelector(
    ".category-selection-area"
  );
};

// Global Variable to hold the fetch data to make it accessable everywhere.
// let hangmanData;
// let lexicon;

function FetchVocabularyData() {
  let url = "./Assets/Data/vocabularies.json";
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      globalReferences.hangmanData = xhr.responseText;
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

function DisplayGameCategories(vocabularyData) {
  let JSONgameData = JSON.parse(vocabularyData);
  let gameData = JSONgameData.vocabularies;
  let categorySectionHTML = "";
  for (let index = 0; index < gameData.length; index++) {
    categorySectionHTML += `<label for="${gameData[index].categoryName}">${gameData[index].categoryName}: </label>`;
    categorySectionHTML += `<input type="radio" class="ms-3" name="categories" id="${gameData[index].categoryName}" value="${gameData[index].categoryName}"><br>`;
  }
  categorySectionHTML += `<button type="button" class="btn btn-info mt-3 mb-3 border-dark" id="okBtn">OK</button>`;
  globalReferences.categorySection.innerHTML = categorySectionHTML;

  let okayButton = document.querySelector("#okBtn");
  okayButton.addEventListener("click", GatherWordOptions);
}

// Code for getting the vocabulary information.
function GatherWordOptions() {
  let gameData = JSON.parse(globalReferences.hangmanData);

  // Check to make sure that a radio button has been selected.
  let selectedGameCategory = document.querySelector(
    ".category-selection-area input[type = 'radio']:checked"
  ).value;
  if (selectedGameCategory != null) {
    for (const vocabulary of gameData.vocabularies) {
      if (vocabulary.categoryName === selectedGameCategory) {
        globalReferences.lexicon = vocabulary.words;
      }
    }
  }
  let word = GetSingleWord(globalReferences.lexicon);
  GameController.newGame(word);

  globalReferences.guessesRemaining = GameController.report().guessesRemaining;
  globalReferences.categorySection.classList.add("d-none");

  globalReferences.wordSpaceRow = document.querySelector("#word-spaces");
  // Create the space for the word
  for (let i = 0; i < word.length; i++) {
    globalReferences.wordSpaceRow.innerHTML += `<div class="card-body d-inline col-auto p-5 border border-dark text-center" id="letter-space">
    <h3 class="d-none">${word[i].toUpperCase()}</h3></div>`;
  }
  globalReferences.guessesRemainingCounter = document.querySelector(
    "#remainingGuessCount"
  );
  globalReferences.guessesRemainingCounter.innerText =
    globalReferences.guessesRemaining;

  ManageHangmanGraphic();

  // Display the 'New Game' button
  globalReferences.newGameButton = document.querySelector("#newGameBtn");
  globalReferences.newGameButton.addEventListener("click", NewGame);
  globalReferences.newGameButton.classList.remove("d-none");
  globalReferences.newGameButton.classList.add("disabled");
  globalReferences.displayCategoriesButton.classList.add("disabled");
  globalReferences.guessesRemainingCounter.classList.remove("d-none");

  // Only start to process clicks once the word squares have been rendered.
  globalReferences.letterChoiceButtons =
    document.querySelector(".letter-choices");
  globalReferences.letterChoiceButtons.addEventListener(
    "click",
    CaptureLetterSelection
  );
  document.addEventListener("keydown", CaptureLetterSelection);
}

function GetSingleWord(wordArray) {
  let wordOptions = wordArray;
  let word = wordOptions[Math.floor(Math.random() * wordOptions.length)];
  return word;
}

function CaptureLetterSelection(e) {
  globalReferences.letterButtons = document.querySelectorAll(".letter button");
  if (e.type === "keydown") {
    // Select the button that matches the pressed key
    for (let i = 0; i < globalReferences.letterButtons.length; i++) {
      if (
        globalReferences.letterButtons[i].dataset.character === e.key &&
        !globalReferences.letterButtons[i].classList.contains("disabled")
      ) {
        globalReferences.letterButtons[i].classList.add("disabled");
        GameController.processLetter(e.key.toUpperCase());
        globalReferences.guessesRemainingCounter.innerText =
          GameController.report().guessesRemaining;
        // Show the character if it matches!
        DisplayCharacter(e.key);
      }
    }
  } else {
    // I cannot figure out why the disabled class is not applied until the second time that a button is clicked on. I have tried for hours and I cannot find a solution. I do not know the cause or the solution.
    if (!e.target.classList.contains("disabled")) {
      GameController.processLetter(e.target.innerText.toUpperCase());
      globalReferences.guessesRemainingCounter.innerText =
        GameController.report().guessesRemaining;
      DisplayCharacter(e.target.innerText);
      e.target.classList.add("disabled");
      e.target.parentElement.classList.add("disabled");
    }
  }
}

function ManageHangmanGraphic() {
  let hangmanContainer = document.querySelector("#hangmanGraphic");
  let counter = GameController.report().guessesRemaining;
  hangmanContainer.innerHTML = globalReferences.HANGMANASCII[6 - counter];
  hangmanContainer.classList.remove("d-none");
}

function DisplayCharacter(character) {
  globalReferences.displayTiles = document.querySelectorAll("#letter-space h3");

  for (let i = 0; i < globalReferences.displayTiles.length; i++) {
    if (
      globalReferences.displayTiles[i].innerText === character.toUpperCase()
    ) {
      globalReferences.displayTiles[i].classList.remove("d-none");
    } else {
      ManageHangmanGraphic();
    }
  }

  // Set whether to close the game or not.
  if (GameController.report().gameState !== "GAME_IN_PROGRESS") {
    // Do on win
    DisplayResult();
  }
}

function DisplayResult() {
  globalReferences.resultSection = document.querySelector("#resultsSection");
  globalReferences.newGameButton.classList.remove("disabled");
  for (let i = 0; i < globalReferences.letterButtons.length; i++) {
    globalReferences.letterButtons[i].classList.add("disabled");
  }
  if (GameController.report().gameState === "GAME_OVER_LOSE") {
    globalReferences.resultSection.innerHTML = `Lose :( <br /> <img class = "mb-5" src="./Assets/Images/defeat.gif" alt="Defeat" />`;
  } else {
    globalReferences.resultSection.innerHTML = `Win! <br /><img class = "mb-5" src="./Assets/Images/victory.gif" alt="Victory" />`;
  }
}

function NewGame() {
  globalReferences.newGameButton.classList.add("d-none");
  globalReferences.newGameButton.classList.add("disabled");
  globalReferences.categorySection.classList.remove("d-none");
  globalReferences.wordSpaceRow.innerHTML = "";
  globalReferences.resultSection.innerHTML = "";
  document.querySelector("#hangmanGraphic").innerHTML = "";
  globalReferences.guessesRemainingCounter.classList.add("d-none");
  for (let i = 0; i < globalReferences.letterButtons.length; i++) {
    globalReferences.letterButtons[i].classList.remove("disabled");
  }
}
