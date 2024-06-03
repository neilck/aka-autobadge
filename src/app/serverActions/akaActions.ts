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
const verifySessionURL = process.env.AKA_VERIFY_SESSION_URL;
const loadConfigURL = process.env.AKA_LOAD_CONFIG_URL;
const awardBadgeURL = process.env.AKA_AWARD_BADGE_URL;

// return header with AKA_API_KEY or token authorization
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

// verify valid session
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

// award badge if eligible during user session
// session is unique to user
// awardToken is unique to badge within session
export const awardBadge = async (
  token: string,
  awarddata?: object
): Promise<{ success: boolean; badgeAwardId: string } | undefined> => {
  if (!awardBadgeURL) {
    throw new Error("AKA_AWARD_BADGE_URL not set");
  }

  const result = await postAkaProfiles(
    awardBadgeURL,
    token,
    awarddata ? awarddata : {}
  );
  if (result === undefined) return result;

  return result as { success: boolean; badgeAwardId: string };
};

// award badge if eligible during user session
// session is unique to user
// awardToken is unique to badge within session
export const postAkaProfiles = async (
  url: string,
  token: string,
  data: object
): Promise<object | undefined> => {
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

    if (response.status == 200) {
      const json = await response.json();
      console.log(
        `postAkaProfiles returned ${response.status} ${response.statusText}`
      );
      console.log(`postAkaProfiles returned data ${JSON.stringify(json)}`);
      return json;
    } else {
      const text = await response.text();
      throw new Error(
        `postAkaProfiles returned ${response.status} ${response.statusText} ${text}`
      );
    }
  } catch (myError) {
    console.log(`Error during ${url} request: ${getErrorMessage(myError)}`);
  }
};
