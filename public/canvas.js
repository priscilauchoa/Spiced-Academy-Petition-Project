(function () {
    let canvas = document.getElementById("canvas");
    // console.log("canvas---->>", canvas);
    let c = canvas.getContext("2d");
    // console.log("canvas---->>", c);
    let draw = false;
    canvas.onmouseup = () => {
        draw = false;
        // let dataURL = $("#canvas").get(0).toDataURL();
        // console.log(dataURL);
    };
    canvas.onmousedown = () => {
        draw = true;
    };
    canvas.onmousemove = (e) => {
        if (!draw) {
            return;
        }
        c.strokeStyle = "red";
        c.lineTo(e.offsetX, e.offsetY);
        c.stroke();
    };
})();
