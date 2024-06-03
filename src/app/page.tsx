import styles from "./page.module.css";

export default async function Home() {
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
            Demonstrates displaying badge details and awarding a badge with
            data.
          </li>
        </ul>
      </div>
    </div>
  );
}
