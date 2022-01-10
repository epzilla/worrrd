const express = require("express");
const words = require("./words");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));
app.post("/check-word", getWordEval);

app.listen(port, () =>
  console.log(`Server running on ${port}, http://localhost:${port}`)
);

const startOfGame = new Date("Sun Jan 09 2022");

function getWordEval(req, res) {
  const { word } = req.body;
  const today = new Date();
  const timeDiffInDays = Math.floor(
    (today.getTime() - startOfGame.getTime()) / (1000 * 60 * 60 * 24)
  );
  const todaysWord = words[timeDiffInDays];
  const wordEval = [];
  for (let i = 0; i < word.length; i++) {
    if (word[i] === todaysWord[i]) {
      wordEval.push("yep");
    } else if (todaysWord.includes(word[i])) {
      wordEval.push("sorta");
    } else {
      wordEval.push("nope");
    }
  }
  return res.send({ wordEval, match: word === todaysWord });
}
