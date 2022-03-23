(function () {
    let canvas = document.getElementById("canvas");
    // console.log("canvas---->>", canvas);
    // let submit = document.getElementsByClassName("submit");
    let inputSig = document.getElementById("input-sig");
    let x;
    let y;
    // console.log(inputSig);
    let c = canvas.getContext("2d");
    // console.log("canvas---->>", c);
    let draw = false;
    canvas.onmouseup = () => {
        draw = false;
        let dataURL = canvas.toDataURL();
        inputSig.value = dataURL;
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
        c.strokeStyle = "violet";
        c.lineTo(e.offsetX, e.offsetY);
        c.moveTo(x, y);
        c.stroke();
        x = e.offsetX;
        y = e.offsetY;
    };

    // submit.addEventListener("click", (e) => {});
    // // console.log(canvas.toDataURL());
})();
