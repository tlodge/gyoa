import firebase from '../../lib/firebase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }
    const {id, script} = req.body;
    if (id && script){
        console.log("seen post", id, script);
        const docRef = firebase.collection("scripts").doc(id);
        await docRef.set({...script, ts:Date.now()});
        res.status(200).json({ success: true})
    }else{
        res.status(405).send({message: "Malformed request"})
    }
}