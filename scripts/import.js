var axios = require("axios");
var path = require("path");
var fs = require("fs");
const { exit } = require("process");

const hallOfBeorn =
  "http://hallofbeorn-env.us-east-1.elasticbeanstalk.com/Export";

const hob_cookies =
  "DefaultSort=SortPopularity; ProductFilter=ProductAll; OwnedProducts=; SetSearch=SearchCommunity";

const LAST_PACK_COMPLETED = -1;
const LAST_SCENARIO_COMPLETED = -1;

const axiosCache = {};

const axiosGet = async (url, options) => {
  if (!!axiosCache[url]) {
    return axiosCache[url];
  }

  const response = await axios.get(url, options).catch((e) => {
    errored = true;
    console.log("got an axios error for url " + url + ": " + e.message);
    exit(-1);
  });

  axiosCache[url] = response;

  return response;
};

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

const hobbitCampaignCards = [
  {
    slug: "Bilbo-Baggins-THOHaUH",
    quantity: 1,
    cardSet: "The Hobbit: Over Hill and Under Hill",
  },
  {
    slug: "Bilbo-Baggins-THOtD",
    quantity: 1,
    cardSet: "The Hobbit: On the Doorstep",
  },
  {
    slug: "Glamdring-THOHaUH",
    quantity: 1,
    cardSet: "The Hobbit: Over Hill and Under Hill",
  },
  {
    slug: "Sting-THOHaUH",
    quantity: 1,
    cardSet: "The Hobbit: Over Hill and Under Hill",
  },
  {
    slug: "Orcrist-THOHaUH",
    quantity: 1,
    cardSet: "The Hobbit: Over Hill and Under Hill",
  },
  {
    slug: "Bilbo's-Magic-Ring-THOtD",
    quantity: 1,
    cardSet: "The Hobbit: On the Doorstep",
  },
  {
    slug: "Mithril-Shirt-THOtD",
    quantity: 1,
    cardSet: "The Hobbit: On the Doorstep",
  },
  {
    slug: "Thror's-Golden-Cup-THOtD",
    quantity: 1,
    cardSet: "The Hobbit: On the Doorstep",
  },
  {
    slug: "Thror's-Hunting-Bow-THOtD",
    quantity: 1,
    cardSet: "The Hobbit: On the Doorstep",
  },
  {
    slug: "The-Arkenstone-THOtD",
    quantity: 1,
    cardSet: "The Hobbit: On the Doorstep",
  },
  {
    slug: "Thror's-Battle-Axe-THOtD",
    quantity: 1,
    cardSet: "The Hobbit: On the Doorstep",
  },
];

