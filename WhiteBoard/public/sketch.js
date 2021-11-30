const PEN_SIZE = 10;

var socket;
var otherColors;

function setup() {
    createCanvas(600, 400);
    background(51);

    socket = io.connect();
    socket.on('mouse', otherDrawing)

    otherColors = new Map();
}

function mouseDragged() {
    var data = {
        x: mouseX,
        y: mouseY
    }
    socket.emit('mouse', data);

    noStroke();
    fill(255);
    ellipse(mouseX, mouseY, PEN_SIZE, PEN_SIZE);
}

function otherDrawing(data) {
    var color = otherColors.get(data.id)
    if (!otherColors.get(data.id)) {
        otherColors.set(data.id, {
            r: random(255),
            g: random(255),
            v: random(255)
        })
    }

    noStroke();
    fill(color.r, color.g, color.v);
    ellipse(data.x, data.y, PEN_SIZE, PEN_SIZE);
}