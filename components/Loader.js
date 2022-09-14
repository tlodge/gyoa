import styles from '../styles/Loader.module.css'
import request from 'superagent';
import { Button, Spacer,  Navbar, Text } from '@nextui-org/react';
import {useEffect, useState} from 'react';
import { useRouter } from 'next/router'


const about = `Welcome to the Grow your Own Story app.  We are nearly there!  You just need to provide us with the name of the story you'd like to explore!`

function Loader(props) {
    
    const router = useRouter();
    const [variants, setVariants] = useState([]);
    const [scriptName, setScriptName] = useState("");
    const [showLogId, setShowLogId] = useState(false);
    const [logId, setLogId]= useState();

    useEffect(()=>{
        const _logId = localStorage.getItem("loggerId")
        setLogId(_logId);
    },[]);

    const scriptChangeHandler = (event) => {
        setScriptName(event.target.value);
	};


    const routeTo = (id)=>{   
        router.push(`/story/${id}`); 
    }

    const renderVariants = ()=>{
        const items = variants.map(v=>{
            return <> 
                    <div onClick={()=>routeTo(v.id)} className={styles.imagerow}>
                        <div className={styles.imagecontainer}>
                            <img src="logo.svg" height="150px"/>
                        </div>
                    </div>
                    <Text key={v.id} onClick={()=>routeTo(v.id)} css={{ color:"white", margin:8, fontSize:"1.2em"}}>{v.label}</Text>
               </>
        })
        if (items.length > 0){
            return  <div>
                        {items}
                    </div>
        }
        
    }

    const fetchVariants  = ()=>{
        request.get('/api/variants').query({id:scriptName || ""}).then(async (res) => {
            const variants = res.body;
            setScriptName("");
            setVariants(variants);
        });
    }

    const renderLibrary = ()=>{
        
        return <>
                <div className={styles.imagerow}>
                    <div className={styles.imagecontainer}>
                        <img src="logo.svg" height="150px"/>
                    </div>
               </div>
              <Spacer/>
              <div className={styles.about}>{about}</div>
              <Spacer/>
       
               
                
                <div className={styles.uploadcontainer}>
			        <input value={scriptName} className={styles.textbox} type="text" name="scriptname" placeholder="story name" onChange={scriptChangeHandler} />
                    <Button auto  flat  style={{margin:10}}  onClick={fetchVariants}>find!</Button>
                </div>
                
           
            </>
    }

    const renderLogId = ()=>{
        return <div  className={styles.logbox}>
                    <div onClick={()=>{setShowLogId(false)}} className={styles.log}>{logId}</div>
                </div>
    }

    return (<div>
                <Navbar isBordered={false} variant="sticky">
                    <Navbar.Brand>
                   
                    <Text b color="inherit">
                        grow your own story
                    </Text>
                    </Navbar.Brand>
                    <Navbar.Content>
                        <Navbar.Item>
                        <Button auto  flat onPress={()=>setShowLogId(!showLogId)}>{!showLogId ? 'id' : 'hide'}</Button>
                        </Navbar.Item>
                    </Navbar.Content>
                </Navbar>   
                {showLogId && renderLogId()}
                <div className={styles.container}> 
                    {variants.length <= 0 && renderLibrary()}
                    {renderVariants()}
                </div>
            </div>
    )
}

export default Loader;
