const size = {width: 0, height: 0, halfWidth: 0, halfHeight: 0};
let canvas;

let nodes = [];
let rails = [];
let turnouts = [];

let tempNode;
let firstClickNode;
let tempRail;
let tempTurnout;

const SNAP_DISTANCE = 100_000_000;

let drawNodes = true;
let side = false;
let direction;
let nodeType = 0;

let tool = 0;
const tools = ["pan", "node", "rail", "turnouts"];
const mouse = {x: null, y: null, prevX: null, prevY: null};
let click = 0;

let scale = 0.001;
const offset = {x: 0, y: 0, prevX: 0, prevY: 0};

const uploadFile = {input: null, time: 0};
let reader;

function setup() {
    size.width = windowWidth - 24;
    size.height = windowHeight - 20;
    size.halfWidth = size.width >> 1;
    size.halfHeight = size.height >> 1;
    canvas = createCanvas(size.width, size.height);
    canvas.mousePressed(canvasMousePressed);
    canvas.mouseReleased(canvasMouseReleased);
    canvas.mouseWheel(canvasMouseWheel);
    uploadFile.input = document.getElementById("upload");
    reader = new FileReader();

    direction = createVector(1, 0);

    // turnouts.push(new Turnout18(2500, 2500, createVector(1, 0), true));
    // turnouts.push(new Turnout18(2500, -2500, createVector(1, 0), false));
    // turnouts.push(new Turnout18(-2500, 2500, createVector(-1, 0), false));
    // turnouts.push(new Turnout18(-2500, -2500, createVector(-1, 0), true));
    // turnouts.push(new Turnout18(-2500, 2500, createVector(0, 1), true));
    // turnouts.push(new Turnout18(2500, 2500, createVector(0, 1), false));
    // turnouts.push(new Turnout18(-2500, -2500, createVector(0, -1), false));
    // turnouts.push(new Turnout18(2500, -2500, createVector(0, -1), true));
}

function draw() {
    clear();
    if (windowWidth - 24 !== size.width || windowHeight - 20 !== size.height) {
        size.width = windowWidth - 24;
        size.height = windowHeight - 20;
        size.halfWidth = size.width >> 1;
        size.halfHeight = size.height >> 1;
        canvas = createCanvas(size.width, size.height);
        textSize(size.width / 80);
    }
    fill(0);
    noStroke();
    text("Tool: " + tools[tool], size.width / 2, 20);
    stroke(0);
    if (drawNodes) {
        nodes.forEach(function (node) {
            node.draw()
        });
    }
    rails.forEach(function (rail) {
        rail.draw()
        console.log(rail);
    });
    turnouts.forEach(function (turnout) {
        turnout.draw()
    });

    const transformed = transform(mouseX, mouseY);
    switch (tool) {
        case 0:
            break;
        case 1:
            tempNode = new Node(transformed.x, transformed.y, createVector(0, 1));
            tempNode.draw();
            break;
        case 2:
            if (2 <= click && click <= 4) {
                const closest = getClosestNodeWithinSnap(transformed.x, transformed.y);
                tempRail = new Rail(firstClickNode, closest === null ? new Node(transformed.x, transformed.y) : closest);
                tempRail.draw();
            }
            break;
        case 3:
            const closest = getClosestNodeWithinSnap(transformed.x, transformed.y);
            if (closest !== null) {
                tempTurnout = Turnout18.createWithNode(closest, nodeType, side);
            } else {
                tempTurnout = Turnout18.createWithPos(transformed.x, transformed.y, direction, side);
            }
            tempTurnout.draw();
            break;
    }
    options();
    if (mouseIsPressed) {
        if (mouse.x === null && mouse.y === null && (mouseX !== 0 || mouseY !== 0)) {
            canvasMousePressed();
        }
        if (click) {
            switch (tool) {
                case 0:
                    offset.x = offset.prevX + mouseX - mouse.x;
                    offset.y = offset.prevY + mouseY - mouse.y;
                    break;
            }
        }
    }
    upload();
}

