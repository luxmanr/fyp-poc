import { anchor, DID } from '@decentralized-identity/ion-tools';
import fs from 'fs';
export const createDID = async () => {
    const readFile = (filePath) => {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf-8', (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(JSON.parse(data));
            });
        });
    };

    let pub_key;
    try {
        pub_key = await readFile('publicKey.json');
    } catch (err) {
        console.error(err);
    }

    let did = new DID({
        content: {
            publicKeys: [
                {
                    id: 'key-1',
                    type: 'EcdsaSecp256k1VerificationKey2019',
                    publicKeyJwk: pub_key,
                    purposes: ['authentication']
                }
            ]
        }
    });

    const didUri = await did.getURI('short');
    let createRequest = await did.generateRequest(0);
    await anchor(createRequest);

    return {
        "didUri": didUri,
    }
}

