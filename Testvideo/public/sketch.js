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

var socket;

function setup() {
    let canvas = createCanvas(VIDEO_SIZE_X, VIDEO_SIZE_Y);
    canvas.parent('otherVideo');

    // Get the webcam video
    capture = createCapture(VIDEO);
    capture.size(VIDEO_SIZE_X, VIDEO_SIZE_Y);
    capture.parent('ownVideo');

    /* Setup poseNet */

    poseNet = ml5.poseNet(capture, () => {
        console.log('model ready');
    });
    poseNet.on('pose', gotPoses);


    /* Setup socket.io */

    // Open and connect socket - notice new port for socket.io!
    socket = io.connect("http://localhost:3000");

    // Listen for socket connection confirmation
    socket.on('connection', data => {
        console.log("connected");

        setUsername(data.id);

        let parse = JSON.parse(data.alreadyConnect);
        for (const [key, value] of Object.entries(parse)) {
            addTableRow(value);
        }

        sendImage();
    });

    // Listen for someone connection
    socket.on('someoneConnect', data => {
        console.log(data);
        addTableRow(data);
    })

    // Listen for someone disconnection
    socket.on('someoneDisconnect', data => {
        console.log(data);
        removeTableRow(data);
    })

    // Get the image
    socket.on('query', (data) => {
        otherData = data;
        generatedImage = createImg(data.input_image);
        generatedImage.hide();
        // Send another frame from the webcam
        sendImage();
    });
}


function draw() {
    background(220);

    // Draw the image from socket on the canvas
    if (generatedImage) {
        image(generatedImage, 0, 0, VIDEO_SIZE_X, VIDEO_SIZE_Y);

        let d = dist(otherData.noseX, otherData.noseY, otherData.eyelX, otherData.eyelY);

        fill(255, 0, 0);
        ellipse(noseX, noseY, d);
        // fill(0,0,255);
        // ellipse(eyelX, eyelY, 50);
    }
}

function addTableRow(data) {
    let tr = document.createElement('tr');
    tr.dataset.userid = data.id;
    tr.innerHTML = `
        <td>${data.id}</td>
        <td>${data.name}</td>
        <td>
            <button type="button" class="btn btn-success">Join</button>
        </td>
    `;

    document.querySelector('#userTable tbody').append(tr);
}

function removeTableRow(data) {
    document.querySelector(`#userTBody [data-userid=${data.id}]`).remove();
}

function setUsername(username) {
    document.getElementById('username').placeholder = username;
}

function sendImage() {
    // If we're getting webcam feed, save a frame as a Base64 image
    if (capture) {
        capture.loadPixels();
        let imageString = capture.canvas.toDataURL('image/webp');

        // And send it
        socket.emit('query', {
            input_image: imageString,
            noseX: noseX,
            noseY: noseY,
            eyelX: eyelX,
            eyelY: eyelY
        });
    }
}

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