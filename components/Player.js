import {useState, useEffect, useRef} from 'react';
import styles from '../styles/Player.module.css'
import * as tf from "@tensorflow/tfjs";
import * as speech from "@tensorflow-models/speech-commands";
import { MdMic} from "react-icons/md";
import AudioPlayer from './AudioPlayer';
import request from 'superagent';
import { Navbar, Dropdown, Text, Modal } from "@nextui-org/react";
import {format} from '../lib/utils';
import { AiOutlineAudioMuted, AiOutlineAudio, AiFillSound, AiOutlineSound, AiFillQuestionCircle, AiOutlinePauseCircle, AiOutlinePlayCircle, AiOutlineTeam,AiFillHome } from "react-icons/ai";
import { useRouter } from 'next/router'
import Logger from '../lib/logger';
/*
 * commands that are recognised: "zero" to "nine", "up", "down", "left", "right", "go", "stop", "yes", "no"
 */

let inProgress = {};  //var that is independent of rendering logic!

function Player(props) {
    
    const {id:storyId} = props;
    const timer = useRef(null);
    const _muted = useRef(null);
    const _listening = useRef(null);
    const logger = useRef(null);

    const db = useRef(null);

    const router = useRouter();
    const [action, setAction] = useState()
    const [sources, setSources] = useState({});
    const [script, setScript] = useState();
    const [node, setCurrentNode] = useState();
    const [playing, setPlaying] = useState(false);
   
  
    const [tracks, setTracks] = useState([]);
    const [listening, _setListening] = useState(false);
    const [loading, setLoading] = useState(true);
   
    const [progress, setProgress] = useState("0%");

    const [startpressed, setStartPressed] = useState(false);

    const [countingDown, setCountingDown] = useState(false);
    const [remaining, setRemaining] = useState();
    const [waypoints, setWaypoints] = useState([]);
    const [showWaypoints, setShowWaypoints] = useState(false);
    const [logId, setLogId] = useState(false);

    const [muted, _setMuted] = useState(false);
    const [paused, setPaused] = useState(false);
   
    const [showhelp, setShowHelp] = useState(false);
    const [showcredits, setShowCredits] = useState(false);

    const [loud, _setLoud] = useState(false);

    const log = (type, data)=>{
        console.log("logging", type, data);
        if (!logId){
            const _logId = localStorage.getItem("loggerId");
            setLogId(_logId);
            logger.current.log(_logId, type, data)
        }else{
            logger.current.log(logId, type, data)
        }
    }
    
    const setLoud = (value)=>{
        _setLoud(value);
        log("loudness", `${storyId} ${node.id} ${value}`);
    }

    const manualPaused = (value)=>{
        setPaused(value);
        log("paused", `${storyId} ${node.id} ${value}`);
    }

    const goHome = ()=>{
        router.push("/");
    }

    const setDB = (_db)=>{
        db.current = _db;
    }

    const setMuted = (value)=>{
         _muted.current = value;
        _setMuted(value);
        log("muted", `${storyId} ${node.id} ${value}`);
    }

    const setListening = (value)=>{
        _listening.current = value;
        _setListening(value);
    }
    

    //TODO - name of episode at top of app
    //pause inconsistency when jump to scene
    //more on tracks and track changes??
    //closing/refreshing app - does this work properly?
    //logging!
    //ethics form!
    //doc to kev

    const loadModel = async () =>{
        const _logId = localStorage.getItem("loggerId")
        if (navigator.mediaDevices){
            // start loading model
            const recognizer = await speech.create("BROWSER_FFT") 
            // check if model is loaded
            await recognizer.ensureModelLoaded();
            const labels = recognizer.wordLabels();

            try{
                recognizer.listen(result=>{
                    const action = labels[argMax(Object.values(result.scores))];
                    if (!_muted.current && _listening.current){
                        log("speech action", action);
                        setAction(action);
                    }else{
                        setAction("");
                    }
                }, {includeSpectrogram:true, probabilityThreshold:0.99})
            }catch(err){

            }
        }else{
            setMuted(true);
        }
        setListening(true);
      }
    
    const setupstorage = ()=>{
        return new Promise((resolve, reject)=>{
            const dbName = "stories";
            const request = indexedDB.open(dbName, 3);
        
            request.onsuccess = event => {
                setDB(event.target.result);  
                resolve();
                return; 
            };
        
            request.onerror = event => {
                reject();
            };
            
            request.onupgradeneeded = event => {
            
                const _db = event.target.result;
                setDB(_db);
                resolve();
                try{
                    _db.createObjectStore("tracks", { keyPath: "id" });
                }
                catch(err){
                    //ignore as thrown when object store already exixts
                }
            };
        });
    }

    useEffect(()=>{
       logger.current = new Logger(new Worker('worker.js')); 
       log("story loaded", storyId);
       
       const start = async ()=>{
            await setupstorage();
            load(storyId);
            await loadModel(); 
       }

       start();

        const getwakelock = async ()=>{
            if ('wakeLock' in navigator) {
                let wakeLock = null;

                // Function that attempts to request a screen wake lock.
                const requestWakeLock = async () => {
                try {
                    wakeLock = await navigator.wakeLock.request();
                    /*wakeLock.addEventListener('release', () => {});*/
                } catch (err) {
                    console.error(`${err.name}, ${err.message}`);
                }
                };
                
                // Request a screen wake lock…
                await requestWakeLock();
            }
        }
        getwakelock();
          
    }, []);
    


    useEffect(()=>{
        if (script){
            setWaypoints(script.reduce((acc, item)=>{
                if (item.waypoint){
                    return [...acc, item.id];
                }
                return acc;
            },[]));
        }
    },[script]);

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
        if (!playing && node){
            Object.keys(node.rules).forEach((key)=>{
                const _key = key.trim();
                
                if (!isNaN(_key)){
                  
                    const setCountdown = (passed=0, finished)=>{
                        
                            
                            setRemaining(Math.round((finished-passed) / 1000));
                            console.log("--->", Math.round((finished-passed) / 1000));
                            if (passed == finished){
                                    nextNode(node.rules[key].toLowerCase());
                                    setAction();
                                    setPlaying(true);
                                    setCountingDown(false);
                            }
                            else{
                                timer.current = setTimeout(()=>setCountdown(passed+1000, finished),1000)
                            }
                        
                    }
                    setCountingDown(true);
                    setCountdown(0,  Number(_key)*1000);
                }
            },{});
        }
    },[node,playing]);

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
                            log("trigger", `${storyId} ${_a}`);
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
    },[action, playing]);

    const startStory = ()=>{
       
        if (listening){
            setListening(false);
        }
        
        let _node = script[0];
        setCurrentNode(_node);
        setPlaying(true);
        setStartPressed(true);
    }

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

            return <AudioPlayer loud={loud} key={i} src={t.src} paused={paused} play={startpressed} onFinish={()=>onFinish(i)}/>
        });
    }

    const nextNode =  (id)=>{
       
        log("scenechange", `${storyId} ${id}`);

        if (id.toLowerCase() === "restart"){
            goHome();
        }

        setListening(false);
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

    const manualTrigger = (key)=>{
        setAction(key.toLocaleLowerCase());
        log("manualpress", `${storyId} ${node.id} ${key}`);
    }

    const renderChoices = ()=>{
        const rules = (node || {}).rules || [];
       
        const tags = Object.keys(rules).map((key)=>{
            if (isNaN(key)){
                return <div  className={styles.keyword} style={{color: key.toLowerCase()==action ? "#01ABB3" : "#7ED8A1"}} key={key} onClick={()=>manualTrigger(key)}>{key}</div>
            }
        });

        if  (!playing && node && node.rules){ 
            return <div className={styles.keywordcontainer}>{tags}</div>
        }
        
    }

    const renderCurrentNode = ()=>{
        const title = node && node.id ? `${storyId} : ${node.id}` : storyId;

        return  <div>
                    {node && <div className={styles.storytextcontainer}>
                        <div className={styles.storytitle}>{title}</div>
                        <div className={styles.storytext}>{format(node.text)}</div>
                    </div>}
                    
                </div>
    }

    const renderMic = ()=>{
        return <div className={styles.micontainer}>
                    <div className={styles.listening}>
                        <MdMic/>
                    </div>
                </div>
    }

    const renderListening = ()=>{
       
        if (!script){
            return <></>
        }

        return <div className={styles.listeningcontainer}> 
                    {listening && node && renderMic()}
                    <div className={styles.heard}>
                        {listening && action && node && <div>{`"${action}"`}</div>}
                    </div>
                </div>
    }

    const fetchFromCache = async (trackid)=>{
        return new Promise((resolve, reject)=>{
            var tx = db.current.transaction("tracks", "readwrite");
            var store = tx.objectStore("tracks");
            const request = store.get(trackid);

            request.onsuccess = event => {
                const {result={}} = event.target;
                const {src} = result;
                resolve(src);
            }

            request.onerror = err =>{
                resolve("");
            }
        });
    }

    const fetchFromServer = ({folder, id})=>{
        return new Promise(async (resolve, reject)=>{
            request.post("/api/loadmedia").query({folder,id}).set('Content-Type', 'application/json').end(async function(err,res){
                if (err){
                    resolve("");
                }else{
                    await saveTrack(id, res.body)
                    resolve(res.body);
                }
            });
        });
    }

    const fetchTrack =  ({useCache=false, folder, id})=>{
       
       return new Promise(async (resolve, reject)=>{
         if (useCache){
            const cached = await fetchFromCache(id);
            if (cached.trim() !== ""){
                console.log("succesfully retrieved track from cache");
                resolve(cached);
                return;
            }
         }
         const src = await fetchFromServer({folder, id});
         resolve(src); 
       })
    }

    
    const saveTrack = (trackid, src)=>{
        
        return new Promise((resolve, reject)=>{
            var tx = db.current.transaction("tracks", "readwrite");
            var store = tx.objectStore("tracks");
            const insert = store.put({id:trackid,src});
            insert.onsuccess = () => {
                resolve();
            }
        });
    }

    const formatprogress = (percent)=>{
        if (percent < 20){
            return `building mountains (${percent}%)`;
        }
        if (percent < 40){
            return `growing forests... (${percent}%)`;
        }
        if (percent < 60){
            return `filling lakes... (${percent}%)`;
        }
        if (percent < 80){
            return `hiring musicians..(${percent}%)`;
        }
        if (percent < 100){
            return `get ready (${percent}%)`;
        }
    }

    const load = (storyId)=>{
        setLoading(true);
        if (!storyId){
            goHome();
        }
        

        request.get('/api/load').query({id:storyId}).then(async (res) => {
            const sources =[];
            const {script,ts} = res.body;
            const latestts = localStorage.getItem(`${storyId}-ts`)
            const havelatest = `${latestts}` == `${ts}`;
           
            console.log("use cache is", havelatest);
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

            
            const tracks = Object.keys(trackstodownload).reduce((acc, id)=>{
                return acc + trackstodownload[id].length;
            },0);
    
            let downloaded = 0;
            let tasks = [], resolved = {};

            for (const id of Object.keys(trackstodownload)){

                tasks = [...tasks,  ...trackstodownload[id].map((trackid)=>{
                    return new Promise(async (resolve, reject)=>{
                        const src = await fetchTrack({useCache:havelatest, folder:storyId, id:trackid});
                        resolved[id] = resolved[id] || [];
                        resolved[id].push({id:trackid, src}); 
                        downloaded+=1;
                        setProgress(formatprogress(Math.round(downloaded/tracks * 100)));
                        resolve();
                    });
                })];
                 
               
            }
            
            Promise.all(tasks).then(()=>{
                Object.keys(resolved).map((id)=>{
                    sources.push({id, tracks:resolved[id]})
                });
                setSources(sources);
                localStorage.setItem(`${storyId}-ts`, ts);
                const _script = script.map(s=>({...s, id:s.id.toLowerCase()}));
                setScript(_script);
                const startnode = sources.find(s=>s.id==_script[0].id);
                
                if (startnode && startnode.tracks){
                    setTracks(startnode.tracks);
                }
               
                setLoading(false);
            });



            /*for (const id of Object.keys(trackstodownload)){
                const resolved = [];    
                for (const trackid of trackstodownload[id]){
                    const src = await fetchTrack({useCache:havelatest, folder:storyId, id:trackid})
                    resolved.push({id:trackid, src}); 
                    downloaded+=1;
                    setProgress(formatprogress(Math.round(downloaded/tracks * 100)));
                }
                sources.push({id, tracks:resolved});
            }
            
            localStorage.setItem(`${storyId}-ts`, ts);

            setSources(sources);
           
            const _script = script.map(s=>({...s, id:s.id.toLowerCase()}));
            setScript(_script);
            const startnode = sources.find(s=>s.id==_script[0].id);
            
            if (startnode && startnode.tracks){
                setTracks(startnode.tracks);
            }
           
            setLoading(false);*/
        })
         .catch(err => {
            setLoading(false);
            setProgress("0%");
            log("loaderror", `${storyId} ${err}`);
            console.log(err);
         });
    }

    const renderLoading = ()=>{
        if (loading){
            return <div className={styles.loadingcontainer}>
                         <div className={styles.imagerow}>
                                <div className={styles.progress}>just loading..</div>
                                <div className={styles.imagecontainer}>
                                    <img src="../../logo.svg" height="200px"/>
                                </div>
                                <div className={styles.progress}>{progress}</div>
                        </div>
                    </div>
        }
    }

// {sources.length > 0 && !node && <button className={styles.startbutton} onClick={startStory}>Start!</button>}
    const renderStory = ()=>{
        if (script){
            
            return <div className={styles.startcontainer} style={{height : node ? 'auto' : "calc(100vh - 80px)" }}>
               
                {sources.length > 0 && !node && <div onClick={startStory} className={styles.imagecontainer}><img className={styles.spinning} src="../../start.png" width="200px" /></div>}
                {sources.length > 0 && !node && <div onClick={startStory} className={styles.progress}>Start!</div>}
                {renderCurrentNode()}       
            </div>
        }
    }

    //TODO LOAD FROM SERVER!!
    const renderCountdown  = ()=>{
        if (countingDown){
            return <div className={styles.countdowncontainer}>
                <div className={styles.countdown}>{remaining}</div>
            </div>
        }
    }

    const setSelected = ({currentKey})=>{
        log("waypointselected",`${storyId} ${currentKey}`);
        clearTimeout(timer.current);
        setCountingDown(false);
        if (listening){
            setListening(false);
        }
        setPlaying(true);
        setPaused(false);
        nextNode(currentKey);
    }

    const renderWaypoints = ()=>{
        if (listening){
            return;
        }
        const items = waypoints.map(w=>{
            return <Dropdown.Item key={w}>{w}</Dropdown.Item>
        })

        return <Dropdown>
                   <Dropdown.Button flat>go to</Dropdown.Button>
                    <Dropdown.Menu
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    onSelectionChange={setSelected}
                    >
                        {items}
                    </Dropdown.Menu>
                </Dropdown>
    }

    const renderMuted = ()=>{
        if(startpressed){
            if (muted){
                return <div onClick={()=>setMuted(!muted)} className={styles.navbaricon}><AiOutlineAudioMuted/></div>
            }
            return <div onClick={()=>setMuted(!muted)} className={styles.navbaricon}><AiOutlineAudio/></div>
        }
    }

    const renderLoudness = ()=>{
        if(startpressed){
            if (loud){
                return <div onClick={()=>setLoud(!loud)} className={styles.navbaricon}><AiFillSound/></div>
            }
            return <div onClick={()=>setLoud(!loud)} className={styles.navbaricon}><AiOutlineSound/></div>
        }
    }
    
    const renderPaused = ()=>{
        if(startpressed){
            if (paused){
                return <div onClick={()=>manualPaused(!paused)} className={styles.navbaricon}><AiOutlinePlayCircle/></div>
            }
            return <div onClick={()=>manualPaused(!paused)} className={styles.navbaricon}><AiOutlinePauseCircle/></div>
        }
    }

    const renderNavBar = ()=>{
       
        return <>
                <Navbar isBordered={false} variant="sticky">
                    <Navbar.Brand>
                   
                    
                        {renderWaypoints()}
                   
                    </Navbar.Brand>
                    <Navbar.Content activeColor={"red"} >
                          
                       
                        <Navbar.Link>
                            {renderLoudness()}
                        </Navbar.Link>
                        <Navbar.Link>
                           {renderPaused()}
                        </Navbar.Link>
                        <Navbar.Link>
                           {renderMuted()}
                        </Navbar.Link>
                    
                    </Navbar.Content>
                   
                </Navbar>
                {showWaypoints && renderWaypoints()}
             </>
                
    }
   
    const renderResponses = ()=>{
        return <>
            {renderListening()}
            {renderChoices()}
            {renderCountdown()}
        </>
    }

    const renderHelpMenu = ()=>{
        return <div className={styles.helpcontainer}> 
       
                <div onClick={goHome} className={styles.tabbaricon}>
                    <AiFillHome/>
                    home
                </div>
                <div onClick={()=>setShowHelp(true)} className={styles.tabbaricon}>
                    <AiFillQuestionCircle/>
                    help
                </div>

                <div onClick={()=>setShowCredits(true)} className={styles.tabbaricon}>
                    <AiOutlineTeam/>
                    credits
                </div>
        </div>
    }

    const renderHelp = ()=>{
          return  <Modal
            closeButton
            aria-labelledby="modal-title"
            open={showhelp}
            onClose={()=>setShowHelp(false)}
        >
            <Modal.Header>
            <Text id="modal-title" size={16}>
               <Text b size={16}>Grow Your Own Adventure. Help!</Text>
            </Text>
            </Modal.Header>
            <Modal.Body>
              <img src="../help.png"/>
            </Modal.Body>
        </Modal>
    }


    const renderCredits = ()=>{
        return  <Modal
          closeButton
          aria-labelledby="modal-title"
          open={showcredits}
          onClose={()=>setShowCredits(false)}
      >
          <Modal.Header>
          <Text id="modal-title" size={18}>
            <Text b size={16}>Grow Your Own Adventure. Credits.</Text>
          </Text>
          </Modal.Header>
          <Modal.Body className={styles.credits}>
            
                <Text b size={16}>Writer <Text size={16}>Matt Beames</Text></Text>
    
          </Modal.Body>
      </Modal>
  }
    return (
        <div className={styles.container}>
            {renderAudioPlayers()}
            {renderNavBar()}
            {renderLoading()}
            {renderStory()}
            {listening && startpressed && renderResponses()}
            {renderHelpMenu()}
            {renderHelp()}
            {renderCredits()}
        </div>
    )
}

export default Player;