function canvasMousePressed() {
    mouse.x = mouseX;
    mouse.y = mouseY;
    if ((size.halfWidth >> 1) - 24 < mouse.x && mouse.x < (size.halfWidth >> 1) - 4 && 6 < mouse.y && mouse.y < 26) {
        selectedBody = null;
    } else if (5 * size.halfWidth / 3 - 1 < mouse.x && mouse.x < 5.5 * size.halfWidth / 3 - 1 && mouse.y < size.halfHeight >> 3) {
        startUpload();
    } else if (5.5 * size.halfWidth / 3 - 1 < mouse.x && mouse.y < size.halfHeight >> 3) {
        download();
    } else {
        offset.prevX = offset.x;
        offset.prevY = offset.y;
        click++;
        const transformed = transformObject(mouse);
        switch (tool) {
            case 2:
                if (click === 1) {
                    const closest = getClosestNodeWithinSnap(transformed.x, transformed.y);
                    if (closest !== null) {
                        firstClickNode = closest;
                    } else {
                        click = -1;
                    }
                }
                break;
        }
    }
}

function canvasMouseReleased() {
    click++;
    const transformed = transform(mouseX, mouseY);
    switch (tool) {
        case 1:
            nodes.push(new Node(transformed.x, transformed.y));
            click = 0;
            break;
        case 2:
            if (click === 4 && firstClickNode !== null) {
                const closest = getClosestNodeWithinSnap(transformed.x, transformed.y);
                if (closest !== null) {
                    rails.push(new Rail(firstClickNode, closest));
                    console.log(rails);
                }
                click = 0;
            }
            break;
        case 3:
            if (click === 2) {
                turnouts.push(tempTurnout);
                click = 0;
            }
    }
}

function canvasMouseWheel(event) {
    if (event.deltaY !== 0) {
        let change = Math.pow(Math.abs(event.deltaY), 1 / 20);
        if (event.deltaY > 0) {
            change = 1 / change;
        }
        scale *= change;
        mouse.x = mouseX - size.halfWidth;
        mouse.y = mouseY - size.halfHeight;
        offset.x = mouse.x + (offset.x - mouse.x) * change;
        offset.y = mouse.y + (offset.y - mouse.y) * change;
    }
}

function keyPressed() {
    if (keyCode === BACKSPACE) {
        if (click !== 0) {
            click = 0;
        } else {
            switch (tool) {
                case 0:
                    break;
                case 1:
                    nodes.pop();
                    break;
                case 2:
                    rails.pop();
                    break;
                case 3:
                    turnouts.pop();
                    break;
            }
        }
    }
    switch (key) {
        case '0':
            tool = 0;
            click = 0;
            break;
        case '1':
            tool = 1;
            click = 0;
            break;
        case '2':
            tool = 2;
            click = 0;
            break;
        case '3':
            tool = 3;
            click = 0;
            break;
        case 'r':
            direction.x = -direction.x;
            direction.y = -direction.y;
            break;
        case 'f':
            side = !side;
            break;
        case 'n':
            drawNodes = !drawNodes;
            break;
        case 't':
            nodeType++;
            nodeType %= 4;
            break;
    }
}

function transformObject(object) {
    return transform(object.x, object.y);
}

function transform(x, y) {
    return {
        x: (x - offset.x - size.halfWidth) / scale, y: (y - offset.y - size.halfHeight) / scale
    };
}

function getClosestNodeWithinSnap(x, y) {
    const closest = getClosestNode(x, y);
    if (closest !== null && closest.distance < SNAP_DISTANCE) {
        return closest.node;
    }
    return null;
}

