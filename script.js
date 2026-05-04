let sequence = [];
let userSequence = [];
let level = 1;
let score = 0;
let boxes = [];

const grid = document.getElementById("grid");

// Create 9 boxes
for (let i = 0; i < 9; i++) {
let div = document.createElement("div");
div.classList.add("box");
div.dataset.index = i;

div.addEventListener("click", () => handleClick(i));
grid.appendChild(div);
boxes.push(div);
}

function startGame() {
sequence = [];
level = 1;
score = 0;
nextRound();
}

function nextRound() {
userSequence = [];
document.getElementById("level").innerText = level;

let randomIndex = Math.floor(Math.random() * 9);
sequence.push(randomIndex);

showSequence();
}

function showSequence() {
let i = 0;

let interval = setInterval(() => {
let box = boxes[sequence[i]];
box.classList.add("active");

```
setTimeout(() => box.classList.remove("active"), 500);

i++;
if (i >= sequence.length) clearInterval(interval);
```

}, 800);
}

function handleClick(index) {
userSequence.push(index);

let current = userSequence.length - 1;

if (userSequence[current] !== sequence[current]) {
alert("Game Over!");
return;
}

if (userSequence.length === sequence.length) {
score++;
level++;

```
document.getElementById("score").innerText = score;

setTimeout(nextRound, 1000);
```

}
}
