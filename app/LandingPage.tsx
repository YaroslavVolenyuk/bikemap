import Link from 'next/link';
import styles from './homepage.module.scss';

// type User = {
//   userId: number | undefined;
//   username: string | undefined;
// };

export default async function LandingPage() {
  return (
    <main className={styles.mainContainer}>
      <div className={styles.textAndImageContainer}>
        <div className={styles.textContainer}>
          <h1>Your route to adventure with BikeMap</h1>
          <h2>
            From the roughest dirt tracks to the smoothest cycling routes,
            BikeMap takes you there and back again—and everywhere you want in
            between. Explore the world on two wheels with our comprehensive maps
            designed specifically for cyclists.
          </h2>

          <h3>
            <Link href="/map">Start Exploring</Link> <br />
            <Link href="/login">Sign in</Link> /{' '}
            <Link href="/register">Sign up</Link>
            {/* <Link href="/login">Sign in</Link> to your BikeMap account or{' '}
            <Link href="/register">create</Link> a new one — and get the
            feature-packed experience for literally nothing. Or just{' '}
            <Link href="/map">Start Exploring</Link> */}
          </h3>
        </div>
        <div className={styles.imageContainer}>{''}</div>
      </div>
    </main>
  );
}
