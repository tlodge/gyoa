import {useState, useEffect, useRef} from 'react';
import styles from '../styles/Player.module.css'
import * as tf from "@tensorflow/tfjs";
import * as speech from "@tensorflow-models/speech-commands";
import { MdMic} from "react-icons/md";

import {  FaBookReader} from "react-icons/fa";
import AudioPlayer from './AudioPlayer';
import request from 'superagent';

/*
 * commands that are recognised: "zero" to "nine", "up", "down", "left", "right", "go", "stop", "yes", "no"
 */

let inProgress = {};  //var that is independent of rendering logic!

function Player(props) {
    

    const [model, setModel] = useState(null)
    const [action, setAction] = useState()
    const [labels, setLabels] = useState(null)

    const [sources, setSources] = useState({});
    const [script, setScript] = useState();
    const [node, setCurrentNode] = useState();
    const [playing, setPlaying] = useState(false);
   
  
    const [tracks, setTracks] = useState([]);
    const [listening, setListening] = useState(false);
       
    const [scriptName, setScriptName] = useState("");

    const [startpressed, setStartPressed] = useState(false);

    const loadModel = async () =>{
        // start loading model
        const recognizer = await speech.create("BROWSER_FFT") 
       // check if model is loaded
        await recognizer.ensureModelLoaded();
        // store model instance to state
        setModel(recognizer)
       // store command word list to state
        setLabels(recognizer.wordLabels())
        setListening(true);
      }
    
    useEffect(()=>{loadModel()}, []);
    

    useEffect(()=>{
        inProgress = tracks.reduce((acc, item, i)=>{
                return {
                    ...acc,
                    [i]:true,
                }
        },{});
    },[tracks]);
   

    const argMax = (arr)=>{
        return arr.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
    }


    useEffect (()=>{

        if (!model){
            return;
        }

        if (listening){
            try{
                model.listen(result=>{
                    const max = argMax(Object.values(result.scores));
                    
                    const action = labels[argMax(Object.values(result.scores))];
                    setAction(action);
                }, {includeSpectrogram:true, probabilityThreshold:0.99})
            }catch(err){

            }
        }else{
            try{
                model.stopListening();
            }catch(err){
                console.log("error stopping listning!", err);
            }
        }
    }, [listening, model]);

    const splitkey = (key, value)=>{
        return key.split(/(\s+)/).reduce((acc, item)=>{
            return {
                ...acc,
                [item.trim().toLocaleLowerCase()]:value 
            }
        },{}) 
        /*return {
         [key.toLowerCase()] : node.rules[key].toLowerCase()
        }*/
    }

    useEffect(()=>{
        
        if (node){
            const rules = Object.keys(node.rules).reduce((acc,key)=>{
                return {
                    ...acc,
                    ...splitkey(key, node.rules[key].toLowerCase())
                }
            },{});

            const ruleset = Object.keys(rules);
            
            if (action){
                for (const a of action.split(" ")){
                    const _a = a.toLowerCase();
                    if (ruleset.indexOf(_a) !== -1){
                        setTimeout(()=>{
                            nextNode(rules[_a].toLowerCase());
                            setAction();
                            setListening(false);
                            setPlaying(true);
                        },500);
                    }
                }
            }
        }        
    },[action]);

    const fileChangeHandler = (event) => {
        handleSubmission(event.target.files[0]);
	};

    const scriptChangeHandler = (event) => {
        console.log(event.target.value);
        setScriptName(event.target.value);
        //handleSubmission(event.target.files[0]);
	};

    const startStory = ()=>{
       
        if (listening){
            setListening(false);
        }
        
        let _node = script[0];
        setCurrentNode(_node);
        setPlaying(true);
        setStartPressed(true);
    }

	const handleSubmission = (selectedFile) => {
        const fileReader = new FileReader();
        fileReader.readAsText(selectedFile, "UTF-8");
        const sources = [];
    
        fileReader.onload = e => {
           const {tracks, script} = JSON.parse(e.target.result);
           Object.keys(tracks).map (key=>{
              if (tracks[key]){
                  sources.push({id:key.toLowerCase(), tracks:tracks[key]});
              }
           });

           setSources(sources);
           setScript(script.map(s=>({...s, id:s.id.toLowerCase()})));
           setTracks(sources[0].tracks);
        };
    };

    const onFinish = (i)=>{
      
       inProgress = {
        ...inProgress,
        [i]:false,
       }

       const finished = Object.keys(inProgress).reduce((acc, key)=>{
            return acc && inProgress[key] == false;
       }, true);

       setPlaying(!finished)
       setListening(finished);
    }

    const renderAudioPlayers = ()=>{
        
        return (tracks||[]).map((t,i)=>{
            return <AudioPlayer key={i} src={t.src} play={startpressed} onFinish={()=>onFinish(i)}/>
        });
    }

    const nextNode = (id)=>{
       
        const _node = script.find(s=>{
            return s.id == id;
        })
        
        setCurrentNode(_node);
        
        const _tracks =  sources.find(s=>{
            return s.id == _node.id;
        });

        const {tracks:newTracks} = _tracks || {};
        setTracks(newTracks || []);
    }

    const renderNextScenes = ()=>{
        if (node && node.rules){
            return Object.keys(node.rules).map((key)=>{
                return <div  className={styles.keyword} style={{color: key.toLowerCase()==action ? "#01ABB3" : "#888"}} key={key} onClick={()=>setAction(key.toLocaleLowerCase())}>{key}</div>
            });
        }
        return null;
    }

    const renderCurrentNode = ()=>{
        return  <div className={styles.keywordcontainer}>
            {!playing && renderNextScenes()}
        </div>
    }

    const renderListening = ()=>{
       return <div className={styles.micontainer}>
                <div className={styles.listening}>
                    {listening && <MdMic/>}
                    {!listening && <FaBookReader/>}
                </div>
                <div className={styles.heard}>
                    {listening && action && <div>{`"${action}"`}</div>}
                </div>
            </div>
    }

    const renderUpload = ()=>{
        return <div className={styles.uploadcontainer}>
                    <label className={styles.customfileupload}>
			            <input  className={styles.fileupload} type="file" name="file" onChange={fileChangeHandler} />
                        upload your script!
	                </label>
                   
                </div>
    }

    const fetchTrack =  ({folder, id})=>{
        //https://storyeditor.vercel.app/api/save
        //"http://localhost:3000/api/loadmedia"
       return new Promise((resolve, reject)=>{
         request.post("/api/loadmedia").query({folder,id}).set('Content-Type', 'application/json').end(function(err,res){
            if (err){
                resolve("");
            }
            resolve(res.body);
         });
       })
     }
    const load = ()=>{
        console.log("OK LOADING ID", scriptName);
        request.get('/api/load').query({id:scriptName}).then(async (res) => {
            const sources =[];
            const {script} = res.body;
            
            const trackstodownload = script.reduce((acc,item)=>{
              
                const _tracks = item.tracks || [];
                const id =  item.id.toLowerCase();

                if (_tracks.length > 0){
                    return {
                        ...acc,
                        [id]: _tracks
                    }
                }
               return acc;
            },{});

         
            for (const id of Object.keys(trackstodownload)){
                const resolved = [];
                for (const trackid of trackstodownload[id]){
                    const src = await fetchTrack({folder:scriptName, id:trackid})
                    resolved.push({id:trackid, src});
                }
                sources.push({id, tracks:resolved});
            }

            setSources(sources);
           
            const _script = script.map(s=>({...s, id:s.id.toLowerCase()}));
            setScript(_script);
            const startnode = sources.find(s=>s.id==_script[0].id);
            
            if (startnode && startnode.tracks){
                setTracks(startnode.tracks);
            }
        })
         .catch(err => {
            console.log(err);
         });
    }

    const renderLibrary = ()=>{
        return <div className={styles.uploadcontainer}>
			        <input value={scriptName} className={styles.textbox} type="text" name="scriptname" placeholder="script id" onChange={scriptChangeHandler} />
                    <button className={styles.librarybutton} onClick={load}>load!</button>
                </div>
    }

    const renderStory = ()=>{
        return <div className={styles.startcontainer}>
            {sources.length > 0 && !node && <button className={styles.startbutton} onClick={startStory}>Start!</button>}
            {renderCurrentNode()}       
        </div>
    }

    return (
        <div className={styles.container}>
            {!script && renderLibrary()}
            {script && renderListening()}
            {renderStory()}
            {renderAudioPlayers()}
        </div>
    )
}

export default Player;
