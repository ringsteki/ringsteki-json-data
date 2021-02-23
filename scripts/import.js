var axios = require('axios');
var path = require('path');
var fs = require('fs');

const doImport = async () => {

  const packDir = path.join(__dirname, '..', 'packs');
  const scenariosDir = path.join(__dirname, '..', 'scenarios');

  if(!fs.existsSync(packDir)) {
    throw new Error('packs directory missing');
  }

  if(!fs.existsSync(scenariosDir)) {
    throw new Error('scenarios directory missing');
  }

  const hallOfBeorn = 'http://hallofbeorn.com/Export';

  const hob_allSetsUrl = `${hallOfBeorn}/CardSets`;
  const hob_allScenariosUrl = `${hallOfBeorn}/Scenarios`;

  // const hobSets = await axios.get(hob_allSetsUrl);

  // for (let pack of hobSets.data) {
  //   console.log(`Working with pack ${pack.Name}`);
  //   // get all the cards for the pack
  //   const cardsUrl = `${hallOfBeorn}?CardSet=${encodeURIComponent(pack.Name)}`
  //   console.log('\tgetting the cards...')
  //   const cards = await axios.get(cardsUrl);
  //   console.log('\tgot all cards. Saving json...')
  //   pack.cards = cards.data instanceof Array ? cards.data : [];
  //   fs.writeFileSync(path.join(packDir, pack.Name + '.json'), JSON.stringify(pack, null, 4));
  //   console.log('\tSaved json.')
  // }

  const hobScenarios = await axios.get(hob_allScenariosUrl);

  for (let scenario of hobScenarios.data) {
    console.log(`Working with scenario ${scenario.Title}`);
    const scenUrl = `${hob_allScenariosUrl}/${scenario.Slug}`;
    console.log(`\tgetting the scenrio`);
    const s = await axios.get(scenUrl);
    console.log(`\tgot scenario. Saving json...`);
    fs.writeFileSync(path.join(scenariosDir, scenario.Title + '.json'), JSON.stringify(s.data, null, 4));
    console.log('\tSaved json.')
  }

}

doImport();