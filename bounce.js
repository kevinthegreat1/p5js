let siz = {width: 0, height: 0};
let click = {x: 0, y: 0};

let canvas;

let circles = [];
let lines = [];

const sped = 1 / 60;

function setup() {
    textAlign(CENTER);
    siz.width = windowWidth;
    siz.height = windowHeight;
    canvas = createCanvas(siz.width - 24, siz.height - 20);
    canvas.mousePressed(canvasMousePressed);
}

function draw() {
    clear();
    if (windowWidth !== siz.width || windowHeight !== siz.height) {
        siz.width = windowWidth;
        siz.height = windowHeight;
        createCanvas(siz.width - 24, siz.height - 20);
        textSize(siz.width / 60);
        console.log("resized");
    }
    circles.forEach((circle) => {
        ellipse(circle.pos.x, circle.pos.y, 2 * circle.radius);
        circle.update();
    });
    lines.forEach((segment) => {
        line(segment.p1.x, segment.p1.y, segment.p2.x, segment.p2.y);
    });
    if (click.x !== 0 || click.y !== 0) {
        if (mouseButton === LEFT) {
            circle(click.x, click.y, 100);
            line(click.x, click.y, mouseX, mouseY);
        } else if (mouseButton === CENTER) {
            line(click.x, click.y, mouseX, mouseY);
        }
    }
}

class Circle {
    constructor(x, y, vx, vy, radius) {
        this.pos = createVector(x, y);
        this.velocity = createVector(vx, vy);
        this.radius = radius;
    }

    update() {
        this.pos.add(p5.Vector.mult(this.velocity, sped));
        if (0 > this.pos.x || this.pos.x > siz.width) {
            this.bounce(createVector(1, 0));
        }
        if (0 > this.pos.y || this.pos.y > siz.height) {
            this.bounce(createVector(0, 1));
        }
        lines.forEach((line) => {
            if (collide(line, this)) {
                this.bounce(createVector(line.p1.y - line.p2.y, line.p2.x - line.p1.x).normalize());
            }
        });
    }

    bounce(normal) {
        line(siz.width / 2, siz.height / 2, siz.width / 2 + normal.x, siz.height / 2 + normal.y);
        this.velocity.sub(p5.Vector.mult(p5.Vector.mult(normal, p5.Vector.dot(this.velocity, normal)), 2));
    }
}

class Line {
    constructor(x1, y1, x2, y2) {
        this.p1 = createVector(x1, y1);
        this.p2 = createVector(x2, y2);
    }
}

function collide(line, circle) {
    //length to endpoints and distance
    return p5.Vector.sub(line.p1, line.p2).magSq() + circle.radius * circle.radius > Math.max(p5.Vector.sub(circle.pos, line.p1).magSq(), p5.Vector.sub(circle.pos, line.p2).magSq()) && Math.abs((line.p2.x - line.p1.x) * (line.p1.y - circle.pos.y) - (line.p1.x - circle.pos.x) * (line.p2.y - line.p1.y)) / Math.sqrt(Math.pow(line.p2.x - line.p1.x, 2) + Math.pow(line.p2.y - line.p1.y, 2)) < circle.radius


    // return Math.abs((p2.x - p1.x) * (p1.y - p.y) - (p1.x - p.x) * (p2.y - p1.y)) / Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    //distance to end points > max(center to endpoints)
    // return p5.Vector.sub(p1, p2).magSq() + circle.radius * circle.radius > Math.max(p5.Vector.sub(circle.pos, p1).magSq(), p5.Vector.sub(circle.pos, p2).magSq());

    //if velocity vector collide with line
    // let det = (line.p2.x - line.p1.x) * (circle.pos.y + circle.velocity.y - circle.pos.y) - (circle.pos.x + circle.velocity.x - circle.pos.x) * (line.p2.y - line.p1.y);
    // if (det === 0) {
    //     return false;
    // } else {
    //     let lambda = ((circle.pos.y + circle.velocity.y - circle.pos.y) * (circle.pos.x + circle.velocity.x - line.p1.x) + (circle.pos.x - (circle.pos.x + circle.velocity.x)) * (circle.pos.y + circle.velocity.y - line.p1.y)) / det;
    //     let gamma = ((line.p1.y - line.p2.y) * (circle.pos.x + circle.velocity.x - line.p1.x) + (line.p2.x - line.p1.x) * (circle.pos.y + circle.velocity.y - line.p1.y)) / det;
    //     return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    // }

    //heading
    //    let l = p5.Vector.sub(circle.pos, line.p1).heading();
    //    let m = p5.Vector.sub(circle.pos, line.p2).heading();
}

function canvasMousePressed() {
    click.x = mouseX;
    click.y = mouseY;
}

function mouseReleased() {
    if (click.x !== 0 || click.y !== 0) {
        if (mouseButton === LEFT) {
            circles.push(new Circle(click.x, click.y, mouseX - click.x, mouseY - click.y, 50));
        } else if (mouseButton === CENTER) {
            lines.push(new Line(click.x, click.y, mouseX, mouseY));
        }
    }
    click.x = 0;
    click.y = 0;
}