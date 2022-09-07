import firebase from '../../lib/firebase';

export default async function handler(req, res) {
    const {id, script} = req.body;
    const docRef = firebase.collection("scripts").doc(id);
    await docRef.set({...script, ts:Date.now()});
    res.status(200).json({ success: true})
}