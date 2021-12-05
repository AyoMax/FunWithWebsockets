const VIDEO_SIZE_X = 320;
const VIDEO_SIZE_Y = 240;

let capture;
let poseNet;
let noseX = 0;
let noseY = 0;
let eyelX = 0;
let eyelY = 0;

let generatedImage;
let otherData;

let socket;
let socketId;


/*==============*/
/* P5 METHOD(S) */
/*==============*/

function setup() {
    document.getElementById('otherTable').style.display = 'none';

    let canvas = createCanvas(VIDEO_SIZE_X*2, VIDEO_SIZE_Y);
    canvas.parent('otherVideo');

    // Get the webcam video
    capture = createCapture(VIDEO);
    capture.size(VIDEO_SIZE_X, VIDEO_SIZE_Y);
    capture.hide();

    /* Setup poseNet */
    poseNet = ml5.poseNet(capture, () => { console.log('model ready'); });
    poseNet.on('pose', gotPoses);


    /* Setup socket.io */

    // Open and connect socket - notice new port for socket.io!
    // socket = io.connect("http://localhost:3000");
    socket = io.connect();

    // Listen for socket connection confirmation
    socket.on('connection', data => {
        console.log("connected");

        socketId = data.id;
        setUsername(data.id);

        let parse = JSON.parse(data.alreadyConnect);
        for (const [key, value] of Object.entries(parse)) {
            if(value.reachable) {
                addTableRow(value);
            }
        }
    });

    // Listen for someone connection
    socket.on('someoneConnect', data => {
        addTableRow(data);
    })

    // Listen for someone disconnection
    socket.on('someoneDisconnect', data => {
        removeTableRow(data);
    });

    // Listen for someone being reachable
    socket.on('reachable', data => {
        data.reachable.forEach(userdata => {
            if (userdata.id !== socketId) addTableRow(userdata);
        });
    });

    // Listen for someone being unreachable
    socket.on('unreachable', data => {
        data.unreachable.forEach(userdata => {
            if (userdata.id !== socketId) removeTableRow(userdata);
        });
    });

    // Listen for join confirmation
    socket.on('joinOther', data => {
        document.getElementById('otherTable').style.display = 'initial';
        document.getElementById('usersTable').style.display = 'none';
        document.querySelector('#otherUsername').textContent = data.other.id;
        sendImage();
    });

    // Listen for quit confirmation
    socket.on('quitOther', () => {
        document.getElementById('otherTable').style.display = 'none';
        document.getElementById('usersTable').style.display = 'initial';
    });

    // Get the image
    socket.on('query', (data) => {
        // console.log(data);
        otherData = data;
        generatedImage = createImg(data.input_image);
        generatedImage.hide();
        // Send another frame from the webcam
        sendImage();
    });
}

function draw() {
    background(220);

    // Draw own image
    image(capture, 0, 0);

    let dOwn = dist(noseX, noseY, eyelX, eyelY);

    fill(255, 0, 0);
    ellipse(noseX, noseY, dOwn);

    // Draw the image from socket on the canvas
    if (generatedImage) {
        image(generatedImage, VIDEO_SIZE_X, 0, VIDEO_SIZE_X, VIDEO_SIZE_Y);

        let dOther = dist(otherData.noseX, otherData.noseY, otherData.eyelX, otherData.eyelY);

        fill(255, 0, 0);
        ellipse(VIDEO_SIZE_X + otherData.noseX, otherData.noseY, dOther);
    }
}


/*=====================*/
/* HTML EDIT METHOD(S) */
/*=====================*/

function addTableRow(data) {
    let tr = document.createElement('tr');
    tr.dataset.userid = data.id;
    tr.innerHTML = `
        <td>${data.id}</td>
        <td>
            <button type="button" class="btn btn-success" data-action="join" onclick="joinOther('${data.id}')">Join</button>
        </td>
    `;

    document.querySelector('#usersTable tbody').append(tr);
}

function removeTableRow(data) {
    document.querySelector(`#usersTable [data-userid="${data.id}"]`).remove();
}

function setUsername(username) {
    document.getElementById('username').value = username;
}

/*==========================*/
/* EVENT LISTENER METHOD(S) */
/*==========================*/

function joinOther(otherId) {
    socket.emit('joinOther', {
        other: {
            id: otherId
        }
    })
}

function quitOther() {
    socket.emit('quitOther')
}


/*==================*/
/* SOCKET METHOD(S) */
/*==================*/

function sendImage() {
    // If we're getting webcam feed, save a frame as a Base64 image
    if (capture) {
        capture.loadPixels();
        let imageString = capture.canvas.toDataURL('image/jpeg');

        // And send it
        socket.emit('query', {
            input_image: imageString,
            noseX,
            noseY,
            eyelX,
            eyelY
        });
    }
}


/*===============*/
/* ML5 METHOD(S) */
/*===============*/

function gotPoses(poses) {
    // console.log(poses);
    if (poses.length > 0) {
        let nX = poses[0].pose.keypoints[0].position.x;
        let nY = poses[0].pose.keypoints[0].position.y;
        let eX = poses[0].pose.keypoints[1].position.x;
        let eY = poses[0].pose.keypoints[1].position.y;
        noseX = lerp(noseX, nX, 0.5);
        noseY = lerp(noseY, nY, 0.5);
        eyelX = lerp(eyelX, eX, 0.5);
        eyelY = lerp(eyelY, eY, 0.5);
    }
}