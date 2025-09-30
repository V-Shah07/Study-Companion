//SEARCHING FUNCTIONALITY -----------------------
import { algoliasearch } from 'algoliasearch';

const client = algoliasearch('RXNST4S1AL', '5d2ca1db5cea7f79e45016b8938e2ea3');

// Fetch and index objects in Algolia
const processRecords = async () => {
  const datasetRequest = await fetch('https://dashboard.algolia.com/api/1/sample_datasets?type=note');
  const movies = await datasetRequest.json();
  return await client.saveObjects({ indexName: 'notes_index', objects: movies });
};

processRecords()
  .then(() => console.log('Successfully indexed objects!'))
  .catch((err) => console.error(err));
