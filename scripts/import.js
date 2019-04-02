var axios = require('axios');
var path = require('path');
var fs = require('fs');

const doImport = async () => {

  const packDir = path.join(__dirname, '..', 'packs');

  if(!fs.existsSync(packDir)) {
    throw new Error('packs directory missing');
  }

  const hallOfBeorn = 'http://hallofbeorn.com/Export';

  const hob_allSetsUrl = `${hallOfBeorn}/CardSets`;

  const hobSets = await axios.get(hob_allSetsUrl);

  for (let pack of hobSets.data) {
    console.log(`Working with pack ${pack.Name}`);
    // get all the cards for the pack
    const cardsUrl = `${hallOfBeorn}?CardSet=${encodeURIComponent(pack.Name)}`
    console.log('\tgetting the cards...')
    const cards = await axios.get(cardsUrl);
    console.log('\tgot all cards. Saving json...')
    pack.cards = cards.data;
    fs.writeFileSync(path.join(packDir, pack.Name + '.json'), JSON.stringify(pack, null, 4));
    console.log('\tSaved json.')
  }

  // hobSets.data.forEach((async set => {
  //   //Check if the hob set is in rings db
  //   // console.log(set.Name);
  //   // First, remove any Hobbit prefix
  //   const name = set.Name.replace('The Hobbit:', '').trim();
  //   // 
  //   // const cards = await axios.get(cardsUrl);
  //   // console.log(`${set.Name}: ${cards.data.length}`);
  // }));

}

doImport();