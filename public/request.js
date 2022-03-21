// $(function () {
//     $("form").submit(function (e) {
//         // e.preventDefault();

//         // console.log("---> e", e);

//         let dataURL = $("#canvas").eq(0).toDataURL();
//         let first = $("form").find("input[name='first']").val();
//         let last = $("form").find("input[name='last']").val();

//         $.ajax({
//             type: "POST",
//             url: "/petition",
//             data: {
//                 first: first,
//                 last: last,
//                 sig: dataURL,
//             },
//         })
//             .done(function (data) {
//                 console.log("--->> response request.js file", data.success);
//             })
//             .fail(function () {
//                 alert("error");
//             });
//     });
// });
