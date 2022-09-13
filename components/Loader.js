import styles from '../styles/Loader.module.css'
import request from 'superagent';
import { Button } from '@nextui-org/react';
import {useState} from 'react';
import { useRouter } from 'next/router'
import { Navbar,Card, Text } from '@nextui-org/react';

function Loader(props) {
    
    const router = useRouter();
    const [variants, setVariants] = useState([]);
    const [scriptName, setScriptName] = useState("");
    const scriptChangeHandler = (event) => {
        setScriptName(event.target.value);
	};


    const routeTo = (id)=>{   
        router.push(`/story/${id}`); 
    }

    const renderVariants = ()=>{
        const items = variants.map(v=>{
            return <Text key={v.id} onClick={()=>routeTo(v.id)} css={{ color:"white", margin:8, fontSize:"1.2em"}}>{v.label}</Text>
               
        })
        if (items.length > 0){
            return  <div className={styles.cardcontainer}>
                        {items}
                    </div>
        }
        
    }

    const fetchVariants  = ()=>{
        request.get('/api/variants').query({id:scriptName}).then(async (res) => {
            const variants = res.body;
            setVariants(variants);
        });
    }

    const renderLibrary = ()=>{
        
            return <div className={styles.uploadcontainer}>
			        <input value={scriptName} className={styles.textbox} type="text" name="scriptname" placeholder="script id" onChange={scriptChangeHandler} />
                    <Button style={{margin:10}}  onClick={fetchVariants}>find!</Button>
                </div>
        
    }

    return (
        <div className={styles.container}> 
        <Navbar isBordered={false} variant="sticky">
                    <Navbar.Brand>
                   
                    <Text b color="inherit">
                        grow your own story
                    </Text>
                    </Navbar.Brand>
                    
                </Navbar>   
            {variants.length <= 0 && renderLibrary()}
            {renderVariants()}
        </div>
    )
}

export default Loader;
