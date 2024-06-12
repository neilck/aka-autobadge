/**
 * @file advanced/page.tsx
 * @summary Badge award page demonstrating more advanced features.
 * @description Demonstrates using configuration parameters and including data on the badge award.
 */

"use client";

import styles from "../page.module.css";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { load, LoadResult, doAwardBadge } from "./actions";

import getErrorMessage from "../errors";

export default function Simple() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let code = searchParams.get("code") ?? ""; // set by AKA Profiles, exchange for JSON Web Token
  let redirect = searchParams.get("redirect") ?? ""; // set by AKA Profiles, redirect to when done

  const [isValidSession, setIsValidSession] = useState(false); // true if code exchanged for token
  const [encryptedToken, setEncryptedToken] = useState(""); // token encrypted by server for safe client storage
  const [status, setStatus] = useState("loading...");

  // configuration parameters returned in payload of token
  const [tier, setTier] = useState("");
  const [alias, setAlias] = useState("");
  const [includeAlias, setIncludeAlias] = useState(false);
  const [badgeAwarded, setBadgeAwarded] = useState(false);

  const init = async () => {
    let loadResult: LoadResult = { isValidSession: false };
    try {
      loadResult = await load(code);
    } catch (error) {
      const mesg = getErrorMessage(error);
      console.log(mesg);
      setStatus(mesg);
      return;
    }

    console.log("encrypted token received.");
    setEncryptedToken(loadResult.encryptedToken ?? "");
    setIsValidSession(loadResult.isValidSession ?? false);

    // configuration parameters
    setTier(loadResult.tier ?? "");
    const includeAlias = loadResult.includeAlias ?? false;
    setIncludeAlias(includeAlias);

    if (includeAlias) {
      setAlias(loadResult.alias ?? "");
    } else {
      setAlias("<not enabled in configuration params>");
    }

    if (loadResult.error) setStatus(loadResult.error ?? "");
    else setStatus("successfully loaded");
  };

  const readyToAward = () => {
    // Add your own custom logic here
    return true;
  };

  const awardBadge = async (tier: string, alias?: string) => {
    const result = await doAwardBadge(encryptedToken, tier, alias);
    if (result.error) {
      setStatus(`badge not awarded: ${result.error}`);
    }

    if (result.success) {
      const mesg = "session updated with badge award";
      console.log(mesg);
      setStatus(mesg);
      setBadgeAwarded(true);
    }
  };

  const handleClick = () => {
    if (readyToAward()) {
      let mesg = "Awarding badge...";
      console.log(mesg);
      setStatus(mesg);
      if (includeAlias) {
        awardBadge(tier, alias);
      } else {
        awardBadge(tier);
      }
    }
  };

  const effectRan = useRef(false);

  useEffect(() => {
    if (
      // run once in development enviroment
      process.env.NODE_ENV == "development" &&
      !effectRan.current
    ) {
      init();
    }

    return () => {
      effectRan.current = true;
    };
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.section}>
        This is an advanced badge award page for an an AKA Profiles auto badge.
      </div>

      <div className={styles.section}>
        <p>
          <b>Status</b>
        </p>
        <p>{status}</p>
        {badgeAwarded && (
          <div style={{ paddingTop: "10px" }}>
            <button
              onClick={() => {
                router.push(redirect);
              }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
      <div className={styles.section}>
        <p>
          <b>Profile</b>
        </p>
        <p>
          <b>Tier:</b> {tier}
        </p>
        <p>
          <b>Alias:</b>{" "}
          {includeAlias ? alias : "<excluded by config parameter>"}
        </p>
      </div>
      <button disabled={!isValidSession || badgeAwarded} onClick={handleClick}>
        Award Badge to User
      </button>
      <a href={redirect}>cancel</a>
    </div>
  );
}
