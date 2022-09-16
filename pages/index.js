import styles from '../styles/Home.module.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react';
import Loader from '../components/Loader';

export default function Home(){
  
  const router = useRouter();

  useEffect(()=>{
    const consented = localStorage.getItem("consent");
    console.log("consented", consented);
    if (!consented){
      router.push("/consent");
    }
  },[]);

  return (
    <>
      <div className={styles.App}>
        <Loader/>
      </div>
    </>
  );
}