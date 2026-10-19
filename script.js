
const garden = document.getElementById("garden");
const coinsDisplay = document.getElementById("coins");
const carrotsDisplay = document.getElementById("carrots");
const tomatoesDisplay = document.getElementById("tomatoes");
const tomatoSeedsDisplay = document.getElementById("tomatoSeeds");

const dayDisplay = document.getElementById("day");
const messageDisplay = document.getElementById("message");

const dialogue = document.getElementById("dialogue");
const bennyButton = document.getElementById("benny");

const plantButton = document.getElementById("plant");
const waterButton = document.getElementById("water");
const harvestButton = document.getElementById("harvest");
const nextDayButton = document.getElementById("next-day");
const restartButton = document.getElementById("restart");

const CROPS = {
  carrot: {
    name: "Carrot",
    emoji: "🥕",
    seedCost: 3,
    growDays: 2,
    sellPrice: 5
  },
  tomato: {
    name: "Tomato",
    emoji: "🍅",
    seedCost: 5,
    growDays: 3,
    sellPrice: 8
  },
  pumpkin: {
    name: "Pumpkin",
    emoji: "🎃",
    seedCost: 8,
    growDays: 4,
    sellPrice: 14
  }
};

let coins = 20;
let day = 1;
let selectedTool = "plant";
let selectedCrop = "carrot";
let questAccepted = false;
let questCompleted = false;

let inventory = {
  carrot: 0,
  tomato: 0,
  pumpkin: 0
};

let seeds = {
  carrot: 5,
  tomato: 1,
  pumpkin: 0
};

let plots = [];
let nextPlotId = 0;

function showMessage(text) {
  if (messageDisplay) {
    messageDisplay.textContent = text;
  }
}

function makeStartingPlots() {
  plots = [];

  for (let i = 0; i < 12; i++) {
    plots.push({
      id: nextPlotId++,
      crop: null,
      growth: 0,
      watered: false
    });
  }
}

function updateDisplay() {
  if (coinsDisplay) coinsDisplay.textContent = coins;
  if (carrotsDisplay) carrotsDisplay.textContent = inventory.carrot;
  if (tomatoesDisplay) tomatoesDisplay.textContent = inventory.tomato;
  if (tomatoSeedsDisplay) tomatoSeedsDisplay.textContent = seeds.tomato;
  if (dayDisplay) dayDisplay.textContent = day;

  renderGarden();
}

function renderGarden() {
  if (!garden) return;

  garden.innerHTML = "";

  plots.forEach((plot, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "plot";
    button.setAttribute("aria-label", `Garden plot ${index + 1}`);

    if (!plot.crop) {
      button.textContent = "🟫";
      button.title = "Empty plot";
    } else {
      const crop = CROPS[plot.crop];
      const ready = plot.growth >= crop.growDays;

      if (ready) {
        button.textContent = crop.emoji;
      } else if (plot.growth === 0) {
        button.textContent = "🌱";
      } else if (plot.growth === 1) {
        button.textContent = "🌿";
      } else {
        button.textContent = "🪴";
      }

      if (plot.watered) {
        button.textContent += " 💧";
      }

      button.title = `${crop.name}: ${plot.growth}/${crop.growDays} growth days`;
    }

    button.addEventListener("click", () => usePlot(plot.id));
    garden.appendChild(button);
  });
}

function usePlot(plotId) {
  const plot = plots.find(item => item.id === plotId);
  if (!plot) return;

  if (selectedTool === "plant") {
    plantCrop(plot);
  } else if (selectedTool === "water") {
    waterCrop(plot);
  } else if (selectedTool === "harvest") {
    harvestCrop(plot);
  }

  updateDisplay();
}

function plantCrop(plot) {
  if (plot.crop) {
    showMessage("This plot already has a crop growing!");
    return;
  }

  if (seeds[selectedCrop] <= 0) {
    showMessage(`You need ${CROPS[selectedCrop].name.toLowerCase()} seeds first. Visit Benny's shop!`);
    return;
  }

  seeds[selectedCrop]--;
  plot.crop = selectedCrop;
  plot.growth = 0;
  plot.watered = false;

  showMessage(`You planted ${CROPS[selectedCrop].name.toLowerCase()} seeds! Water them to help them grow.`);
}

