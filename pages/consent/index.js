import styles from '../../styles/Consent.module.css'
import { useRouter } from 'next/router'
import { Switch, Card, Navbar, Text, Spacer, Radio} from '@nextui-org/react';
import {uniqueid} from '../../lib/utils';

const about = `A research team at Nottingham University is exploring the potential of sound and speech recognition in apps to support active play and storytelling between parents and children. We have created this prototype app that runs a voice-based experience that is similar to a choose-your-own-adventure book.`

const requestconsent = `Before you use this app we would like to obtain your consent.  We do not collect any identifiable information from you, but the app will collect anonymous logs on your interactions with it.`


export default function Consent(){

    const router = useRouter();


    
    const consent = ()=>{
        localStorage.setItem("consent", Date.now());
        localStorage.setItem("loggerId", uniqueid());
        router.push("/");
    }

    return (
        <>
        <Navbar isBordered={false} variant="sticky">
                    <Navbar.Brand>
                   
                    <Text b color="inherit">
                        Grow Your Own Adventure: consent
                    </Text>
                    </Navbar.Brand>
                    <Navbar.Content activeColor={"red"} >
                     
                    </Navbar.Content>
        </Navbar>
        <div className={styles.container}>
            <div className={styles.imagerow}>
                <div className={styles.imagecontainer}>
                    <img src="nottingham.svg" height="60px"/>
                </div>
            </div>
            <Spacer/>
            <div className={styles.about}>{about}</div>
            <Spacer/>
            <div className={styles.about}>{ requestconsent }</div>
            <Spacer/>
            <div className={styles.download}><a href="information.pdf">download our information sheet</a></div>
        </div>
        <div className={styles.consentbox}>
          
                <div className={styles.consentrow}>
                    <Switch onChange={consent} />
                    <div className={styles.clickhere} onClick={consent}> Click here to provide your consent </div>
                </div>
           
        </div>  
        </>
    );
}