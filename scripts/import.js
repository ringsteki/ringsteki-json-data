var axios = require("axios");
var path = require("path");
var fs = require("fs");
const { exit } = require("process");

const hallOfBeorn = "http://hallofbeorn.com/Export";

const hob_cookies =
  "DefaultSort=SortPopularity; ProductFilter=ProductAll; OwnedProducts=; SetSearch=SearchCommunity";

const LAST_PACK_COMPLETED = -1;
const LAST_SCENARIO_COMPLETED = -1;

const axiosCache = {}

const axiosGet = async (url, options) => {
  if (!!axiosCache[url]) {
    return axiosCache[url];
  }

  const response = await axios
  .get(url, options)
  .catch((e) => {
    errored = true;
    console.log("got an axios error for url " + url + ": " + e.message);
    exit(-1)
  })

  axiosCache[url] = response;
  
  return response;
}

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

const lotrCampaignCards = [
  { slug: "The-One-Ring-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Mr-Underhill-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Gildor-Inglorion-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Gandalf's-Delay-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "The-Ring-Draws-Them-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Weight-of-the-Ring-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Fear-of-Discovery-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Eaten-Alive-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Panicked-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Overcome-by-Terror-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Old-Bogey-stories-TOF", quantity: 1, cardSet: "The Old Forest" },
  {
    slug: "Ho-Tom-Bombadil-FotBD",
    quantity: 1,
    cardSet: "Fog on the Barrow-downs",
  },
  { slug: "Tireless-Ranger-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Skilled-Healer-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Noble-Hero-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Valiant-Warrior-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Sting-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Anduril-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Mithril-Shirt-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Phial-of-Galadriel-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Glamdring-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Leaf-wrapped-Lembas-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Three-Golden-Hairs-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Lorien-Rope-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Lust-for-the-Ring-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Shadow-of-Fear-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Pursued-by-the-Enemy-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Overcome-by-Grief-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Grievous-Wound-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Followed-by-Night-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Ill-Fate-RD", quantity: 1, cardSet: "The Road Darkens" },
  {
    slug: "Hands-of-a-Healer-ToS",
    quantity: 1,
    cardSet: "The Treason of Saruman",
  },
  {
    slug: "Palantir-of-Orthanc-ToS",
    quantity: 1,
    cardSet: "The Treason of Saruman",
  },
  { slug: "Forewarned-ToS", quantity: 1, cardSet: "The Treason of Saruman" },
  {
    slug: "Beyond-All-Hope-ToS",
    quantity: 1,
    cardSet: "The Treason of Saruman",
  },
  { slug: "Intimidation-ToS", quantity: 1, cardSet: "The Treason of Saruman" },
  { slug: "Leader-of-Men-ToS", quantity: 1, cardSet: "The Treason of Saruman" },
  {
    slug: "Poisoned-Counsels-ToS",
    quantity: 4,
    cardSet: "The Treason of Saruman",
  },
  { slug: "Brace-of-Coneys-TLoS", quantity: 1, cardSet: "The Land of Shadow" },
  { slug: "A-Heavy-Burden-TLoS", quantity: 1, cardSet: "The Land of Shadow" },
  {
    slug: "Esquire-of-Rohan-TFotW",
    quantity: 1,
    cardSet: "The Flame of the West",
  },
  {
    slug: "Esquire-of-Gondor-TFotW",
    quantity: 1,
    cardSet: "The Flame of the West",
  },
  {
    slug: "Army-of-the-Dead-Objective-Ally-TFotW",
    quantity: 1,
    cardSet: "The Flame of the West",
  },
];

const campaignScenarios = {
  "Passage-Through-Mirkwood-(Campaign)": {
    cardSet: "Revised Core Set",
    campaignCardSlugs: [
      { slug: "Passage-Through-Mirkwood-Campaign-RevCore", quantity: 1 },
    ].concat(revCoreCampaignCards),
  },
  "Journey-Along-the-Anduin-(Campaign)": {
    cardSet: "Revised Core Set",
    campaignCardSlugs: [
      { slug: "Journey-Along-the-Anduin-Campaign-RevCore", quantity: 1 },
    ].concat(revCoreCampaignCards),
  },
  "Escape-from-Dol-Guldur-(Campaign)": {
    cardSet: "Revised Core Set",
    campaignCardSlugs: [
      { slug: "Escape-from-Dol-Guldur-Campaign-RevCore", quantity: 1 },
    ].concat(revCoreCampaignCards),
  },
  "A-Shadow-of-the-Past": {
    cardSet: "The Black Riders",
    campaignCardSlugs: [
      { slug: "A-Shadow-of-the-Past-TBR", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "The-Old-Forest": {
    cardSet: "The Old Forest",
    campaignCardSlugs: [
      { slug: "The-Old-Forest-Campaign-TOF", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "Fog-on-the-Barrow-downs": {
    cardSet: "Fog on the Barrow-downs",
    campaignCardSlugs: [
      { slug: "Fog-on-the-Barrow-downs-Campaign-FotBD", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "A-Knife-in-the-Dark": {
    cardSet: "The Black Riders",
    campaignCardSlugs: [
      { slug: "A-Knife-in-the-Dark-TBR", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "Flight-to-the-Ford": {
    cardSet: "The Black Riders",
    campaignCardSlugs: [{ slug: "Flight-to-the-Ford-TBR", quantity: 1 }].concat(
      lotrCampaignCards
    ),
  },
  "The-Ring-Goes-South": {
    cardSet: "The Road Darkens",
    campaignCardSlugs: [
      { slug: "The-Ring-Goes-South-Campaign-RD", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "Journey-in-the-Dark": {
    cardSet: "The Road Darkens",
    campaignCardSlugs: [
      { slug: "Journey-in-the-Dark-Campaign-RD", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "Breaking-of-the-Fellowship": {
    cardSet: "The Road Darkens",
    campaignCardSlugs: [
      { slug: "Breaking-of-the-Fellowship-Campaign-RD", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "The-Uruk-hai": {
    cardSet: "The Treason of Saruman",
    campaignCardSlugs: [
      { slug: "The-Uruk-hai-Campaign-ToS", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "Helm's-Deep": {
    cardSet: "The Treason of Saruman",
    campaignCardSlugs: [
      { slug: "Helm's-Deep-Campaign-ToS", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "The-Road-to-Isengard": {
    cardSet: "The Treason of Saruman",
    campaignCardSlugs: [
      { slug: "The-Road-to-Isengard-Campaign-ToS", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "The-Passage-of-the-Marshes": {
    cardSet: "The Land of Shadow",
    campaignCardSlugs: [
      { slug: "The-Passage-of-the-Marshes-Campaign-TLoS", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "Journey-to-the-Cross-roads": {
    cardSet: "The Land of Shadow",
    campaignCardSlugs: [
      { slug: "Journey-to-the-Cross-roads-Campaign-TLoS", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "Shelob's-Lair": {
    cardSet: "The Land of Shadow",
    campaignCardSlugs: [
      { slug: "Shelob's-Lair-Campaign-TLoS", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "The-Passing-of-the-Grey-Company": {
    cardSet: "The Flame of the West",
    campaignCardSlugs: [
      { slug: "The-Passing-of-the-Grey-Company-Campaign-TFotW", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "The-Siege-of-Gondor": {
    cardSet: "The Flame of the West",
    campaignCardSlugs: [
      { slug: "The-Siege-of-Gondor-Campaign-TFotW", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "The-Battle-of-the-Pelennor-Fields": {
    cardSet: "The Flame of the West",
    campaignCardSlugs: [
      { slug: "The-Battle-of-the-Pelennor-Fields-Campaign-TFotW", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "The-Tower-of-Cirith-Ungol": {
    cardSet: "The Mountain of Fire",
    campaignCardSlugs: [
      { slug: "The-Tower-of-Cirith-Ungol-Campaign-TMoF", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "The-Black-Gate-Opens": {
    cardSet: "The Mountain of Fire",
    campaignCardSlugs: [
      { slug: "The-Black-Gate-Opens-Campaign-TMoF", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
  "Mount-Doom": {
    cardSet: "The Mountain of Fire",
    campaignCardSlugs: [
      { slug: "Mount-Doom-Campaign-TMoF", quantity: 1 },
    ].concat(lotrCampaignCards),
  },
};

const modifyCardsForCampaign = async (scenario, cards) => {
  const campaignCardsForScenario = campaignScenarios[scenario.Slug];
  cards.data = cards.data
    .filter((c) => !c.CardSet.includes("Nightmare"))
    .filter(
      (c) =>
        !campaignCardsForScenario.campaignCardSlugs.some(
          (s) => s.slug === c.Slug
        )
    );

  console.log('This scenario is a campaign. Getting campaign cards');
  // get all the different card sets
  let cardSets = [campaignCardsForScenario.cardSet];
  for (c of campaignCardsForScenario.campaignCardSlugs) {
    if (!!c.cardSet && !cardSets.includes(c.cardSet)) {
      cardSets = cardSets.concat([c.cardSet])
    }
  }

  const cardsUrls = cardSets.map(
    (cs) => `${hallOfBeorn}?CardSet=${encodeURIComponent(cs)}`
  );

  const cardsBySlugs = {};

  for(url of cardsUrls) {
    const axiosResponse = await axiosGet(url, {
      headers: { Cookie: hob_cookies },
    })

    axiosResponse.data.forEach((c) => {
      cardsBySlugs[c.Slug] = c;
    })
  }

  cards.data = campaignCardsForScenario.campaignCardSlugs
    .map((s) => cardsBySlugs[s.slug])
    .map((d) => ({ ...d, CAMPAIGN: true }))
    .concat(cards.data);

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
  console.log(`**** getting all sets ****`);
  const hobSets = await axios
    .get(hob_allSetsUrl, {
      headers: { Cookie: hob_cookies },
    })
    .catch((e) => {
      console.log("got an axios error" + ": " + e.message);
    });

  console.log("*********** PACKS *****");

  // First, store all packs for later use
  for (let [_index, pack] of hobSets.data.entries()) {
    hobSetsByName[pack.Name.toLowerCase()] = pack;
  }

  for (let [index, pack] of hobSets.data.entries()) {
    console.log(
      `Working with pack ${pack.Name} (${index + 1} of ${hobSets.data.length})`
    );
    if (index < LAST_PACK_COMPLETED) {
      console.log("Skipping..");
      continue;
    }

    // get all the player cards for the pack
    if (!DRY_RUN) {
      const cardsUrl = `${hallOfBeorn}?CardSet=${encodeURIComponent(
        pack.Name
      )}&CardType=Player`;
      console.log("\tgetting the cards...");
      const cards = await axios
        .get(cardsUrl, {
          headers: { Cookie: hob_cookies },
        })
        .catch((e) => {
          console.log("got an axios error" + ": " + e.message);
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

  console.log("*********** PACKS COMPLETE *****");

  const hobScenarios = await axios
    .get(hob_allScenariosUrl, {
      headers: { Cookie: hob_cookies },
    })
    .catch((e) => {
      console.log("got an axios error" + ": " + e.message);
    });

  let stopSkipping = false;
  console.log("*********** SCENARIOS *****");
  for (let [index, scenario] of hobScenarios.data.entries()) {
    console.log(
      `Working with scenario ${scenario.Title} (${index + 1} of ${
        hobScenarios.data.length
      })`
    );

    if (!scenario.Title.includes("Shadow of") && !stopSkipping) {
      continue;
    } else {
      stopSkipping = true;
    }

    if (index < LAST_SCENARIO_COMPLETED) {
      console.log("Skipping..");
      continue;
    }

    //Update the scenario to include Cycle
    scenario.Cycle =
      hobSetsByName[scenario.Title.toLowerCase()]?.Cycle ||
      hobSetsByName[scenario.Product.toLowerCase()]?.Cycle;

    //Update the scenario to include Set Type
    scenario.SetType =
      hobSetsByName[scenario.Title.toLowerCase()]?.SetType ||
      hobSetsByName[scenario.Product.toLowerCase()]?.SetType;

    console.log(
      "Just set cycle and settype to",
      scenario.Cycle,
      scenario.SetType
    );

    const scenCardsUrl = `${hallOfBeorn}/?Scenario=${encodeURIComponent(
      scenario.Title
    )}`;
    console.log(`\tgetting the scenario ${scenario.Title}`);
    let sc = await axios
      .get(scenCardsUrl, {
        headers: { Cookie: hob_cookies },
      })
      .catch((e) => {
        console.log("got an axios error" + ": " + e.message);
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
            SetType: scenario.SetType,
          },
          null,
          4
        )
      );
    }
    console.log("\tSaved json.");
  }

  console.log("*********** SCENARIOS COMPLETE *****");

  if (DRY_RUN) {
    // console.log(hobScenarios.data);
  } else {
    fs.writeFileSync(
      path.join(rootDir, "scenarios.json"),
      JSON.stringify(hobScenarios.data, null, 4)
    );
  }
};

try {
  doImport();
} catch (e) {
  console.log(`ERROR`);
}
