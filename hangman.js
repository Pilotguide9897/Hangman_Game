// import { hangmanHelpers } from "./Assets/Libraries/GameController.js";

let globalReferences = {
  hangman: null,
  lexicon: null,
};

window.onload = function () {
  FetchVocabularyData();
  // let displayCategoriesButton = document.querySelector("#displayCategoriesBtn");
  // displayCategoriesButton.addEventListener("click", function () {
  //   DisplayGameCategories(hangmanData);
  // });
  globalReferences.displayCategoriesButton = document.querySelector(
    "#displayCategoriesBtn"
  );
  globalReferences.displayCategoriesButton.addEventListener(
    "click",
    function () {
      DisplayGameCategories(globalReferences.hangmanData);
    }
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
      console.log(globalReferences.hangmanData);
      // DisplayGameCategories(hangmanData);
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

function DisplayGameCategories(vocabularyData) {
  let JSONgameData = JSON.parse(vocabularyData);
  let gameData = JSONgameData.vocabularies;
  // let categorySection = document.querySelector(".category-selection-area");
  globalReferences.categorySection = document.querySelector(
    ".category-selection-area"
  );
  let categorySectionHTML = "";
  for (let index = 0; index < gameData.length; index++) {
    categorySectionHTML += `<label for="${gameData[index].categoryName}">${gameData[index].categoryName}: </label>`;
    categorySectionHTML += `<input type="radio" name="categories" id="${gameData[index].categoryName}" value="${gameData[index].categoryName}"><br>`;
  }
  categorySectionHTML += `<button type="button" class="btn btn-success" id="okBtn">OK</button>`;
  globalReferences.categorySection.innerHTML = categorySectionHTML;

  let okayButton = document.querySelector("#okBtn");
  okayButton.addEventListener("click", GatherWordOptions);
}

// Code for getting the vocabulary information.
function GatherWordOptions() {
  let gameData = JSON.parse(globalReferences.hangmanData);
  console.log(gameData.vocabularies);

  // Check to make sure that a radio button has been selected.
  let selectedGameCategory = document.querySelector(
    ".category-selection-area input[type = 'radio']:checked"
  ).value;
  console.log(selectedGameCategory);
  if (selectedGameCategory != null) {
    for (const vocabulary of gameData.vocabularies) {
      console.log(vocabulary);
      if (vocabulary.categoryName === selectedGameCategory) {
        globalReferences.lexicon = vocabulary.words;
      }
    }
    console.log("Lexicon: ", globalReferences.lexicon);
  }
  let word = GetSingleWord(globalReferences.lexicon);
  GameController.newGame(word);
  globalReferences.categorySection.classList.add("d-none");
}

function GetSingleWord(wordArray) {
  let wordOptions = wordArray;
  let word = wordOptions[Math.floor(Math.random() * wordOptions.length)];
  console.log(word);
}
