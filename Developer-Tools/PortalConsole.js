import { Web3Storage, getFilesFromPath } from 'web3.storage'
import readline from "readline";
import { insert_record, getData, updateResource } from './MongoDBHelper.js';
import { createDID } from './DID_Generator.js';
import { hashFile } from './HashCalculator.js'
import { vcGenerator } from './VC_Generator.js';
import * as Name from 'w3name';

const token = 'my_web3_api_key'
const client = new Web3Storage({ token })
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const ask = () => {
    rl.question("Press 1 to upload a new resource, or 2 to update an existing one: ", async answer => {
        if (answer === "1") {
            rl.question("\nEnter the file path: ", async filePath => {
                const { cid } = await storeFiles(filePath);
                const { w3Name, w3Key } = await createFixedLink(cid);
                const { didUri } = await createDID();
                const fileHash = await hashFile(filePath);
                const verifiableCred = await vcGenerator(didUri, fileHash);
                await insert_record(filePath, cid, didUri, verifiableCred, w3Name, w3Key, fileHash);
                rl.close();
            });
        } else if (answer === "2") {
            const data = await getData();
            data.forEach((resource, index) => {
                console.log(`\n${index + 1}) "${resource.name}" - ${resource.cid}`);
            });
            rl.question("\nPlease enter the no. of the file you want to update: ", async choice => {
                const chosenRecord = data[choice - 1]
                rl.question("\nPlease enter the path to updated resource: ", async filePath => {
                    const { cid } = await storeFiles(filePath);
                    const fileHash = await hashFile(filePath);
                    const w3Key = await updateFixedLink(chosenRecord.w3Key, cid)
                    const verifiableCred = await vcGenerator(chosenRecord.didUri, fileHash);
                    await updateResource(chosenRecord.cid, verifiableCred, w3Key, fileHash, cid);
                    rl.close()
                });
            });
        } else {
            console.log("Invalid input. Try again.");
            ask();
        }
    });
};

async function storeFiles(fileName) {
    const files = await getFilesFromPath(fileName)
    const cid = await client.put(files)
    return {
        "cid": cid
    }
}

async function loadSigningKey(inputBytes) {
    const bytes = JSON.parse(inputBytes)
    const name = await Name.from(bytes.data);
    return name;
}

async function createFixedLink(cid) {
    const name = await Name.create();
    console.log('created new name: ', name.toString());
    const value = '/ipfs/' + cid;
    const revision = await Name.v0(name, value);
    await Name.publish(revision, name.key);
    return {
        "w3Name": name.toString(),
        "w3Key": JSON.stringify(name.key.bytes)
    }
}

async function updateFixedLink(w3Key, new_cid) {
    const name = await loadSigningKey(w3Key)
    const revision = await Name.resolve(name);
    const nextValue = '/ipfs/' + new_cid;
    const nextRevision = await Name.increment(revision, nextValue);
    await Name.publish(nextRevision, name.key);
    return JSON.stringify(name.key.bytes)
}

ask();