function waterCrop(plot) {
  if (!plot.crop) {
    showMessage("Plant something here before watering!");
    return;
  }

  if (plot.growth >= CROPS[plot.crop].growDays) {
    showMessage("This crop is ready to harvest!");
    return;
  }

  if (plot.watered) {
    showMessage("This crop has already been watered today.");
    return;
  }

  plot.watered = true;
  showMessage(`You watered your ${plot.crop}! Advance to the next day to help it grow.`);
}

function harvestCrop(plot) {
  if (!plot.crop) {
    showMessage("There's nothing planted here yet.");
    return;
  }

  const crop = CROPS[plot.crop];

  if (plot.growth < crop.growDays) {
    showMessage(`${crop.name}s are still growing. Keep watering them!`);
    return;
  }

  inventory[plot.crop]++;
  showMessage(`You harvested ${crop.emoji} ${crop.name}! You now have ${inventory[plot.crop]}.`);

  plot.crop = null;
  plot.growth = 0;
  plot.watered = false;

  checkQuest();
}

function advanceDay() {
  day++;

  let cropsGrown = 0;

  plots.forEach(plot => {
    if (plot.crop && plot.watered) {
      plot.growth++;
      plot.watered = false;
      cropsGrown++;
    }
  });

  showMessage(
    `Day ${day}! ${cropsGrown} crop(s) grew. Water your plants again to keep them growing.`
  );

  updateDisplay();
}

function chooseTool(tool) {
  selectedTool = tool;

  showMessage(
    tool === "plant"
      ? `Planting mode: choose a crop, then click an empty plot.`
      : tool === "water"
      ? "Watering mode: click a planted crop."
      : "Harvesting mode: click a fully grown crop."
  );
}

function chooseCrop(cropName) {
  if (!CROPS[cropName]) return;

  selectedCrop = cropName;
  selectedTool = "plant";

  showMessage(`Selected ${CROPS[cropName].emoji} ${CROPS[cropName].name}. Click an empty plot to plant it.`);
}

function buySeeds(cropName, amount = 1) {
  const crop = CROPS[cropName];
  if (!crop) return;

  const cost = crop.seedCost * amount;

  if (coins < cost) {
    showMessage(`You need ${cost} coins to buy ${amount} ${crop.name.toLowerCase()} seed(s).`);
    return;
  }

  coins -= cost;
  seeds[cropName] += amount;

  showMessage(`You bought ${amount} ${crop.name.toLowerCase()} seed(s) for ${cost} coins!`);
  updateDisplay();
}

function sellCrop(cropName, amount = 1) {
  const crop = CROPS[cropName];
  if (!crop) return;

  if (inventory[cropName] < amount) {
    showMessage(`You don't have ${amount} ${crop.name.toLowerCase()}(s) to sell.`);
    return;
  }

  inventory[cropName] -= amount;
  const earnings = crop.sellPrice * amount;
  coins += earnings;

  showMessage(`Sold ${amount} ${crop.name.toLowerCase()}(s) for ${earnings} coins!`);
  updateDisplay();
}

function tradeCarrotsForSeed() {
  if (inventory.carrot < 3) {
    showMessage("You need 3 carrots to trade for a tomato seed.");
    return;
  }

  inventory.carrot -= 3;
  seeds.tomato++;

  showMessage("Trade complete! You exchanged 3 carrots for 1 tomato seed.");
  updateDisplay();
}

function tradeMixedCrops() {
  if (inventory.carrot < 2 || inventory.tomato < 1) {
    showMessage("You need 2 carrots and 1 tomato to trade for 15 coins.");
    return;
  }

  inventory.carrot -= 2;
  inventory.tomato--;
  coins += 15;

  showMessage("Trade complete! You exchanged 2 carrots and 1 tomato for 15 coins.");
  updateDisplay();
}

