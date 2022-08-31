import {id} from '../';
import { openDB, deleteDB, wrap, unwrap } from 'idb';

export async function generate(passages){
    console.log("am  going to export", passages);    
 
    const  db = await openDB('recordings', 3, upgradeDB =>  upgradeDB.createObjectStore("audio", { keyPath: "id" }))  
    let tx = db.transaction('audio', 'readwrite')
    let store = tx.objectStore('audio')
    const tracks = {};

    for (const item of passages){    
        if (db){
            const record = await store.get(id(item.name));
            if (record){
                tracks[id(item.name)] = record.tracks
            }
        }
    }

    const script = passages.reduce((acc, item)=>{
        return [...acc, {id: id(item.name), words: id(item.name), narrator: item.tags[0], rules: item.link.reduce((acc,item)=>{
            return {
                ...acc,
                [item.label] : item.link
            }
        },{})}]
    },[])

    console.log("tracks are", tracks);
    
    return {tracks,script};
}