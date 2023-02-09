import { Web3Storage, getFilesFromPath } from 'web3.storage'
import readline from "readline";
import { getData } from './MongoDBHelper.js';
import * as Name from 'w3name';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDA1NWVDMGQ2MjUxNjJhMDMzYTk4YjkzM2JCM0NBOWEzNjk5YzY4NzkiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NzUzNzMxMTY3OTEsIm5hbWUiOiJhZG1pbiJ9.9swzVq5ZpDQjGDwV_kk6in7QMPoh3kdSP2XeyjeTapk'
const client = new Web3Storage({ token })
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const ask = async () => {
    const data = await getData();
    data.forEach((resource, index) => {
        console.log(`\n${index + 1}) "${resource.name}" - ${resource.cid}`);
    });
    rl.question("\nPlease enter the no. of the file you want to update: ", async choice => {
        const chosenRecord = data[choice - 1]
        rl.question("\nPlease enter the path to updated resource: ", async filePath => {
            const { cid } = await storeFiles(filePath);
            const w3Key = await updateFixedLink(chosenRecord.w3Key, cid)
            rl.close()
        });
    });

};

async function storeFiles(fileName) {
    const files = await getFilesFromPath(fileName)
    const cid = await client.put(files)
    return {
        "fileName": fileName,
        "cid": cid
    }
}

async function loadSigningKey(inputBytes) {
    const bytes = JSON.parse(inputBytes)
    const name = await Name.from(bytes.data);
    return name;
}

async function updateFixedLink(w3Key, new_cid) {
    const name = await loadSigningKey(w3Key)
    const revision = await Name.resolve(name);
    const nextValue = '/ipfs/' + new_cid;
    const nextRevision = await Name.increment(revision, nextValue);
    await Name.publish(nextRevision, name.key);
    const updated_w3Key = name.key.bytes
    return JSON.stringify(name.key.bytes)
}

ask();
