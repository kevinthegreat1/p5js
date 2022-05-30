let size = {width: 0, height: 0, halfWidth: 0, halfHeight: 0};
let canvas;

const gravitationalConstant = 0.00000000006674;
let celestialBodies = [];

let mouse = {x: null, y: null};
let click = false;
let change = false;
let simulate = false;
let frame = 1;
let simulationFrame = 0;
let modFrame1 = 0;
let modFrame2 = 1;
let modSimulationFrame = 0;

let storeFrames = 600;      //amount of frames stored ({calculateFrames} frames ahead and {storeFrames - calculateFrames} frames behind)
let calculateFrames = 300;  //amount of frames to calculate ahead (the length of the path)
let speed = 5;         //real time: 1/frameRate
let scale = 0.02;
let offset = {x: 0, y: 0, prevX: 0, prevY: 0};
let relativeBody = null;
let followBody = null;
let selectedBody = null;

let upload = {input: null, time: 0};
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
    textSize(size.width / 80);
    textAlign(CENTER, CENTER);
    upload.input = document.getElementById("upload");
    reader = new FileReader();

    //temp
    followBody = 0;
    selectedBody = 1;
    celestialBodies.push(new CelestialBody(0, 0, 0, 0, 1500, 1685645789631405600));
    celestialBodies.push(new CelestialBody(-10000, 0, 0, 108, 300, 13485166317051244));
    celestialBodies.push(new CelestialBody(100000, 0, 0, 0, 500, 37458795325142344));
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
        console.log("resized");
    }
    if (change) {
        frame = 1;
        simulationFrame = 0;
        modFrame1 = 0;
        modFrame2 = 1;
        modSimulationFrame = 0;
        change = false;
    }
    if (followBody !== null) {
        if (relativeBody !== null) {
            offset.x = (celestialBodies[relativeBody].pos[modSimulationFrame].x - celestialBodies[followBody].pos[modSimulationFrame].x) * scale;
            offset.y = (celestialBodies[relativeBody].pos[modSimulationFrame].y - celestialBodies[followBody].pos[modSimulationFrame].y) * scale;
        } else {
            offset.x = (-celestialBodies[followBody].pos[modSimulationFrame].x) * scale;
            offset.y = (-celestialBodies[followBody].pos[modSimulationFrame].y) * scale;
        }
    }
    celestialBodies.forEach(function (celestialBody) {
        calibrateEllipse(celestialBody, modSimulationFrame);
        for (let i = 1; i < Math.min(celestialBody.pos.length, calculateFrames); i++) {
            calibrateLine(celestialBody, (modSimulationFrame + i - 2) % storeFrames + 1, (modSimulationFrame + i - 1) % storeFrames + 1);
        }
    });
    options();
    if (simulate) {
        showNextFrame();
    }
    calculateNextFrame();
    if (mouseIsPressed) {
        if (mouse.x === null && mouse.y === null && (mouseX !== 0 || mouseY !== 0)) {
            canvasMousePressed();
        }
        if (click) {
            offset.x = offset.prevX + mouseX - mouse.x;
            offset.y = offset.prevY + mouseY - mouse.y;
            if (followBody !== null && (offset.x - offset.prevX > 50 || offset.y - offset.prevY > 50)) {
                followBody = null;
            }
        }
    }
    if (keyIsDown(37)) {
        showPrevFrame();
    } else if (keyIsDown(39)) {
        showNextFrame();
        calculateNextFrame();
    }
    if (upload.input !== null) {
        if (upload.input.files[0] !== undefined) {
            if (upload.input.files[0].type === "application/json") {
                reader.readAsText(upload.input.files[0]);
                reader.onload = function () {
                    let t = [];
                    try {
                        let config = JSON.parse(reader.result);
                        storeFrames = config.body.storeFrames;
                        calculateFrames = config.body.calculateFrames;
                        speed = config.body.speed;
                        scale = config.body.scale;
                        offset.x = config.body.offset.x;
                        offset.y = config.body.offset.y;
                        relativeBody = config.body.relativeBody;
                        followBody = config.body.followBody;
                        selectedBody = config.body.selectedBody;
                        config.celestialBodies.forEach(function (celestialBody) {
                            t.push(new CelestialBody(celestialBody.pos.x, celestialBody.pos.y, celestialBody.initialVelocity.x, celestialBody.initialVelocity.y, celestialBody.radius, celestialBody.mass));
                        });
                        celestialBodies = t;
                        change = true;
                    } catch (e) {
                        alert("Failed: Incorrect configuration format.")
                    }
                }
            } else {
                alert("Failed: Incorrect file type.");
            }
            upload.input.remove();
            upload.input = null;
        }
        if (upload.time + 100000 < Date.now()) {
            upload.input.remove();
            upload.input = null;
            alert("Failed: Upload timed out.");
        }
    }
}

