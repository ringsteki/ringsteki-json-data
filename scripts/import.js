var axios = require('axios');

const doImport = async () => {

const hallOfBeorn = 'http://hallofbeorn.com/Export/';

const allSetsUrl = `${hallOfBeorn}/CardSets`;

const sets = await axios.get(allSetsUrl);

console.log(sets.data.length);

}

doImport();