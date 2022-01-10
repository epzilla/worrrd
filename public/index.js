let gameState = {
  boardState: ["", "", "", "", "", ""],
  evaluations: [[], [], [], [], [], []],
  gameStatus: "IN_PROGRESS",
  hardMode: false,
  lastCompletedTs: null,
  lastPlayedTs: null,
  rowIndex: 0,
};

let acceptableKeys = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "Enter",
  "Delete",
  "Backspace",
];

const savedState = localStorage.getItem("gameState");

if (savedState) {
  gameState = JSON.parse(savedState);
}

gameState.boardState.forEach((row, rowIndex) => {
  if (row.length) {
    if (gameState.evaluations[rowIndex]?.length) {
      gameState.rowIndex = rowIndex + 1;
    }
    row.split("").forEach((letter, cellIndex) => {
      const cell = document.getElementById(`${rowIndex}-${cellIndex}`);
      const backSide = document.getElementById(`${rowIndex}-${cellIndex}-back`);
      cell.innerHTML = letter;
      backSide.innerHTML = letter;
      backSide.classList.add(gameState.evaluations[rowIndex][cellIndex]);
      backSide.parentElement.classList.add("reveal");
    });
  }
});

function animateLetter(rowIndex, key) {
  const cell = document.getElementById(
    `${rowIndex}-${gameState.boardState[rowIndex].length - 1}`
  );
  const backSide = document.getElementById(
    `${rowIndex}-${gameState.boardState[rowIndex].length - 1}-back`
  );
  cell.innerHTML = key;
  backSide.innerHTML = key;
  cell.parentElement.classList.add("pop");
  setTimeout(() => {
    cell.parentElement.classList.remove("pop");
  }, 50);
}

function deleteLetter(rowIndex) {
  const cell = document.getElementById(
    `${rowIndex}-${gameState.boardState[rowIndex].length}`
  );
  const backSide = document.getElementById(
    `${rowIndex}-${gameState.boardState[rowIndex].length}-back`
  );
  cell.innerHTML = "";
  backSide.innerHTML = "";
}

function getFakeEval(word) {
  let fakeEval = [];
  for (let i = 0; i < word.length; i++) {
    const random = Math.floor(Math.random() * 3);
    if (random === 0) {
      fakeEval.push("nope");
    } else if (random === 1) {
      fakeEval.push("sorta");
    } else {
      fakeEval.push("yep");
    }
  }
  return Promise.resolve(fakeEval);
}

function animateRow(rowIndex) {
  const cells = Array.from(
    document.querySelectorAll(`#row-${rowIndex} .cell-wrapper`)
  );
  for (let i = 0; i < cells.length; i++) {
    setTimeout(() => cells[i].classList.add("reveal"), i * 500);
  }
}

async function submit(rowIndex) {
  const body = await fetch("/check-word", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ word: gameState.boardState[rowIndex] }),
  });
  const { wordEval, match } = await body.json();
  gameState.evaluations[rowIndex] = wordEval;
  wordEval.forEach((val, cellIndex) => {
    const cell = document.getElementById(`${rowIndex}-${cellIndex}-back`);
    cell.classList.add(val);
  });
  animateRow(rowIndex);
  if (match) {
    gameState.gameStatus = "WIN";
    setTimeout(() => {
      alert("WOOHOOOOOO!");
    }, 2500);
  }
}

document.addEventListener("keyup", (e) => {
  if (acceptableKeys.includes(e.key)) {
    let currentLine = gameState.boardState[gameState.rowIndex];
    switch (e.key) {
      case "Enter":
        if (currentLine?.length === 5) {
          submit(gameState.rowIndex);
          gameState.rowIndex++;
          gameState.lastCompletedTs = Date.now();
        }
        break;
      case "Delete":
      case "Backspace":
        if (currentLine?.length > 0) {
          currentLine = currentLine.slice(0, -1);
          gameState.boardState[gameState.rowIndex] = currentLine;
          deleteLetter(gameState.rowIndex);
        }
        break;
      default:
        const lowerKey = e.key.toLowerCase();
        if (currentLine.length < 5) {
          currentLine += lowerKey;
        } else {
          currentLine[currentLine.length - 1] = lowerKey;
        }
        gameState.boardState[gameState.rowIndex] = currentLine;
        animateLetter(gameState.rowIndex, lowerKey);
        break;
    }
    console.log(gameState);
    localStorage.setItem("gameState", JSON.stringify(gameState));
  }
});
