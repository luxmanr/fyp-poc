<template>
  <div class="hello">
    <img src="https://name.web3.storage/name/k51qzi5uqu5dkx0eg6x7v8cig6iiveshuyj8bc3vvmpnjw1aa859tnsg8263xo"
      data-did="did:ion:EiD3_Kv5FKlJXs4zifaGlSSODki1MbdKo5BQ-gUuR_NLfg" dataName="gshep.jpg" alt="" rel="resource">
  </div>
</template>

<script>
import { resolve, verify } from '@decentralized-identity/ion-tools';
import jwt_decode from "jwt-decode";

export default {
  mounted() {
    this.verifyIntegrity()
  },
  name: 'WriProof',
  props: {
    msg: String
  },
  methods: {
    verifyIntegrity() {
      const resources = document.querySelectorAll("[rel=resource]");
      resources.forEach(async resource => {
        let { isLegit, hashFromVc } = await this.check_VC_Legit(resource.getAttribute('data-did'))
        // isLegit = false
        if (isLegit) {
          let linkToFile = await this.w3nameToSrc(resource.getAttribute('src'), resource.getAttribute('dataName'))
          let retrievedHash = await this.getFileHash(linkToFile)
          retrievedHash = '1234'
          if (retrievedHash == hashFromVc) {
            resource.src = linkToFile
          }else{
            resource.src = "https://i.postimg.cc/3wNGwbRL/failed.png"
          }
        }else{
          resource.src = "https://i.postimg.cc/3wNGwbRL/failed.png"
        }
      });
    },
    async w3nameToSrc(w3Name, dataName) {
      const response = await fetch(w3Name);
      let data = await response.json();
      let link = await data.value.replace("/ipfs/", "");
      link = "https://" + link + ".ipfs.w3s.link/" + dataName
      return link
    },
    async check_VC_Legit(did) {
      try {
        const response = await fetch(`http://127.0.0.1:8000/vc?did=${did}`);
        let data = await response.json();
        console.log(data)
        let token = await data.verifiableCred;
        let decoded = jwt_decode(token);
        let hashFromVc = decoded.vc.credentialSubject.integtrity.sha256;
        let didDoc = await resolve(did);
        let pubkey = await didDoc.didDocument.verificationMethod[0].publicKeyJwk;
        const isLegit = await verify({ jws: token, publicJwk: pubkey })
        return { "isLegit": isLegit, "hashFromVc": hashFromVc }
      } catch (error) {
        console.error("Error:", error.message);
      }
    },
    async getFileHash(url) {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const crypto = window.crypto || window.msCrypto;
      const hash = await crypto.subtle.digest('SHA-256', uint8Array);
      const hexCodes = [];
      const view = new DataView(hash);
      for (let i = 0; i < view.byteLength; i += 4) {
        const value = view.getUint32(i);
        const stringValue = value.toString(16);
        const padding = '00000000';
        const paddedValue = (padding + stringValue).slice(-padding.length);
        hexCodes.push(paddedValue);
      }
      return hexCodes.join('');
    }

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