function getClosestNode(x, y) {
    let closest = null;
    nodes.forEach(function (node) {
        if (closest === null || distanceSquared(x, y, node.pos.x, node.pos.y) < distanceSquared(x, y, closest.pos.x, closest.pos.y)) {
            closest = node;
        }
    });
    turnouts.forEach(function (turnout) {
        [turnout.frontNode, turnout.backNode, turnout.sideNode].forEach(function (node) {
            if (closest === null || distanceSquared(x, y, node.pos.x, node.pos.y) < distanceSquared(x, y, closest.pos.x, closest.pos.y)) {
                closest = node;
            }
        });
    });
    return closest === null ? null : {node: closest, distance: distanceSquared(x, y, closest.pos.x, closest.pos.y)};
}

function distanceSquaredVectors(a, b) {
    return distanceSquared(a.x, a.y, b.x, b.y);
}

function distanceSquared(x1, y1, x2, y2) {
    return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}

function drawLine(x1, y1, x2, y2) {
    line(x1 * scale + size.halfWidth + offset.x, y1 * scale + size.halfHeight + offset.y, x2 * scale + size.halfWidth + offset.x, y2 * scale + size.halfHeight + offset.y);
}

function drawCircle(x, y, r) {
    ellipse(x * scale + size.halfWidth + offset.x, y * scale + size.halfHeight + offset.y, r);
}

function options() {
    noFill();
    stroke(0);
    textSize(size.width / 60);
    textAlign(CENTER, CENTER);
    let sixthWidth = size.halfWidth / 3;
    rect(5 * sixthWidth - 1, 1, sixthWidth, size.halfHeight >> 3);
    line(5.5 * sixthWidth - 1, 1, 5.5 * sixthWidth - 1, (size.halfHeight >> 3) + 1);
    fill(0);
    noStroke();
    text("Upload", 5.25 * sixthWidth - 1, (size.halfHeight >> 4) + 1);
    text("Download", 5.75 * sixthWidth - 1, (size.halfHeight >> 4) + 1);
}

class Node {
    constructor(x, y, direction) {
        this.pos = createVector(x, y);
        this.direction = direction;
    }

    draw() {
        drawCircle(this.pos.x, this.pos.y, 5);
    }
}

class Rail {
    constructor(startNode, endNode) {
        this.startNode = startNode;
        this.endNode = endNode;
    }

    draw() {
        drawLine(this.startNode.pos.x, this.startNode.pos.y, this.endNode.pos.x, this.endNode.pos.y);
    }
}

class Turnout {
    static FRONT = 0;
    static MIDDLE = 1;
    static BACK = 2;
    static SIDE = 3;

    static builder(id, angle, frontLength, backLength, sideLength, side) {
        const turnout = new Turnout();
        turnout.angle = side ? angle : -angle;
        turnout.id = id;
        turnout.side = side;
        turnout.frontLength = frontLength;
        turnout.backLength = backLength;
        turnout.sideLength = sideLength;
        return turnout;
    }

    withPos(x, y, direction) {
        direction = direction.normalize();
        this.pos = createVector(x, y);
        this.direction = direction;
        const radians = toRadians(this.angle);
        this.sideDirection = p5.Vector.add(createVector(Math.cos(radians), Math.sin(radians)).mult(direction.x), createVector(-Math.sin(radians), Math.cos(radians)).mult(direction.y));
        this.frontNode = new Node(x, y, direction);
        this.middleNode = new Node(x + direction.x * this.frontLength, y + direction.y * this.frontLength, direction);
        this.backNode = new Node(this.middleNode.pos.x + direction.x * this.backLength, this.middleNode.pos.y + direction.y * this.backLength, direction);
        this.sideNode = new Node(this.middleNode.pos.x + this.sideDirection.x * this.sideLength, this.middleNode.pos.y + this.sideDirection.y * this.sideLength, this.sideDirection);
        this.createRails();
        return this;
    }

