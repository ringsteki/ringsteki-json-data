var axios = require("axios");
var path = require("path");
var fs = require("fs");

const doImport = async () => {
  const rootDir = path.join(__dirname, "..");
  const packDir = path.join(__dirname, "..", "packs");
  const scenariosDir = path.join(__dirname, "..", "scenarios");

  if (!fs.existsSync(packDir)) {
    throw new Error("packs directory missing");
  }

  if (!fs.existsSync(scenariosDir)) {
    throw new Error("scenarios directory missing");
  }

  const hallOfBeorn = "http://hallofbeorn.com/Export";

  const hob_allSetsUrl = `${hallOfBeorn}/CardSets`;
  const hob_allScenariosUrl = `${hallOfBeorn}/Scenarios`;

  const hob_cookies =
    "DefaultSort=SortPopularity; ProductFilter=ProductAll; OwnedProducts=; SetSearch=SearchCommunity";

  const hobSets = await axios.get(hob_allSetsUrl, {
    headers: { Cookie: hob_cookies },
  });

  for (let pack of hobSets.data) {
    console.log(`Working with pack ${pack.Name}`);
    // get all the player cards for the pack
    const cardsUrl = `${hallOfBeorn}?CardSet=${encodeURIComponent(
      pack.Name
    )}&CardType=Player`;
    console.log("\tgetting the cards...");
    const cards = await axios.get(cardsUrl, {
      headers: { Cookie: hob_cookies },
    });
    console.log("\tgot all cards. Saving json...");
    pack.cards = cards.data instanceof Array ? cards.data : [];
    fs.writeFileSync(
      path.join(packDir, pack.Name + ".json"),
      JSON.stringify(pack, null, 4)
    );
    console.log("\tSaved json.");
  }

  const hobScenarios = await axios.get(hob_allScenariosUrl, {
    headers: { Cookie: hob_cookies },
  });

  fs.writeFileSync(
    path.join(rootDir, "scenarios.json"),
    JSON.stringify(hobScenarios.data, null, 4)
  );

  for (let scenario of hobScenarios.data) {
    console.log(`Working with scenario ${scenario.Title}`);
    const scenCardsUrl = `${hallOfBeorn}/?Scenario=${encodeURIComponent(
      scenario.Title
    )}`;
    console.log(`\tgetting the scenario`);
    const sc = await axios.get(scenCardsUrl, {
      headers: { Cookie: hob_cookies },
    });
    console.log(`\tgot scenario. Saving json...`);
    fs.writeFileSync(
      path.join(scenariosDir, scenario.Title + ".json"),
      JSON.stringify(
        {
          Title: scenario.Title,
          Slug: scenario.Slug,
          Product: scenario.Product,
          Number: scenario.Number,
          AllCards: sc.data,
        },
        null,
        4
      )
    );
    console.log("\tSaved json.");
  }
};

doImport();
