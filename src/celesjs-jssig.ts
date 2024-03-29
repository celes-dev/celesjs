/**
 * @module JS-Sig
 */
// copyright defined in celesjs/LICENSE.txt

import * as ecc from "celesjs-ecc";
import { SignatureProvider, SignatureProviderArgs } from "./celesjs-api-interfaces";
import { convertLegacyPublicKey } from "./celesjs-numeric";

/** Signs transactions using in-process private keys */
export default class JsSignatureProvider implements SignatureProvider {
    /** map public to private keys */
    public keys = new Map<string, string>();

    /** public keys */
    public availableKeys = [] as string[];

    /** @param privateKeys private keys to sign with */
    constructor(privateKeys: string[]) {
        for (const k of privateKeys) {
            const pub = convertLegacyPublicKey(ecc.PrivateKey.fromString(k).toPublic().toString());
            this.keys.set(pub, k);
            this.availableKeys.push(pub);
        }
    }

    /** Public keys associated with the private keys that the `SignatureProvider` holds */
    public async getAvailableKeys() {
        return this.availableKeys;
    }

    /** Sign a transaction */
    public async sign({ chainId, requiredKeys, serializedTransaction }: SignatureProviderArgs) {
        const signBuf = Buffer.concat([
            new Buffer(chainId, "hex"), new Buffer(serializedTransaction), new Buffer(new Uint8Array(32)),
        ]);
        return requiredKeys.map(
            (pub) => ecc.Signature.sign(signBuf, this.keys.get(convertLegacyPublicKey(pub))).toString(),
        );
    }
}
