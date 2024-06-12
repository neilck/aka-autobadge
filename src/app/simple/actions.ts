/**
 * @file simple/actions.ts
 * @summary Server actions for simple badge award page.
 * @description Actions executed on the server for security reasons.
 */

"use server";

import { token, awardBadge } from "../util/akaActions";
import { encrypt, decrypt } from "../util/aes";

export interface LoadResult {
  isValidSession: boolean;
  error?: string;
  encryptedToken?: string;
}

export interface AwardBadgeResult {
  success: boolean;
  error?: string;
}

const aes_key = process.env.AES_KEY ?? "";

/**
 * Function to load session data using a session code.
 * @param code The session code to exchange for a token.
 * @returns A promise resolving to a LoadResult object.
 */
export const load = async (code: string): Promise<LoadResult> => {
  const loadResult: LoadResult = { isValidSession: false };

  if (code == "") {
    console.log("code parameter missing in url");
    loadResult.error = "invalid code";
    return loadResult;
  }

  console.log(`About to exchange code ${code} for a token...`);
  try {
    // exchange code for JSON web token
    const result = await token(code as string);

    if (result.error == "missing or invalid parameter") {
      let mesg = `Unable to get token using invalid code ${code}. Valid codes are generated by akaprofiles on redirect, and can expire.`;
      console.log(mesg);
      loadResult.error = mesg;
      return loadResult;
    }

    if (result.token != undefined) {
      console.log("Received token:");
      console.log(`${result.token}`);
      loadResult.isValidSession = true;

      // to prevent token being exposed client side, encrypt before returning
      // ecnrypted token will passed by client in subsequent server action calls
      if (aes_key == "") {
        const mesg = "AES_KEY environment variable not set";
        loadResult.error = mesg;
        return loadResult;
      }

      console.log("Encrypting token with AES_KEY");
      const encryptedToken = encrypt(aes_key, result.token);
      loadResult.encryptedToken = encryptedToken;

      const mesg = "Code successfully exchanged for token.";
      console.log(mesg);
    }
  } catch (error) {
    const myError = error as Error;
    const mesg = `ERROR: ${myError.message}`;
    console.log(mesg);
    loadResult.error = myError.message;
    return loadResult;
  }
  return loadResult;
};

/**
 * Function to award an auto badge to a user.
 * @param encryptedToken The encrypted token containing user session information.
 * @returns A promise resolving to an AwardBadgeResult object.
 */
export const doAwardBadge = async (
  encryptedToken: string
): Promise<AwardBadgeResult> => {
  const plaintoken = decrypt(aes_key, encryptedToken);

  if (!plaintoken) {
    return { success: false, error: "could not decrypt token" };
  }

  try {
    const result = await awardBadge(plaintoken);
    if (result.success) {
      const mesg = `session updated with badge award`;
      console.log(mesg);
      return { success: true };
    } else {
      const mesg = `badge not awarded: ${result.message}`;
      console.log(mesg);
      return { success: false, error: mesg };
    }
  } catch (posterror) {
    const error = posterror as Error;
    const mesg = error.message;
    console.log(mesg);
    return { success: false, error: mesg };
  }
};
