/**
 * @file page.tsx
 * @summary Home page introducing how to integrate a badge award page for an auto badge with AKA Profiles.
 * See README.md for configuration instructions.
 */

import styles from "./page.module.css";
import { createBase64Key } from "./util/aes";

export default async function Home() {
  const key = createBase64Key();

  return (
    <div className={styles.main}>
      <div className={styles.section}>
        <p>Starting code for integrating an auto badge with AKA Profiles.</p>
        <p>See README.md for configuration instructions.</p>
        <ul>
          <li key="simple">
            <b>src/app/simple</b>
          </li>
          <li key="simpleDesc">
            Demonstrates validating session and awarding a badge.
          </li>
          <li key="advanced">
            <b>src/app/advanced</b>
          </li>
          <li key="advanced">
            Also demonstrates configuration parameters and awarding a badge with
            data.
          </li>
        </ul>
        <div className={styles.section}>
          <p>Random AES_KEY you can store in .env</p>
          <p>{key}</p>
        </div>
      </div>
    </div>
  );
}
