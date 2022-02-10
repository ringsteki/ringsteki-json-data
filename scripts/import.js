var axios = require("axios");
var path = require("path");
var fs = require("fs");

const hallOfBeorn = "http://hallofbeorn.com/Export";

const hob_cookies =
    "DefaultSort=SortPopularity; ProductFilter=ProductAll; OwnedProducts=; SetSearch=SearchCommunity";

// Info about new campaign boxes
const revCoreCampaignCards = [
  { slug: "Mendor-RevCore", quantity: 1 },
  { slug: "Mendor's-Support-RevCore", quantity: 4 },
  { slug: "Valor-RevCore", quantity: 4 },
  { slug: "Appointed-by-Fate-RevCore", quantity: 1 },
  { slug: "Ungoliant's-Swarm-RevCore", quantity: 1 },
  { slug: "Lingering-Venom-RevCore", quantity: 1 },
  { slug: "Scarred-RevCore", quantity: 4 },
];

const campaignScenarios = {
  "Passage-Through-Mirkwood-Campaign": {
    cardSet: 'Revised Core Set',
    campaignCardSlugs: [
      { slug: "Passage-Through-Mirkwood-Campaign-RevCore", quantity: 1 },
    ].concat(revCoreCampaignCards),
  },
  "Journey-Along-the-Anduin-Campaign": {
    cardSet: 'Revised Core Set',
    campaignCardSlugs: [
      { slug: "Journey-Along-the-Anduin-Campaign-RevCore", quantity: 1 },
    ].concat(revCoreCampaignCards),
  },
  "Escape-from-Dol-Guldur-Campaign": {
    cardSet: 'Revised Core Set',
    campaignCardSlugs: [
      { slug: "Escape-from-Dol-Guldur-Campaign-RevCore", quantity: 1 },
    ].concat(revCoreCampaignCards),
  },
};

const modifyCardsForCampaign = async (scenario, cards) => {
  const campaignCardsForScenario = campaignScenarios[scenario.Slug];
  cards.data = cards.data
  .filter( c => !c.CardSet.includes('Nightmare'))
  .filter(
    (c) =>
      !campaignCardsForScenario.campaignCardSlugs.some((s) => s.slug === c.Slug)
  );

  const cardsUrl = `${hallOfBeorn}?CardSet=${encodeURIComponent(
    campaignCardsForScenario.cardSet
  )}`;

  const cardsFromRelatedCardSet = await axios.get(cardsUrl, {
    headers: { Cookie: hob_cookies },
  });

  const cardsBySlugs = {};

  cardsFromRelatedCardSet.data.forEach( c => {
    cardsBySlugs[c.Slug] = c;
  });

  cards.data = campaignCardsForScenario.campaignCardSlugs.map(s => cardsBySlugs[s.slug]).map(d => ({...d, CAMPAIGN: true})).concat(cards.data);

  return cards;
  
};

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

  const hob_allSetsUrl = `${hallOfBeorn}/CardSets`;
  const hob_allScenariosUrl = `${hallOfBeorn}/Scenarios`;

  const hobSetsByName = {};
  const hobSets = await axios.get(hob_allSetsUrl, {
    headers: { Cookie: hob_cookies },
  });

  for (let pack of hobSets.data) {
    console.log(`Working with pack ${pack.Name}`);
    hobSetsByName[pack.Name.toLowerCase()] = pack;
    // get all the player cards for the pack
    if (!DRY_RUN) {
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
  }

  const hobScenarios = await axios.get(hob_allScenariosUrl, {
    headers: { Cookie: hob_cookies },
  });

  for (let scenario of hobScenarios.data) {
    console.log(`Working with scenario ${scenario.Title}`);

    // if (scenario.Title !== "Passage Through Mirkwood Campaign") {
    //   continue;
    // }

    //Update the scenario to include Cycle
    scenario.Cycle =
      hobSetsByName[scenario.Title.toLowerCase()]?.Cycle ||
      hobSetsByName[scenario.Product.toLowerCase()]?.Cycle;

    const scenCardsUrl = `${hallOfBeorn}/?Scenario=${encodeURIComponent(
      scenario.Title
    )}`;
    console.log(`\tgetting the scenario ${scenario.Title}`);
    let sc = await axios.get(scenCardsUrl, {
      headers: { Cookie: hob_cookies },
    });

    // If the scenario is in our campaign list, do more stuff to it
    if (campaignScenarios[scenario.Slug]) {
      sc = await modifyCardsForCampaign(scenario, sc);
    }

    console.log(`\tgot scenario. Saving json...`);
    if (!DRY_RUN) {
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
