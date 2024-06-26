/**
 * @file simple/page.tsx
 * @summary Simple badge award page example.
 */

"use client";

import styles from "../page.module.css";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import getErrorMessage from "../errors";
import { load, LoadResult, doAwardBadge } from "./actions";

export default function Simple() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let code = searchParams.get("code") ?? ""; // set by AKA Profiles, exchange for JSON Web Token
  let redirect = searchParams.get("redirect") ?? ""; // set by AKA Profiles, redirect to when done

  const [isValidSession, setIsValidSession] = useState(false); // true if code exchanged for token
  const [encryptedToken, setEncryptedToken] = useState(""); // token encrypted by server for safe client storage
  const [status, setStatus] = useState("loading...");
  const [badgeAwarded, setBadgeAwarded] = useState(false);

  const init = async () => {
    let loadResult: LoadResult = { isValidSession: false };
    try {
      console.log(`Exchanged code ${code} for token...`);
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
    if (loadResult.error) setStatus(loadResult.error ?? "");
    else setStatus("load successful");
  };

  const readyToAward = () => {
    // Add your own custom badge award logic here
    return true;
  };

  const awardBadge = async () => {
    const result = await doAwardBadge(encryptedToken);
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
      awardBadge();
    }
  };

  const effectRan = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV == "development") {
      // prevent running more than once in dev
      if (!effectRan.current) {
        init();
      }
      return () => {
        effectRan.current = true;
      };
    } else {
      init();
    }
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.section}>
        <p>
          This is a simple badge award page for an an AKA Profiles auto badge.
        </p>
        <p>
          <i>Open browser console to see log messages.</i>
        </p>
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
      <button disabled={!isValidSession || badgeAwarded} onClick={handleClick}>
        Award Badge to User
      </button>
      <a href={redirect}>cancel</a>
    </div>
  );
}