function acceptQuest() {
  if (questCompleted) {
    showMessage("Benny: Thanks again for helping me with my carrot order!");
    return;
  }

  questAccepted = true;
  showMessage("Benny's quest: Bring me 5 carrots and I'll reward you with 25 coins!");
  checkQuest();
}

function checkQuest() {
  if (!questAccepted || questCompleted) return;

  if (inventory.carrot >= 5) {
    inventory.carrot -= 5;
    coins += 25;
    questCompleted = true;
    questAccepted = false;

    showMessage("Quest complete! Benny paid you 25 coins for 5 carrots. Great work!");
    updateDisplay();
  }
}

function openBennyShop() {
  if (!dialogue) {
    showMessage("Benny's Market: use the shop options below the garden.");
    return;
  }

  dialogue.innerHTML = `
    <h2>🌻 Benny's Farm Market</h2>
    <p>Hey farmer! What would you like to do today?</p>

    <h3>🌱 Buy Seeds</h3>
    <button data-action="buy-carrot">🥕 Carrot seed — 3 coins</button>
    <button data-action="buy-tomato">🍅 Tomato seed — 5 coins</button>
    <button data-action="buy-pumpkin">🎃 Pumpkin seed — 8 coins</button>

    <h3>🪙 Sell Crops</h3>
    <button data-action="sell-carrot">Sell carrot — 5 coins</button>
    <button data-action="sell-tomato">Sell tomato — 8 coins</button>
    <button data-action="sell-pumpkin">Sell pumpkin — 14 coins</button>

    <h3>🔄 Special Trades</h3>
    <button data-action="trade-seed">Trade 3 carrots for 1 tomato seed</button>
    <button data-action="trade-mixed">Trade 2 carrots + 1 tomato for 15 coins</button>

    <h3>📋 Quest</h3>
    <button data-action="quest">Accept Benny's 5-carrot quest</button>
    <button data-action="close">Close Market</button>
  `;

  dialogue.onclick = event => {
    const action = event.target.dataset.action;
    if (!action) return;

    const actions = {
      "buy-carrot": () => buySeeds("carrot"),
      "buy-tomato": () => buySeeds("tomato"),
      "buy-pumpkin": () => buySeeds("pumpkin"),
      "sell-carrot": () => sellCrop("carrot"),
      "sell-tomato": () => sellCrop("tomato"),
      "sell-pumpkin": () => sellCrop("pumpkin"),
      "trade-seed": tradeCarrotsForSeed,
      "trade-mixed": tradeMixedCrops,
      quest: acceptQuest
    };

    if (action === "close") {
      dialogue.innerHTML = "";
      return;
    }

    actions[action]?.();
  };
}

function restartGame() {
  coins = 20;
  day = 1;
  selectedTool = "plant";
  selectedCrop = "carrot";
  questAccepted = false;
  questCompleted = false;

  inventory = {
    carrot: 0,
    tomato: 0,
    pumpkin: 0
  };

  seeds = {
    carrot: 5,
    tomato: 1,
    pumpkin: 0
  };

  nextPlotId = 0;
  makeStartingPlots();

  if (dialogue) dialogue.innerHTML = "";

  showMessage("Welcome to Tiny Pixel Garden! Plant your seeds and grow a wonderful farm.");
  updateDisplay();
}

/* Connect the existing buttons */

plantButton?.addEventListener("click", () => chooseTool("plant"));
waterButton?.addEventListener("click", () => chooseTool("water"));
harvestButton?.addEventListener("click", () => chooseTool("harvest"));
nextDayButton?.addEventListener("click", advanceDay);
restartButton?.addEventListener("click", restartGame);
bennyButton?.addEventListener("click", openBennyShop);

/* Add crop selector buttons if the HTML has a crop selector */

document.querySelectorAll("[data-crop]").forEach(button => {
  button.addEventListener("click", () => {
    chooseCrop(button.dataset.crop);
  });
});

/* Start the game */

makeStartingPlots();
updateDisplay();
showMessage("Welcome to Tiny Pixel Garden! Plant your seeds and grow a wonderful farm.");