function canvasMousePressed() {
    mouse.x = mouseX;
    mouse.y = mouseY;
    if ((size.halfWidth >> 1) - 24 < mouse.x && mouse.x < (size.halfWidth >> 1) - 4 && 6 < mouse.y && mouse.y < 26) {
        selectedBody = null;
    } else if (5 * size.halfWidth / 3 - 1 < mouse.x && mouse.x < 5.5 * size.halfWidth / 3 - 1 && mouse.y < size.halfHeight >> 3) {
        if (confirm("The current configuration will be lost!")) {
            if (upload.input !== null) {
                upload.input.remove();
                upload.input = null;
            }
            upload.input = document.createElement("input");
            upload.input.setAttribute("type", "file");
            upload.input.style.display = "none";
            upload.input.click();
            upload.time = Date.now();
        }
    } else if (5.5 * size.halfWidth / 3 - 1 < mouse.x && mouse.y < size.halfHeight >> 3) {
        let config = {
            body: {
                storeFrames: storeFrames,
                calculateFrames: calculateFrames,
                speed: speed,
                scale: scale,
                offset: {x: offset.x, y: offset.y},
                relativeBody: relativeBody,
                followBody: followBody,
                selectedBody: selectedBody
            }, celestialBodies: []
        };
        celestialBodies.forEach(function (celestialBody) {
            config.celestialBodies.push({
                pos: {x: celestialBody.pos[0].x, y: celestialBody.pos[0].y},
                initialVelocity: {x: celestialBody.initialVelocity.x, y: celestialBody.initialVelocity.y},
                radius: celestialBody.radius,
                mass: celestialBody.mass
            });
        });
        let element = document.createElement("a");
        element.setAttribute("href", URL.createObjectURL(new Blob([JSON.stringify(config)])));
        element.setAttribute("download", "configuration.json");
        element.click();
        element.remove();
    } else {
        offset.prevX = offset.x;
        offset.prevY = offset.y;
        click = true;
        let transformed = transform(mouse, modSimulationFrame);
        celestialBodies.forEach(function (celestialBody) {
            if (celestialBody.pos[modSimulationFrame].x - celestialBody.radius < transformed.x && transformed.x < celestialBody.pos[modSimulationFrame].x + celestialBody.radius && celestialBody.pos[modSimulationFrame].y - celestialBody.radius < transformed.y && transformed.y < celestialBody.pos[modSimulationFrame].y + celestialBody.radius) {
                selectedBody = celestialBodies.indexOf(celestialBody);
            }
        });
    }
}

function canvasMouseReleased() {
    click = false;
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
    switch (key) {
        case ' ':
            simulate = !simulate;
            break;
        case 'r':
            change = true;
            celestialBodies.forEach(function (celestialBody) {
                celestialBody.pos.length = 1;
                celestialBody.velocity = celestialBody.initialVelocity.copy();
            });
            break;
        case ',':
            showPrevFrame();
            break;
        case '.':
            showNextFrame();
            calculateNextFrame();
            break;
    }
}

class CelestialBody {
    constructor(x, y, vx, vy, radius, mass = null, surfaceGravity = null) {
        this.pos = [createVector(x, y)];
        this.initialVelocity = createVector(vx, vy);
        this.velocity = createVector(vx, vy);
        this.radius = radius;
        if (mass === null && surfaceGravity !== null) {
            this.mass = surfaceGravity * this.radius * this.radius / gravitationalConstant;
            this.surfaceGravity = surfaceGravity;
        } else if (mass !== null && surfaceGravity === null) {
            this.mass = mass;
            this.surfaceGravity = this.mass * gravitationalConstant / this.radius / this.radius;
        }
    }

    updateVelocity() {
        let celestialBody = this;
        celestialBodies.forEach(function (otherBody) {
            if (celestialBody !== otherBody) {
                let distanceSquared = p5.Vector.sub(otherBody.pos[modFrame1], celestialBody.pos[modFrame1]).magSq();
                let forceDirection = p5.Vector.sub(otherBody.pos[modFrame1], celestialBody.pos[modFrame1]).normalize();
                let force = forceDirection.mult(gravitationalConstant * celestialBody.mass * otherBody.mass / distanceSquared);
                let acceleration = p5.Vector.div(force, celestialBody.mass);
                celestialBody.velocity.add(p5.Vector.mult(acceleration, speed));
            }
        });
    }

    updatePosition() {
        this.pos[modFrame2] = (p5.Vector.add(this.pos[modFrame1], p5.Vector.mult(this.velocity, speed)));
    }
}

function showNextFrame() {
    simulationFrame++;
    modSimulationFrame = (simulationFrame - 1) % storeFrames + 1;
}

function calculateNextFrame() {
    for (; frame - simulationFrame < calculateFrames; frame++) {
        modFrame1 = (frame - 2) % storeFrames + 1;
        modFrame2 = (frame - 1) % storeFrames + 1;
        celestialBodies.forEach(function (celestialBody) {
            celestialBody.updateVelocity();
        });
        celestialBodies.forEach(function (celestialBody) {
            celestialBody.updatePosition();
        });
    }
}

function showPrevFrame() {
    if (simulationFrame + storeFrames > frame + 1 && simulationFrame > 0) {
        simulationFrame--;
        if (simulationFrame < storeFrames) {
            modSimulationFrame--;
        } else {
            modSimulationFrame = (simulationFrame - 1) % storeFrames + 1;
        }
    } else {
        alert("Can't go back further");
    }
}