    withNode(node, nodeType) {
        const radians = toRadians(this.angle);
        let turnoutDirection;
        if (distanceSquaredVectors(direction, node.direction) > 2) {
            turnoutDirection = node.direction.mult(-1);
        } else {
            turnoutDirection = node.direction;
        }
        switch (nodeType) {
            case Turnout.FRONT:
                this.direction = turnoutDirection;
                this.pos = createVector(node.pos.x, node.pos.y);
                this.sideDirection = p5.Vector.add(createVector(Math.cos(radians), Math.sin(radians)).mult(this.direction.x), createVector(-Math.sin(radians), Math.cos(radians)).mult(this.direction.y));
                this.frontNode = node;
                this.middleNode = new Node(node.pos.x + this.direction.x * this.frontLength, node.pos.y + this.direction.y * this.frontLength, this.direction);
                this.backNode = new Node(this.middleNode.pos.x + this.direction.x * this.backLength, this.middleNode.pos.y + this.direction.y * this.backLength, this.direction);
                this.sideNode = new Node(this.middleNode.pos.x + this.sideDirection.x * this.sideLength, this.middleNode.pos.y + this.sideDirection.y * this.sideLength, this.sideDirection);
                this.createRails();
                break;
            case Turnout.MIDDLE:
                this.direction = turnoutDirection;
                this.pos = createVector(node.pos.x - this.direction.x * this.frontLength, node.pos.y - this.direction.y * this.frontLength);
                this.sideDirection = p5.Vector.add(createVector(Math.cos(radians), Math.sin(radians)).mult(this.direction.x), createVector(-Math.sin(radians), Math.cos(radians)).mult(this.direction.y));
                this.frontNode = new Node(this.pos.x, this.pos.y, this.direction);
                this.middleNode = node;
                this.backNode = new Node(node.pos.x + this.direction.x * this.backLength, node.pos.y + this.direction.y * this.backLength, this.direction);
                this.sideNode = new Node(node.pos.x + this.sideDirection.x * this.sideLength, node.pos.y + this.sideDirection.y * this.sideLength, this.sideDirection);
                this.createRails();
                break;
            case Turnout.BACK:
                this.direction = turnoutDirection;
                this.pos = createVector(node.pos.x - this.direction.x * (this.frontLength + this.backLength), node.pos.y - this.direction.y * (this.frontLength + this.backLength));
                this.sideDirection = p5.Vector.add(createVector(Math.cos(radians), Math.sin(radians)).mult(this.direction.x), createVector(-Math.sin(radians), Math.cos(radians)).mult(this.direction.y));
                this.frontNode = new Node(this.pos.x, this.pos.y, this.direction);
                this.middleNode = new Node(this.pos.x + this.direction.x * this.frontLength, this.pos.y + this.direction.y * this.frontLength, this.direction);
                this.backNode = node;
                this.sideNode = new Node(this.middleNode.pos.x + this.sideDirection.x * this.sideLength, this.middleNode.pos.y + this.sideDirection.y * this.sideLength, this.sideDirection);
                this.createRails();
                break;
            case Turnout.SIDE:
                this.sideDirection = turnoutDirection;
                this.direction = p5.Vector.add(createVector(Math.cos(-radians), Math.sin(-radians)).mult(this.sideDirection.x), createVector(-Math.sin(-radians), Math.cos(-radians)).mult(this.sideDirection.y));
                this.pos = createVector(node.pos.x - this.sideDirection.x * this.sideLength - this.direction.x * this.frontLength, node.pos.y - this.sideDirection.y * this.sideLength - this.direction.y * this.frontLength);
                this.frontNode = new Node(this.pos.x, this.pos.y, this.direction);
                this.middleNode = new Node(this.pos.x + this.direction.x * this.frontLength, this.pos.y + this.direction.y * this.frontLength, this.direction);
                this.backNode = new Node(this.middleNode.pos.x + this.direction.x * this.backLength, this.middleNode.pos.y + this.direction.y * this.backLength, this.direction);
                this.sideNode = node;
                this.createRails();
        }
        return this;
    }

    createRails() {
        this.frontRail = new Rail(this.frontNode, this.middleNode);
        this.endRail = new Rail(this.middleNode, this.backNode);
        this.sideRail = new Rail(this.middleNode, this.sideNode);
    }

