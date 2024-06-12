/**
 * @file util/akaAction.ts
 * @summary Server actions to securely communicate with AKA Profiles.
 */

"use server";

import getErrorMessage from "@/app/errors";
import * as jwt from "jsonwebtoken";

import { ConfigParam } from "./configParams";

declare module "jsonwebtoken" {
  export interface JwtPayload {
    session: string;
    target: string;
    owner: string;
    configParams: ConfigParam[];
  }
}

const akaPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxij5eYQKBiWppELmT5OY
6fkfaS61ZetXDuDOpGi5VJavbgNKkUzBK9msqwgEWC8Qsj259ZuwvEYrF5i/ir7v
hQ19p1N+VTx9LjNFKMKdUEDYswpae3oHKXAib871IzwY6LbaJlAIXMzH0XGZ6TaA
PDvq0W88JmCE+5VRisTVGRqMU5RXR8EddKgY4XvO6xQyEADceJKtlhc0MfMY9RAB
9hVTp69iyM11mIiEZupyzzGx1LL8evJT6xyD0D+Ao/qJmnRxVjWo7x2Q+4IJgVcA
XG75DqyKPdYgqv3aMb4gLzJC8I0ds7H85bWxmi4ggKIZmhKphH6riu6HDPwMmw1T
DwIDAQAB
-----END PUBLIC KEY-----
`;

const api_key = process.env.AKA_API_KEY;
const tokenURL = process.env.AKA_TOKEN_URL;
const awardBadgeURL = process.env.AKA_AWARD_BADGE_URL;

/**
 * Generates the authentication headers for API requests.
 *
 * @param {string} [token] - Optional bearer token for authentication. If not provided, the function will use a predefined API key.
 * @throws Will throw an error if the API key is not set and no token is provided.
 * @returns {Object} The headers object containing `Content-Type` and `Authorization`.
 */
const getAuthHeaders = (token?: string) => {
  let authorization = "";
  if (token) {
    authorization = `Bearer ${token}`;
  } else {
    if (!api_key) {
      throw new Error("AKA_API_KEY not set.");
    }
    authorization = `Bearer ${api_key}`;
  }

  return {
    "Content-Type": "application/json",
    "Authorization": authorization,
  };
};

/**
 * Sends POST requests to an AKA Profiles endpoint with the provided token and data.
 *
 * @param {string} url - The AKA Profiles endpoint to send the POST request to.
 * @param {string} token - The authorization token to use for the request.
 * @param {object} data - The data to include in the body of the POST request.
 * @returns {Promise<{ success: boolean; message: string; data?: {} }>}
 * An object indicating the success status, a message, and optionally the returned data.
 */
const postAkaProfiles = async (
  url: string,
  token: string,
  data: object
): Promise<{ success: boolean; message: string; data?: {} }> => {
  console.log(
    `postAkaProfiles called. data: ${JSON.stringify(
      data
    )} url: ${url} token: ${token}`
  );
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
      cache: "no-cache",
    });

    console.log(
      `postAkaProfiles returned ${response.status} ${response.statusText}`
    );
    if (response.status == 200) {
      const data = await response.json();
      if (data) {
        console.log(`postAkaProfiles returned data ${JSON.stringify(data)}`);
      }
      return { success: true, message: "", data: data };
    } else {
      const statusCode = response.status;
      const text = await response.text();
      const mesg = `${statusCode}  ${text}`;
      console.log(mesg);
      return { success: false, message: mesg };
    }
  } catch (myError) {
    return { success: false, message: getErrorMessage(myError) };
  }
};

/**
 * Retrieves and verifies a token from the authorization server.
 *
 * @param {string} code - The authorization code to exchange for a token.
 * @returns {Promise<{ token?: string; payload?: jwt.JwtPayload; error?: string }>}
 * An object containing the token, the decoded payload, or an error message.
 * @throws Will throw an error if the token URL is not set, or if there is an error during the request or decoding.
 */
export const token = async (
  code: string
): Promise<{ token?: string; payload?: jwt.JwtPayload; error?: string }> => {
  if (!tokenURL) {
    throw new Error("AKA_TOKEN_URL not set");
  }

  const url = `${tokenURL}?code=${code}`;

  let token = "";
  let tokenError = "";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-cache",
    });

    const text = await response.text();
    if (response.status == 200) {
      token = text;
    } else {
      tokenError = text;
    }
  } catch (myError) {
    throw new Error(
      `Error during ${url} request.  ${getErrorMessage(myError)}`
    );
  }

  if (tokenError != "") {
    return { error: tokenError };
  }

  // decode token
  try {
    const decoded = jwt.verify(token, akaPublicKey);
    if (typeof decoded === "string") {
      console.log("Error: token is string instead of JwtPayload");
      return { error: "unauthorized" };
    }
    return { token: token, payload: decoded };
  } catch (myError) {
    throw new Error(
      `Error decoding token ${token}.  ${getErrorMessage(myError)}`
    );
  }
};

/**
 * Awards a badge using the specified token and award data.
 *
 * @param {string} token - The authorization token to use for the request.
 * @param {object} [awarddata] - Optional data to include with the badge award request.
 * @returns {Promise<{ success: boolean; message: string }>}
 * An object indicating the success status and a message.
 * @throws Will throw an error if the award badge URL is not set or if the request fails.
 */
export const awardBadge = async (
  token: string,
  awarddata?: object
): Promise<{ success: boolean; message: string }> => {
  if (!awardBadgeURL) {
    throw new Error("AKA_AWARD_BADGE_URL not set");
  }

  const result = await postAkaProfiles(
    awardBadgeURL,
    token,
    awarddata ? awarddata : {}
  );
  if (result === undefined) return result;

  return result as { success: boolean; message: string };
};
