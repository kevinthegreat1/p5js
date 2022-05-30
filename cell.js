let size={width:0,height:0, halfWidth: 0, halfHeight: 0, imageWidth:0, imageHeight:0};

let mode=false;
let computer, cell;

let side=false;
let mouse={x:0,y:0};

function preload() {
    computer = loadImage("computer.png");
    cell = loadImage("cell.png");
}

function setup() {
    size.width = windowWidth - 24;
    size.height = windowHeight - 20;
    size.halfWidth = size.width / 2;
    size.halfHeight = size.height / 2;
    canvas = createCanvas(size.width, size.height);
    noStroke();
    imageMode(CENTER);
    textWrap(WORD);
}

function draw() {
    clear();
    if (windowWidth - 24 !== size.width || windowHeight - 20 !== size.height) {
        size.width = windowWidth - 24;
        size.height = windowHeight - 20;
        size.halfWidth = size.width / 2;
        size.halfHeight = size.height / 2;
        canvas = createCanvas(size.width, size.height);
    }
    if (mode) {
        fill(0, 100);
    } else {
        fill(255, 255, 0, 100);
    }
    if (mode) {
        fitImage(cell);
    } else {
        fitImage(computer);
    }
    mouse.x = (mouseX - (size.width * 1.2 - size.imageWidth) / 2) / size.imageWidth;
    mouse.y = (mouseY - (size.height - size.imageHeight) / 2) / size.imageHeight;
    if (mouse.x >= 0 && mouse.x <= 1 && mouse.y >= 0 && mouse.y <= 1) {
        if (mouse.x < 0.02 || mouse.x > 0.98 || mouse.y < 0.02 || mouse.y > 0.98) {
            offsetRect(0, 0, 0.02, 1);
            offsetRect(0.02, 0.98, 0.96, 0.02);
            offsetRect(0.98, 0, 0.02, 1);
            offsetRect(0.02, 0, 0.96, 0.02);
            offsetText("Cell Wall / Cell Membrane - Computer shell:\n\nThe cell wall provides support and protection for the cell. The cell membrane separates the inside of the cell from the outside and regulates what passes through. This is like the shell of a computer, which provides support, protection, and separates the inside of a computer from the outside.");
        } else if (mouse.y > 0.58) {
            offsetRect(0.02, 0.58, 0.96, 0.40);
            offsetText("Mitochondria / Chloroplasts - Charging Port / Battery:\n\nMitochondria convert chemical energy in food into ATP which can be used by the cell. Chloroplasts convert sunlight into energy for the cell. This is like the charging port and battery of a computer, which receives energy from the outside.");
        } else if (((mouse.x > 0.1 && mouse.x < 0.32) || (mouse.x > 0.68 && mouse.x < 0.9)) && (mouse.y > 0.2 && mouse.y < 0.5)) {
            offsetRect(0.1, 0.2, 0.22, 0.3);
            offsetRect(0.68, 0.2, 0.22, 0.3);
            offsetText("Lysosomes - Fan:\n\nLysosomes are filled with enzymes, and they clean up the cell and break down liquids, carbohydrates, and proteins that the cell can use. Lysosomes remove all the useless things in a cell that might otherwise accumulate and clutter up the cell. This is like the fan in a computer, which removes the heat from a computer and cools it, or else it will overheat.");
        } else if (mouse.x > 0.43 && mouse.x < 0.57 && mouse.y > 0.27 && mouse.y < 0.45) {
            if (mouse.x > 0.45 && mouse.x < 0.55 && mouse.y > 0.29 && mouse.y < 0.43) {
                offsetRect(0.45, 0.29, 0.10, 0.14);
                offsetText("DNA / Chromosomes / Chromatin - Operating System:\n\nChromosomes contain the genetic information of a cell and they are found in the nucleus. DNA is the genetic information of cells. The operating system on a computer is like DNA and contains the information and instructions to make the computer function. The operating system can be passed on to other computers, like how DNA can be copied in cell division.");
            } else {
                offsetRect(0.43, 0.27, 0.14, 0.18);
                offsetText("The Nucleus - Storage:\n\nThe nucleus contains genetic information, nearly all the DNA, and instruction for making proteins and other important molecules. This is like the storage in a computer, which stores data more permanently and stores the operating system, which is like the DNA of the computer. The core instructions of a computer are stored here.");
            }
        } else if (mouse.x > 0.33 && mouse.x < 0.43 && mouse.y > 0.24 && mouse.y < 0.45) {
            offsetRect(0.33, 0.24, 0.1, 0.21);
            offsetText("Endoplasmic Reticulum - CPU:\n\nEndoplasmic Reticulum makes lipids, proteins, and other materials. This is like the Central Processing Unit (CPU), which can calculate, run any task, and produce data and information. The endoplasmic reticulum can make all kinds of things, like the CPU, which can do all types of tasks.");
        } else if (mouse.x > 0.57 && mouse.x < 0.67 && mouse.y > 0.24 && mouse.y < 0.45) {
            offsetRect(0.57, 0.24, 0.1, 0.21);
            offsetText("Ribosomes - GPU:\n\nRibosomes have one of the most important jobs which are to make proteins following instructions from DNA. This is like the Graphics Processing Unit (GPU), which calculates graphics and what to put on the screen following instructions from the operating system. Ribosomes only make proteins, like the GPU, which can only calculate graphics.");
        } else if (mouse.x > 0.36 && mouse.x < 0.64 && mouse.y > 0.1 && mouse.y < 0.24) {
            offsetRect(0.36, 0.1, 0.28, 0.14);
            offsetText("Vacuoles - Memory:\n\nVacuoles store materials like water, salts, proteins, and carbohydrates. This is like the memory in a computer that stores data temporarily and can be retrieved and erased.");
        } else if (mouse.x > 0.2 && mouse.x < 0.36 && mouse.y > 0.05 && mouse.y < 0.2) {
            offsetRect(0.2, 0.05, 0.16, 0.15);
            offsetText("Golgi Apparatus - Display:\n\nGolgi Apparatus receives materials, repackages them into vesicles and sends them off. It can ship proteins and materials outside the cell. This is like the display, where electrical current is converted into light, the final package, before sending it out of the computer and into the user.");
        } else {
            offsetRect(0.33, 0.45, 0.34, 0.13);
            offsetRect(0.1, 0.5, 0.23, 0.08);
            offsetRect(0.67, 0.5, 0.23, 0.08);
            offsetRect(0.02, 0.02, 0.08, 0.56);
            offsetRect(0.90, 0.02, 0.08, 0.56);
            offsetText("Cytoskeleton - Wires:\n\nThe Cytoskeleton supports the cell and also carries materials from a part of the cell to another. This is like the many wires in a computer, connecting and transmitting signals around a computer.")
        }
    }
}

function keyPressed() {
    switch (key) {
        case ' ':
            mode = !mode;
            break;
    }
}

function fitImage(img) {
    if (size.width * 0.8 > img.width && size.height > img.height) {
        image(img, size.halfWidth * 0.8, size.halfHeight);
    }
    let proportion = img.width / img.height;
    if (proportion > size.width * 0.8 / size.height) {
        size.imageWidth = size.width * 0.8;
        size.imageHeight = size.width * 0.8 / proportion;
        image(img, size.halfWidth * 1.2, size.halfHeight, size.imageWidth, size.imageHeight);
        side = true;
    } else {
        size.imageWidth = size.height * proportion;
        size.imageHeight = size.height;
        image(img, size.halfWidth * 1.2, size.halfHeight, size.imageWidth, size.imageHeight);
        side = false;
    }
}

function offsetRect(x,y,w,h) {
    rect(x * size.imageWidth + (size.width * 1.2 - size.imageWidth) / 2, y * size.imageHeight + (size.height - size.imageHeight) / 2, w * size.imageWidth, h * size.imageHeight)
}

function offsetText(txt) {
    fill(0);
    textSize(20);
    text(txt, size.width * 0.02, size.height * 0.2, (size.width - size.imageWidth) * 0.6);
}