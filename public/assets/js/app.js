// console.log(document.querySelectorAll(`form`));
// window.onload = function () {
document.addEventListener('click', function (event) {

    // If the clicked element doesn't have the right selector, bail
    if (!event.target.matches('.notes')) return;

    // Don't follow the link
    event.preventDefault();

    // Log the clicked element in the console
    console.log(event.target);

}, false);

// if (event.target.classList.contains('saves')) {

//     console.log(this);
//     console.log(typeof this);
//     console.log(this.id);
//     let form = this.getElementsByTagName(`form`)
//     console.log(form)
// }

document.addEventListener('click', function (event) {

    if (event.target.matches('.show')) {
        // Run your code to open a modal
    }

    if (event.target.matches('.hide')) {
        // Run your code to close a modal
    }

}, false);

// };