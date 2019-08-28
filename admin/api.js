const API = {
    data: {
        post: function(fileName, year, json) {
            let postData = {
                fileName: fileName,
                year: year,
                data: json,
            }
            let request = new XMLHttpRequest();
            request.open("POST", "./jsondatahandler.php", true);
            request.setRequestHeader("Content-type", "application/json")
            request.send(JSON.stringify(postData));
        },
        get: function(fileName, year, callback) {
            let xhttp = new XMLHttpRequest();
            let filename = `./siteData/${year}/${fileName}.json`;
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    let data = JSON.parse(xhttp.responseText);
                    if(callback) callback(data);
                }
            };
            xhttp.open("GET", filename, true);
            xhttp.send();
        }
    },
    document: {
        post: function(fileName, year, file) {

        },
        get: function(fileName, year) {

        }
    }

}

const FileUtil = {
    uploadFile: function(viewInput, year, callback) {
        //applies to any file - image, document, pdf, etc etc
        //view input is the file input element
        const files = viewInput.files;
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            let file = files[i];          
            formData.append('files[]', file);
        }
        formData.append('year[]', year);
        fetch('process_files.php', {
            method: 'POST',
            body: formData,
        }).then(response => {
            //console.log(response)
            if(callback) callback();
        });
    }
}