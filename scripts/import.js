var axios = require("axios");
var path = require("path");
var fs = require("fs");

const DRY_RUN = false;

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

  const hobSetsByName = {};
  const hobSets = await axios.get(hob_allSetsUrl, {
    headers: { Cookie: hob_cookies },
  });

  for (let pack of hobSets.data) {    
    console.log(`Working with pack ${pack.Name}`);
    hobSetsByName[pack.Name.toLowerCase()] = pack;
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

  for (let scenario of hobScenarios.data) {
    if (scenario.Title.indexOf('Rhosgobel') !== -1) {
      console.log(`Working with scenario ${scenario.Title}`);
    }

    //Update the scenario to include Cycle
    scenario.Cycle =
      hobSetsByName[scenario.Title.toLowerCase()]?.Cycle ||
      hobSetsByName[scenario.Product.toLowerCase()]?.Cycle;

    const scenCardsUrl = `${hallOfBeorn}/?Scenario=${encodeURIComponent(
      scenario.Title
    )}`;
    console.log(`\tgetting the scenario ${scenario.Title}`);
    const sc = await axios.get(scenCardsUrl, {
      headers: { Cookie: hob_cookies },
    });
    console.log(`\tgot scenario. Saving json...`);
    if (DRY_RUN) {
      console.log(scenario);
    } else {
      fs.writeFileSync(
        path.join(scenariosDir, scenario.Title + ".json"),
        JSON.stringify(
          {
            Title: scenario.Title,
            Slug: scenario.Slug,
            Product: scenario.Product,
            Number: scenario.Number,
            AllCards: sc.data,
            Cycle: scenario.Cycle,
          },
          null,
          4
        )
      );
    }
    console.log("\tSaved json.");
  }

  if (DRY_RUN) {
    // console.log(hobScenarios.data);
  } else {
    fs.writeFileSync(
      path.join(rootDir, "scenarios.json"),
      JSON.stringify(hobScenarios.data, null, 4)
    );
  }
};

doImport();
