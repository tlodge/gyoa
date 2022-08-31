import styles from '../styles/Home.module.css'
import Player from '../components/Player';

export default function Home(){
  return (
    <>
      <div className={styles.App}>
        <Player />
      </div>
    </>
  );
}