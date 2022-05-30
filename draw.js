let size = {width:0, height:0};

let shapes = [];
let undo = [];
let tool = 0;
let tools = ["line", "pencil", "path", "rectangle", "circle", "fill"];
let click = 0;

let fourPoints = {x1:0, y1:0, x2:0, y2:0, x3:0, y3:0, x4:0, y4:0};

let lines = [];
let lineContinuous = Boolean(false);
let bezierContinuous = Boolean(false);
let square = Boolean(false);
let circle = Boolean(false);

function setup() {
    size.width = windowWidth;
    size.height = windowHeight;
    createCanvas(size.width - 24, size.height);
    background(255);
    textAlign(CENTER);
    textSize(size.width / 60);
    text("Tool: " + tools[tool], size.width / 2, 20);
    noFill();
}

function draw() {
    clear();
    if (windowWidth !== size.width || windowHeight !== size.height) {
        size.width = windowWidth;
        size.height = windowHeight;
        createCanvas(size.width - 24, size.height);
        background(255);
        textSize(size.width / 60);
    }
    fill(0);
    noStroke();
    text("Tool: " + tools[tool], size.width / 2, 20);
    noFill();
    stroke(0);
    shapes.forEach(function (shape) {
        switch (shape.type) {
            case 0:
                line(shape.x1, shape.y1, shape.x2, shape.y2);
                break;
            case 1:
                shape.lines.forEach(function (line1) {
                    line(line1.x1, line1.y1, line1.x2, line1.y2);
                });
                break;
            case 2:
                rectMode(CENTER);
                ellipseMode(RADIUS);
                rect(shape.x1, shape.y1, 10);
                ellipse(shape.x2, shape.y2, 5);
                rect(shape.x3, shape.y3, 10);
                ellipse(shape.x4, shape.y4, 5);
                stroke(160);
                line(shape.x1, shape.y1, shape.x2, shape.y2);
                line(shape.x3, shape.y3, shape.x4, shape.y4);
                stroke(0);
                bezier(shape.x1, shape.y1, shape.x2, shape.y2, shape.x4, shape.y4, shape.x3, shape.y3);
                break;
            case 3:
                rectMode(CORNERS);
                rect(shape.x1, shape.y1, shape.x2, shape.y2);
                break;
            case 4:
                ellipseMode(CORNERS);
                ellipse(shape.x1, shape.y1, shape.x2, shape.y2);
                break;
        }
    });
    lines.forEach(function (line1) {
        line(line1.x1, line1.y1, line1.x2, line1.y2);
    });
    switch (tool) {
        case 0:
            lineDraw();
            break;
        case 1:
            pencilDraw();
            break;
        case 2:
            bezierDraw();
            break;
        case 3:
            rectDraw();
            break;
        case 4:
            ellipseDraw();
            break;
    }
}

function mousePressed() {
    switch (tool) {
        case 0:
        case 1:
        case 3:
        case 4:
            if (click === 0) {
                fourPoints.x1 = mouseX;
                fourPoints.y1 = mouseY;
                click = 1;
            }
            break;
        case 2:
            if (click === 0) {
                fourPoints.x1 = mouseX;
                fourPoints.y1 = mouseY;
                click = 1;
            } else if (click === 2) {
                fourPoints.x3 = mouseX;
                fourPoints.y3 = mouseY;
                click = 3;
            }
            break;
    }
}

function mouseReleased() {
    switch (tool) {
        case 0:
            if (click === 1) {
                fourPoints.x2 = mouseX;
                fourPoints.y2 = mouseY;
                line(fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2);
                shapes.push(new TwoPoints(0, fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2));
                if (lineContinuous) {
                    fourPoints.x1 = fourPoints.x2;
                    fourPoints.y1 = fourPoints.y2;
                    click = 1;
                } else {
                    click = 0;
                }
            }
            break;
        case 1:
            if (click === 1) {
                shapes.push(new Lines(lines));
                lines = [];
                click = 0;
            }
            break;
        case 2:
            if (click === 1) {
                fourPoints.x2 = mouseX;
                fourPoints.y2 = mouseY;
                click = 2;
            } else if (click === 3) {
                fourPoints.x4 = mouseX;
                fourPoints.y4 = mouseY;
                rectMode(CENTER);
                ellipseMode(RADIUS);
                rect(fourPoints.x3, fourPoints.y3, 10);
                ellipse(fourPoints.x4, fourPoints.y4, 5);
                stroke(160);
                line(fourPoints.x3, fourPoints.y3, fourPoints.x4, fourPoints.y4);
                stroke(0);
                bezier(fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2, fourPoints.x4, fourPoints.y4, fourPoints.x3, fourPoints.y3);
                shapes.push(new Bezier(fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2, fourPoints.x3, fourPoints.y3, fourPoints.x4, fourPoints.y4));
                if (bezierContinuous) {
                    fourPoints.x1 = fourPoints.x3;
                    fourPoints.y1 = fourPoints.y3;
                    fourPoints.x2 = 2 * fourPoints.x1 - fourPoints.x4;
                    fourPoints.y2 = 2 * fourPoints.y1 - fourPoints.y4;
                    click = 2;
                } else {
                    click = 0;
                }
            }
            break;
        case 3:
            if (click === 1) {
                fourPoints.x2 = mouseX;
                fourPoints.y2 = mouseY;
                rectMode(CORNERS);
                if(square){
                    let length = Math.max(fourPoints.x2 - fourPoints.x1, fourPoints.y2 - fourPoints.y1);
                    rect(fourPoints.x1, fourPoints.y1, fourPoints.x1 + length, fourPoints.y1 + length);
                    shapes.push(new TwoPoints(3,fourPoints.x1, fourPoints.y1, fourPoints.x1 + length, fourPoints.y1 + length));
                } else {
                    rect(fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2);
                    shapes.push(new TwoPoints(3, fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2));
                }
                click = 0;
            }
            break;
        case 4:
            if (click === 1) {
                fourPoints.x2 = mouseX;
                fourPoints.y2 = mouseY;
                ellipseMode(CORNERS);
                if (circle) {
                    let length = Math.max(fourPoints.x2 - fourPoints.x1, fourPoints.y2 - fourPoints.y1);
                    ellipse(fourPoints.x1, fourPoints.y1, fourPoints.x1 + length, fourPoints.y1 + length);
                    shapes.push(new TwoPoints(4,fourPoints.x1, fourPoints.y1, fourPoints.x1 + length, fourPoints.y1 + length));
                } else {
                    ellipse(fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2);
                    shapes.push(new TwoPoints(4, fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2));
                }
                click = 0;
            }
            break;
    }
}

