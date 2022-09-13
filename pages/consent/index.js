import styles from '../../styles/Home.module.css'
import { useRouter } from 'next/router'

export default function Consent(){

    const router = useRouter();

    const consent = ()=>{
        localStorage.setItem("consent", Date.now());
        router.push("/");
    }

    return (
        <>
        <div className={styles.App}>
            <div onClick={consent}> Click here to give your consent </div>
        </div>
        </>
    );
}