function transform(object, frame) {
    if (relativeBody !== null) {
        return {
            x: (object.x - offset.x - size.halfWidth) / scale + celestialBodies[relativeBody].pos[frame].x,
            y: (object.y - offset.y - size.halfHeight) / scale + celestialBodies[relativeBody].pos[frame].y
        };
    } else {
        return {
            x: (object.x - offset.x - size.halfWidth) / scale, y: (object.y - offset.y - size.halfHeight) / scale
        };
    }
}

function calibrateEllipse(body, frame) {
    if (relativeBody !== null) {
        ellipse((body.pos[frame].x - celestialBodies[relativeBody].pos[frame].x) * scale + size.halfWidth + offset.x, (body.pos[frame].y - celestialBodies[relativeBody].pos[frame].y) * scale + size.halfHeight + offset.y, body.radius * scale);
    } else {
        ellipse(body.pos[frame].x * scale + size.halfWidth + offset.x, body.pos[frame].y * scale + size.halfHeight + offset.y, body.radius * scale);
    }
}

function calibrateLine(body, frame1, frame2) {
    if (relativeBody !== null) {
        line((body.pos[frame1].x - celestialBodies[relativeBody].pos[frame1].x) * scale + size.halfWidth + offset.x, (body.pos[frame1].y - celestialBodies[relativeBody].pos[frame1].y) * scale + size.halfHeight + offset.y, (body.pos[frame2].x - celestialBodies[relativeBody].pos[frame2].x) * scale + size.halfWidth + offset.x, (body.pos[frame2].y - celestialBodies[relativeBody].pos[frame2].y) * scale + size.halfHeight + offset.y);
    } else {
        line(body.pos[frame1].x * scale + size.halfWidth + offset.x, body.pos[frame1].y * scale + size.halfHeight + offset.y, body.pos[frame2].x * scale + size.halfWidth + offset.x, body.pos[frame2].y * scale + size.halfHeight + offset.y);
    }
}

function options() {
    if (selectedBody !== null) {
        textAlign(LEFT);
        let quaterWidth = size.halfWidth >> 1;
        rect(1, 1, quaterWidth, size.halfHeight);
        rect((quaterWidth) - 24, 6, 20, 20);
        line((quaterWidth) - 20, 10, (quaterWidth) - 8, 22);
        line((quaterWidth) - 20, 22, (quaterWidth) - 8, 10);
        let sixteenthHeight = size.halfHeight >> 3;
        text("Celestial Body " + selectedBody, 10, sixteenthHeight);
        text("Position: " + round(celestialBodies[selectedBody].pos[modSimulationFrame].x, 2) + ", " + round(celestialBodies[selectedBody].pos[modSimulationFrame].y, 2) + " meters", 10, 2 * sixteenthHeight);
        text("Velocity: " + round(celestialBodies[selectedBody].velocity.x, 2) + ", " + round(celestialBodies[selectedBody].velocity.y, 2) + " meters", 10, 3 * sixteenthHeight);
        text("Radius: " + celestialBodies[selectedBody].radius + " meters", 10, 4 * sixteenthHeight);
        text("Mass: " + celestialBodies[selectedBody].mass + " kilograms", 10, 5 * sixteenthHeight);
        text("Surface Gravity: " + celestialBodies[selectedBody].surfaceGravity + " meters / seconds ^ 2", 10, 6 * sixteenthHeight);
    }
    textAlign(CENTER);
    if (followBody !== null && relativeBody !== null) {
        rect(size.halfWidth - (size.halfWidth >> 2), 1, size.halfWidth >> 1, size.halfHeight >> 2);
        text("Following Celestial Body " + followBody, size.halfWidth, (size.halfHeight >> 4) + 1);
        text("Relative to Celestial Body " + relativeBody, size.halfWidth, 3 * (size.halfHeight >> 4) + 1);
    } else if (followBody !== null) {
        rect(size.halfWidth - (size.halfWidth >> 2), 1, size.halfWidth >> 1, size.halfHeight >> 3);
        text("Following Celestial Body " + followBody, size.halfWidth, (size.halfHeight >> 4) + 1);
    } else if (relativeBody !== null) {
        rect(size.halfWidth - (size.halfWidth >> 2), 1, size.halfWidth >> 1, size.halfHeight >> 3);
        text("Relative to Celestial Body " + relativeBody, size.halfWidth, (size.halfHeight >> 4) + 1);
    }
    let sixthWidth = size.halfWidth / 3;
    rect(5 * sixthWidth - 1, 1, sixthWidth, size.halfHeight >> 3);
    line(5.5 * sixthWidth - 1, 1, 5.5 * sixthWidth - 1, (size.halfHeight >> 3) + 1);
    text("Upload", 5.25 * sixthWidth - 1, (size.halfHeight >> 4) + 1);
    text("Download", 5.75 * sixthWidth - 1, (size.halfHeight >> 4) + 1);
}