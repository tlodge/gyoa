




onmessage = (e) => {
    console.log('Message received from main script');
    try{
        const [id, type, data] = e.data;
        const payload = JSON.stringify({bts:Date.now(),id,type,data})
        

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
    }catch(err){
        //pass
    }
}