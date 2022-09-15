




onmessage = (e) => {
    console.log('Message received from main script');
    const [id, type, data] = e.data;
    const payload = JSON.stringify({id,type,data})
    var xmlhttp = new XMLHttpRequest();   // new HttpRequest instance 

    xmlhttp.onload = () => {

        // print JSON response
        if (xmlhttp.status >= 200 && xmlhttp.status < 300) {
            // parse JSON
            const response = JSON.parse(xmlhttp.responseText);
            console.log(response);
        }
    };

    var theUrl = "/api/log";
    xmlhttp.open("POST", theUrl);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');

    xmlhttp.send(payload);
}

/*const _log = (id,type,data)=>{
    
    return new Promise((resolve, reject)=>{
        if (id && type && data){
            request.get('/api/log').query({id,type,data}).then(()=>{
                console.log("done!!");
                resolve();
            })
        }
        resolve();
    });
}*/