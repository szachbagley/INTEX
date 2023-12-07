//set navbar to mobile view
function changeNav() {
    let navBar = document.getElementById('navBar');
    if (window.matchMedia("(max-width: 1000px)").matches) {
        // If the screen size is 1000px or under, change the class of the element
        navBar.classList.remove('fullPageNav');
        navBar.classList.add('mobileNav')
        navBar.classList.add('hidden')
    } else {
        // If the screen size is over 1000px, change the class of the element
        navBar.classList.remove('mobileNav');
        navBar.classList.remove('hidden');
        navBar.classList.remove('visible')
        navBar.classList.add('fullPageNav');
    }
    console.log(navBar.classList);
}

//toggles the navigation menu in mobile view
function toggle() {
    if (window.matchMedia("(max-width: 1000px)").matches) {
        let navBar = document.getElementById('navBar');
        if (navBar.classList.contains('hidden')) {
            navBar.classList.remove('hidden');
            navBar.classList.add('visible');
        } else {
            navBar.classList.remove('visible');
            navBar.classList.add('hidden');
        }
    }
}