const lotrCampaignCards = [
  { slug: "The-One-Ring-TBR", quantity: 1, cardSet: "The Black Riders" },

  // Fellowship heroes
  { slug: "Frodo-Baggins-TBR", quantity: 1, cardSet: "The Black Riders" },
  { slug: "Frodo-Baggins-RD", quantity: 1, cardSet: "The Road Darkens" },
  { slug: "Aragorn-ToS", quantity: 1, cardSet: "The Treason of Saruman" },
  { slug: "Frodo-Baggins-TLoS", quantity: 1, cardSet: "The Land of Shadow" },
  { slug: "Aragorn-TFotW", quantity: 1, cardSet: "The Flame of the West" },
  { slug: "Frodo-Baggins-TMoF", quantity: 1, cardSet: "The Mountain of Fire" },
  { slug: "Aragorn-TMoF", quantity: 1, cardSet: "The Mountain of Fire" },

  //Boons and burdens
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
  // Revised Core
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

  // The Hobbit
  "We-Must-Away,-Ere-Break-of-Day": {
    cardSet: "The Hobbit: Over Hill and Under Hill",
    campaignCardSlugs: hobbitCampaignCards,
  },
  "Over-the-Misty-Mountains-Grim": {
    cardSet: "The Hobbit: Over Hill and Under Hill",
    campaignCardSlugs: hobbitCampaignCards,
  },
  "Dungeons-Deep-and-Caverns-Dim": {
    cardSet: "The Hobbit: Over Hill and Under Hill",
    campaignCardSlugs: hobbitCampaignCards,
  },
  "Flies-and-Spiders": {
    cardSet: "The Hobbit: On the Doorstep",
    campaignCardSlugs: hobbitCampaignCards,
  },
  "The-Lonely-Mountain": {
    cardSet: "The Hobbit: On the Doorstep",
    campaignCardSlugs: hobbitCampaignCards,
  },
  "The-Battle-of-Five-Armies": {
    cardSet: "The Hobbit: On the Doorstep",
    campaignCardSlugs: hobbitCampaignCards,
  },

  // LOTR
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

// Specific Card overrides (e.g for weird data from beorn data)
const specificCardOverrides = {
  "Shrine-to-Morgoth-Grotto-TDRu": {
    Back: {
      Subtitle: null,
      ImagePath:
        "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Shrine-to-Morgoth-Underwater.jpg",
      Stats: {
        Threat: "5",
        QuestPoints: "18",
      },
      Traits: ["Ruins.", "Underground.", "Underwater."],
      Keywords: ["Victory 5."],
      Text: [
        "Shrine to Morgoth cannot have attachments and cannot enter the staging area.",
        "Forced: If Shrine to Morgoth is the active location at the end of the quest phase, raise each player`s threat by 5.",
        "When Shrine to Morgoth is placed in the victory display, the players have escaped the flooded grotto and win the game.",
      ],
      Shadow: null,
      FlavorText: null,
    },
  },
  "Undersea-Grotto-TDRu": {
    Slug: "Undersea-Grotto-TDRu-1",
    Quantity: 2,
    Back: {
      Subtitle: null,
      ImagePath:
        "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Dark-Abyss.jpg",
      Stats: {
        Threat: "5",
        QuestPoints: "12",
      },
      Traits: ["Underground.", "Underwater."],
      Keywords: ["Victory 2."],
      Text: [
        "While Dark Abyss is the active location, characters cannot attack.",
        "Forced: If Dark Abyss is the active location at the end of the quest phase, deal 1 damage to each character in play. Then, you may flip Dark Abyss to its Grotto side.",
      ],
      Shadow: null,
      FlavorText: null,
    },
  },
  "Cursed-Caverns-TDRu": {
    Slug: "Cursed-Caverns-TDRu-1",
    Quantity: 2,
    Back: {
      Subtitle: null,
      ImagePath:
        "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Twisting-Hollow.jpg",
      Stats: {
        Threat: "4",
        QuestPoints: "14",
      },
      Traits: ["Underground.", "Underwater."],
      Keywords: ["Victory 2."],
      Text: [
        "While Twisting Hollow is the active location, characters cannot ready from card effects.",
        "Forced: If Twisting Hollow is the active location at the end of the quest phase, each player must discard 1 character. Then, you may flip Twisting Hollow to its Grotto side.",
      ],
      Shadow: null,
      FlavorText: null,
    },
  },
  "Watter-logged-Halls-TDRu": {
    Slug: "Watter-logged-Halls-TDRu-1",
    Quantity: 1,
    Back: {
      Subtitle: null,
      ImagePath:
        "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Dark-Abyss.jpg",
      Stats: {
        Threat: "5",
        QuestPoints: "12",
      },
      Traits: ["Underground.", "Underwater."],
      Keywords: ["Victory 2."],
      Text: [
        "While Dark Abyss is the active location, characters cannot attack.",
        "Forced: If Dark Abyss is the active location at the end of the quest phase, deal 1 damage to each character in play. Then, you may flip Dark Abyss to its Grotto side.",
      ],
      Shadow: null,
      FlavorText: null,
    },
  },
  "Shrine-to-Morgoth-Underwater-TDRu": "DELETE",
  "Dark-Abyss-TDRu": "DELETE",
  "Twisting-Hollow-TDRu": "DELETE",
  "Sunken-Temple-TDRu": "DELETE",
  "Na'asiyah-Objective-Ally-TGH": {
    Back: {
      Subtitle: null,
      ImagePath:
        "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Grey-Havens/Na'asiyah-Enemy.jpg",
      Stats: {
        EngagementCost: "8",
        Threat: "1",
        Attack: "2",
        Defense: "2",
        HitPoints: "4",
      },
      Traits: ["Corsair.", "Raider."],
      Keywords: [],
      Text: [
        "Na’asiyah engages the last player.",
        "Forced: When Na’asiyah engages you, discard each event in your hand. Add 1 resource to Na’asiyah for each event discarded in this way.",
        "Forced: When Na’asiyah attacks or defends, she gets +1 Attack and +1 Defense for this attack for each resource on her. After this attack, discard 1 resource from her.",
      ],
      Shadow: null,
      FlavorText: null,
    },
  },
  "Captain-Sahir-Objective-Ally-TGH": {
    Back: {
      Subtitle: null,
      ImagePath:
        "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Grey-Havens/Captain-Sahír-Enemy.jpg",
      Stats: {
        EngagementCost: "4",
        Threat: "6",
        Attack: "6",
        Defense: "2",
        HitPoints: "5",
      },
      Traits: ["Corsair.", "Raider."],
      Keywords: ["Victory 6."],
      Text: [
        "Captain Sahír engages the first player.",
        "For each point of damage Captain Sahír would take, discard 1 resource from him and cancel that damage.",
        "Forced: After Captain Sahír attacks, place 2 resource tokens on him (4 instead if his attack destroyed a character).",
      ],
      Shadow: null,
      FlavorText: null,
    },
  },
  "Captain-Sahir-Enemy-TGH": "DELETE",
  "Na'asiyah-Enemy-TGH": "DELETE",
};

const additionalScenarioCards = (scenario) => {
  const extraCards = [];

  if (scenario === "The Drowned Ruins") {
    extraCards.push(
      {
        Title: "Undersea Grotto",
        Slug: "Undersea-Grotto-TDRu-2",
        IsUnique: false,
        CardType: "Location",
        CardSubType: "None",
        Sphere: null,
        Front: {
          Subtitle: null,
          ImagePath:
            "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Undersea-Grotto.jpg",
          Stats: {
            Threat: "2",
            QuestPoints: "3",
          },
          Traits: ["Underground.", "Grotto."],
          Keywords: [],
          Text: [
            "While Undersea Grotto is the active location, reduce the cost of the first ally played by the players each round by 1.",
            "Response: After you travel to Undersea Grotto, you may flip it to its Underwater side.",
          ],
          Shadow: null,
          FlavorText: null,
        },
        Back: {
          Subtitle: null,
          ImagePath:
            "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Twisting-Hollow.jpg",
          Stats: {
            Threat: "4",
            QuestPoints: "14",
          },
          Traits: ["Underground.", "Underwater."],
          Keywords: ["Victory 2."],
          Text: [
            "While Twisting Hollow is the active location, characters cannot ready from card effects.",
            "Forced: If Twisting Hollow is the active location at the end of the quest phase, each player must discard 1 character. Then, you may flip Twisting Hollow to its Grotto side.",
          ],
          Shadow: null,
          FlavorText: null,
        },
        CardSet: "The Drowned Ruins",
        EncounterInfo: {
          EncounterSet: "The Drowned Ruins",
          EasyModeQuantity: 0,
          IncludedEncounterSets: [],
          StageNumber: null,
          StageLetter: null,
        },
        Number: 98,
        Quantity: 1,
        Artist: "Mariusz Gandzel",
        HasErrata: false,
        OctgnGuid: "c95b4c6a-3dd0-4f11-8620-df7af65c11bc",
        RingsDbCardId: "12098",
        RingsDbPopularity: 0,
        RingsDbVotes: 0,
        Categories: null,
      },
      {
        Title: "Cursed Caverns",
        Slug: "Cursed-Caverns-TDRu-2",
        IsUnique: false,
        CardType: "Location",
        CardSubType: "None",
        Sphere: null,
        Front: {
          Subtitle: null,
          ImagePath:
            "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Cursed-Caverns.jpg",
          Stats: {
            Threat: "3",
            QuestPoints: "5",
          },
          Traits: ["Underground.", "Grotto."],
          Keywords: [],
          Text: [
            "Response: After you travel to Cursed Caverns, you may flip it to its Underwater side.",
            "Response: After the players explore Cursed Caverns as the active location, each player may raise his threat by 2 to draw the bottom card of his deck.",
          ],
          Shadow: null,
          FlavorText: null,
        },
        Back: {
          Subtitle: null,
          ImagePath:
            "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Sunken-Temple.jpg",
          Stats: {
            Threat: "3",
            QuestPoints: "10",
          },
          Traits: ["Ruins.", "Underground.", "Underwater."],
          Keywords: ["Victory 2."],
          Text: [
            "While Sunken Temple is the active location, treat each attachment as if its printed text box is blank (except for Traits).",
            "Forced: If Sunken Temple is the active location at the end of the quest phase, discard 1 resource from each objective-ally an each hero`s resource pool. Then, you may flip Sunken Temple to its Grotto side.",
          ],
          Shadow: null,
          FlavorText: null,
        },
        CardSet: "The Drowned Ruins",
        EncounterInfo: {
          EncounterSet: "The Drowned Ruins",
          EasyModeQuantity: 0,
          IncludedEncounterSets: [],
          StageNumber: null,
          StageLetter: null,
        },
        Number: 99,
        Quantity: 2,
        Artist: "Timo Karhula",
        HasErrata: false,
        OctgnGuid: "4be4e706-1bd2-455a-a712-833c1bbcea55",
        RingsDbCardId: "12099",
        RingsDbPopularity: 0,
        RingsDbVotes: 0,
        Categories: null,
      },
      {
        Title: "Watter-logged Halls",
        Slug: "Watter-logged-Halls-TDRu-2",
        IsUnique: false,
        CardType: "Location",
        CardSubType: "None",
        Sphere: null,
        Front: {
          Subtitle: null,
          ImagePath:
            "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Watter-logged-Halls.jpg",
          Stats: {
            Threat: "2",
            QuestPoints: "4",
          },
          Traits: ["Ruins.", "Underground.", "Grotto."],
          Keywords: [],
          Text: [
            "While Water-logged Halls is the active location, each Undead enemy in play gets -1 Threat.",
            "Response: After you travel to Water-logged Halls, you may flip it to its Underwater side.",
          ],
          Shadow: null,
          FlavorText: null,
        },
        Back: {
          Subtitle: null,
          ImagePath:
            "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Drowned-Ruins/Sunken-Temple.jpg",
          Stats: {
            Threat: "3",
            QuestPoints: "10",
          },
          Traits: ["Ruins.", "Underground.", "Underwater."],
          Keywords: ["Victory 2."],
          Text: [
            "While Sunken Temple is the active location, treat each attachment as if its printed text box is blank (except for Traits).",
            "Forced: If Sunken Temple is the active location at the end of the quest phase, discard 1 resource from each objective-ally an each hero`s resource pool. Then, you may flip Sunken Temple to its Grotto side.",
          ],
          Shadow: null,
          FlavorText: null,
        },
        CardSet: "The Drowned Ruins",
        EncounterInfo: {
          EncounterSet: "The Drowned Ruins",
          EasyModeQuantity: 0,
          IncludedEncounterSets: [],
          StageNumber: null,
          StageLetter: null,
        },
        Number: 100,
        Quantity: 1,
        Artist: "Mariusz Gandzel",
        HasErrata: false,
        OctgnGuid: "",
        RingsDbCardId: "12100",
        RingsDbPopularity: 0,
        RingsDbVotes: 0,
        Categories: null,
      }
    );
  }
  return extraCards;
};

const fixupCard = (card) => {
  if (specificCardOverrides[card.Slug] === "DELETE") {
    return undefined;
  } else if (specificCardOverrides[card.Slug] !== undefined) {
    return {
      ...card,
      ...specificCardOverrides[card.Slug],
    };
  }

  return card;
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

  console.log("This scenario is a campaign. Getting campaign cards");
  // get all the different card sets
  let cardSets = [campaignCardsForScenario.cardSet];
  for (c of campaignCardsForScenario.campaignCardSlugs) {
    if (!!c.cardSet && !cardSets.includes(c.cardSet)) {
      cardSets = cardSets.concat([c.cardSet]);
    }
  }

  const cardsUrls = cardSets.map(
    (cs) => `${hallOfBeorn}?CardSet=${encodeURIComponent(cs)}`
  );

  const cardsBySlugs = {};

  for (url of cardsUrls) {
    const axiosResponse = await axiosGet(url, {
      headers: { Cookie: hob_cookies },
    });

    axiosResponse.data.forEach((c) => {
      cardsBySlugs[c.Slug] = c;
    });
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
  console.log(`**** getting all sets ****  ${hob_allSetsUrl}`);
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
      pack.cards = pack.cards.map((c) => fixupCard(c)).filter((c) => !!c);

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

    // if (!scenario.Title.includes("Shadow of") && !stopSkipping) {
    //   continue;
    // } else {
    //   stopSkipping = true;
    // }

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
      const allCards = sc.data
        .map((c) => fixupCard(c))
        .filter((c) => !!c)
        .concat(additionalScenarioCards(scenario.Title));

      fs.writeFileSync(
        path.join(scenariosDir, scenario.Title + ".json"),
        JSON.stringify(
          {
            Title: scenario.Title,
            Slug: scenario.Slug,
            Product: scenario.Product,
            Number: scenario.Number,
            AllCards: allCards,
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