function keyPressed() {
    if (keyCode === BACKSPACE) {
        if (click !== 0) {
            click = 0;
        } else {
            undo.push(shapes.pop());
        }

    }
    switch (key) {
        case 'z':
            if (undo.length !== 0) {
                shapes.push(undo.pop());
            }
            break;
        case '1':
        case 'l':
            tool = 0;
            click = 0;
            break;
        case '2':
        case 'd':
            tool = 1;
            click = 0;
            break;
        case '3':
        case 'p':
            tool = 2;
            click = 0;
            break;
        case '4':
        case 'r':
            tool = 3;
            click = 0;
            break;
        case '5':
        case 'e':
            tool = 4;
            click = 0;
            break;
        case ' ':
            switch (tool) {
                case 0:
                    lineContinuous = !lineContinuous;
                    break;
                case 2:
                    bezierContinuous = !bezierContinuous;
                    break;
                case 3:
                    square=!square;
                    break;
                case 4:
                    circle=!circle;
                    break;
            }
    }
}

function lineDraw() {
    fill(0);
    noStroke();
    text("Continuous: " + lineContinuous, size.width / 2, 50);
    noFill();
    stroke(0);
    if (click === 1) {
        line(fourPoints.x1, fourPoints.y1, mouseX, mouseY);
    }
}

function pencilDraw() {
    if (click === 1) {
        if (mouseX === fourPoints.x1 || mouseY === fourPoints.y1) {
            return;
        }
        fourPoints.x2 = mouseX;
        fourPoints.y2 = mouseY;
        line(fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2);
        lines.push(new TwoPoints(1, fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2));
        fourPoints.x1 = fourPoints.x2;
        fourPoints.y1 = fourPoints.y2;
    }
}

function bezierDraw() {
    fill(0);
    noStroke();
    text("Continuous: " + bezierContinuous, size.width / 2, 50);
    noFill();
    stroke(0);
    rectMode(CENTER);
    ellipseMode(RADIUS);
    if (click === 1) {
        rect(fourPoints.x1, fourPoints.y1, 10);
        ellipse(mouseX, mouseY, 5);
        stroke(160);
        line(fourPoints.x1, fourPoints.y1, mouseX, mouseY);
        stroke(0);
    } else if (click >= 2) {
        rect(fourPoints.x1, fourPoints.y1, 10);
        ellipse(fourPoints.x2, fourPoints.y2, 5);
        stroke(160);
        line(fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2);
        stroke(0);
    }
    if (click === 3) {
        rect(fourPoints.x3, fourPoints.y3, 10);
        ellipse(mouseX, mouseY, 5);
        stroke(160);
        line(fourPoints.x3, fourPoints.y3, mouseX, mouseY);
        stroke(0);
        bezier(fourPoints.x1, fourPoints.y1, fourPoints.x2, fourPoints.y2, mouseX, mouseY, fourPoints.x3, fourPoints.y3);
    }
}

function rectDraw() {
    fill(0);
    noStroke();
    text("Square: " + square, size.width / 2, 50);
    noFill();
    stroke(0);
    if (click === 1) {
        rectMode(CORNERS);
        if (square) {
            let length = Math.max(mouseX - fourPoints.x1, mouseY - fourPoints.y1);
            rect(fourPoints.x1, fourPoints.y1, fourPoints.x1 + length, fourPoints.y1 + length);
        } else {
            rect(fourPoints.x1, fourPoints.y1, mouseX, mouseY);
        }
    }
}

function ellipseDraw() {
    fill(0);
    noStroke();
    text("Circle: " + circle, size.width / 2, 50);
    noFill();
    stroke(0);
    if (click === 1) {
        ellipseMode(CORNERS);
        if (circle) {
            let length = Math.max(mouseX - fourPoints.x1, mouseY - fourPoints.y1);
            ellipse(fourPoints.x1, fourPoints.y1, fourPoints.x1 + length, fourPoints.y1 + length);
        } else {
            ellipse(fourPoints.x1, fourPoints.y1, mouseX, mouseY);
        }
    }
}

function TwoPoints (type, x1, y1, x2, y2) {
    this.type = type;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
}

function Lines (lines) {
    this.type = 1;
    this.lines = lines;
}

function Bezier(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.type = 2;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
    this.x4 = x4;
    this.y4 = y4;
}