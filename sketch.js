let size = {width:0,height:0};

function setup() {
  size.width=windowWidth;
  size.height=windowHeight;
  createCanvas(size.width-20, size.height-20);
}

function draw() {
  if(windowWidth-20!==size.width||windowHeight-20!==size.height){
    size.width=windowWidth;
    size.height=windowHeight;
    createCanvas(size.width-20, size.height-20);
    console.log("resized");
  }
  ellipse(mouseX,mouseY,50);
}