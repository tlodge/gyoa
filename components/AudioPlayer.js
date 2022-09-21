import {useEffect, useState, useRef} from 'react';



function AudioPlayer({src, onFinish, play, paused}) {
    
   const playerRef = useRef();
   const [initialised, setInitialised] = useState(false);

   useEffect(()=>{
     if (initialised){
        if (paused){
            playerRef.current.pause();
        }else{
            playerRef.current.play();
        }
     }
   },[paused]);

    useEffect(()=>{
        
        if(play){
            setInitialised(true);
            const audioCtx = new AudioContext();
            const myAudio = playerRef.current;
            
            const source = audioCtx.createMediaElementSource(myAudio);
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 20;
            source.connect(gainNode);
            
            gainNode.connect(audioCtx.destination)
            playerRef.current.src = src;   
            playerRef.current.play();
            playerRef.current.onended = ()=>{
                onFinish();
            };
        }
    },[play, src]);
   
    

    return (
        <audio src={src}  ref={playerRef} style={{display:"none"}} />
    )
}

export default AudioPlayer;
