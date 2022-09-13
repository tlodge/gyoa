import styles from '../../styles/Home.module.css'
import Player from '../../components/Player';
import { useRouter } from 'next/router'

export default function Story(){
  
  const router = useRouter();
  const { id } = router.query

  return (
    <>
      <div className={styles.App}>
        <Player id={id}/>
      </div>
    </>
  );
}