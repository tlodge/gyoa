import firebase from '../../lib/firebase';

export default async function handler(req, res) {
    const {id="tempid", script} = req.body;
    console.log("seen post", id, script);
    const docRef = firebase.collection("scripts").doc(id);
    await docRef.set({...script, ts:Date.now()});
    res.status(200).json({ success: true})
}