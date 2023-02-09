import { MongoClient } from 'mongodb'

const uri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.2'
const client = new MongoClient(uri);

export async function insert_record(res_name, res_cid, res_didUri, res_verifiableCred, res_w3Name, res_w3Key, res_fileHash) {
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        await createResource(client,
            {
                name: res_name,
                cid: res_cid,
                didUri: res_didUri,
                verifiableCred: res_verifiableCred,
                w3name: res_w3Name,
                w3Key: res_w3Key,
                fileHash: res_fileHash
            }
        );

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

async function createResource(client, newListing) {
    const result = await client.db("Resources").collection("res_mapping").insertOne(newListing);
}

export const getData = async () => {
    try {
        await client.connect()
        const db = client.db('Resources');
        const collection = db.collection('res_mapping');
        const data = await collection.find({}, { projection: { name: 1, cid: 1, didUri: 1, w3Key: 1 } }).toArray();
        await client.close();
        return data
    } catch (error) {
        console.error(error);
    }
};

export const updateResource = async (old_cid, verifiableCred, w3Key, fileHash, new_cid) => {
    try {
        await client.connect()
        const db = client.db('Resources');
        const collection = db.collection('res_mapping');
        const filter = {  cid:old_cid };
        const updateDocument = {
            $set: {
                verifiableCred: verifiableCred,
                w3Key: w3Key,
                fileHash: fileHash,
                cid: new_cid,
            },
        };
        const result = await collection.updateOne(filter, updateDocument);
        await client.close();
    } catch (error) {
        console.error(error);
    }
};
