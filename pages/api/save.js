import firebase from '../../lib/firebase';

export default async function handler(req, res) {

    console.log("incoming", req.method);

    if (req.method !== 'POST') {
        //res.status(405).send({ message: 'Only POST requests allowed' })
        ///return
    }
    const {id, script} = req.body;
    console.log("seen post", id, script);
    if (id && script){
        const docRef = firebase.collection("scripts").doc(id);
        await docRef.set({...script, ts:Date.now()});
        res.status(200).json({ success: true})
    }else{
        res.status(405).send({message: "Malformed request"})
    }
}