    draw() {
        if (drawNodes) {
            this.frontNode.draw();
            this.middleNode.draw();
            this.backNode.draw();
            this.sideNode.draw();
        }
        this.frontRail.draw();
        this.endRail.draw();
        this.sideRail.draw();
    }
}

class Turnout18 extends Turnout {
    static createWithPos(x, y, direction, side) {
        return super.builder(18, 3.179831, 31729, 37271, 37263, side).withPos(x, y, direction);
    }

    static createWithNode(node, nodeType, side) {
        return super.builder(18, 3.179831, 31729, 37271, 37263, side).withNode(node, nodeType);
    }
}

function toRadians(angle) {
    return angle * (Math.PI / 180);
}

function download() {
    let config = {
        body: {
            scale: scale,
            offset: {x: offset.x, y: offset.y},
        },
        nodes: [],
        rails: [],
        turnouts: []
    };
    nodes.forEach(function (node) {
        config.nodes.push({
            pos: {x: node.pos.x, y: node.pos.y},
            direction: {x: node.direction.x, y: node.direction.y}
        });
    });
    rails.forEach(function (rail) {
        config.rails.push({
            startNode: rail.startNode,
            endNode: rail.endNode
        });
    });
    turnouts.forEach(function (turnout) {
        config.turnouts.push({
            id: turnout.id,
            pos: {x: turnout.pos.x, y: turnout.pos.y},
            direction: {x: turnout.direction.x, y: turnout.direction.y},
            side: turnout.side,
        });
    })
    let element = document.createElement("a");
    element.setAttribute("href", URL.createObjectURL(new Blob([JSON.stringify(config)])));
    element.setAttribute("download", "configuration.json");
    element.click();
    element.remove();
}

function startUpload() {
    if (confirm("The current configuration will be lost!")) {
        if (uploadFile.input !== null) {
            uploadFile.input.remove();
            uploadFile.input = null;
        }
        uploadFile.input = document.createElement("input");
        uploadFile.input.setAttribute("type", "file");
        uploadFile.input.style.display = "none";
        uploadFile.input.click();
        uploadFile.time = Date.now();
    }
}

function upload() {
    if (uploadFile.input !== null) {
        if (uploadFile.input.files[0] !== undefined) {
            if (uploadFile.input.files[0].type === "application/json") {
                reader.readAsText(uploadFile.input.files[0]);
                reader.onload = function () {
                    try {
                        let config = JSON.parse(reader.result);
                        scale = config.body.scale;
                        offset.x = config.body.offset.x;
                        offset.y = config.body.offset.y;
                        let loadNodes = [];
                        let loadRails = [];
                        let loadTurnouts = [];
                        config.nodes.forEach(function (node) {
                            loadNodes.push(new Node(node.pos.x, node.pos.y, node.direction));
                        });
                        config.rails.forEach(function (rail) {
                            loadRails.push(new Rail(rail.startNode, rail.endNode));
                        });
                        config.turnouts.forEach(function (turnout) {
                            switch (turnout.id) {
                                case 18:
                                    loadTurnouts.push(Turnout18.createWithPos(turnout.pos.x, turnout.pos.y, createVector(turnout.direction.x, turnout.direction.y), turnout.side));
                                    break;
                                default:
                                    alert("Failed: Loaded unknown turnout id: " + turnout.id);
                            }
                        });
                        nodes = loadNodes;
                        rails = loadRails;
                        turnouts = loadTurnouts;
                    } catch (e) {
                        alert("Failed: Incorrect configuration format.")
                    }
                }
            } else {
                alert("Failed: Incorrect file type.");
            }
            uploadFile.input.remove();
            uploadFile.input = null;
        }
        if (uploadFile.time + 100000 < Date.now()) {
            uploadFile.input.remove();
            uploadFile.input = null;
            alert("Failed: Upload timed out.");
        }
    }
}