import { Client, type ClientOptions } from '@elastic/elasticsearch';
import { fetch_all_games } from './fetchNbaData';



interface CareerGameStats {
    
}


//Elastic Initialization
const config: ClientOptions = {
    node:`${process.env.ELASTIC_ENDPOINT}`,
    auth: {
        apiKey: `${process.env.ELASTIC_API_KEY}`
    }
};

const client = new Client(config);

const indexName = 'career-stats'


async function checkIndex() {
     //Check if index exists
     if(indexName && (await client.indices.exists({index:indexName}))) {
        return
    } else {
        //Create index
        await client.indices.create({index:indexName})
    }

};