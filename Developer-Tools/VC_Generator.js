import { sign } from '@decentralized-identity/ion-tools';

import fs from 'fs';
export const vcGenerator = async (did, fileHash) => {
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

  let pub_key
  let private_key
  try {
    pub_key = await readFile('publicKey.json');
    private_key = await readFile('privateKey.json');
  } catch (err) {
    console.error(err);
  }


  const payload = {
    "vc": {
      "@context": [
        "https://www.w3.org/2018/credentials/v1"
      ],
      "type": [
        "VerifiableCredential"
      ],
      "credentialSubject": {
        "integtrity": {
          "type": "ResourceHash",
          "sha256": fileHash
        }
      }
    },
    "sub": did,
    "iss": "insert-developers-did-here"
  }

  const jws = sign({ payload: payload, privateJwk: private_key });
  return jws
}
