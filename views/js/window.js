
var userAgent = window.navigator.userAgent.toLowerCase();
var ios = /iphone|ipod|ipad/.test( userAgent );
var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;


window.addEventListener("resize", function() {
    
    h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    
    if (w < 700) {
        document.getElementById("li").style.fontSize = "75%";
        document.getElementById("p3").style.fontSize = "75%";
    } else if (w > 700)
    {
        document.getElementById("li").style.fontSize = "100%";
        document.getElementById("p3").style.fontSize = "125%";
    }
    
});

function loaded() {
    userAgent = window.navigator.userAgent.toLowerCase();
    ios = /iphone|ipod|ipad/.test( userAgent );
    if ( ios )
    {
        document.getElementById("li").style.fontSize = "300%";
        document.getElementById("p3").style.fontSize = "300%";
        document.getElementById("H3").style.fontSize = "275%";
    } else {
        if (w < 700) {
            document.getElementById("li").style.fontSize = "75%";
            document.getElementById("p3").style.fontSize = "75%";
            document.getElementById("H3").style.fontSize = "75%";
        } else if (w > 700)
        {
            document.getElementById("li").style.fontSize = "100%";
            document.getElementById("p3").style.fontSize = "125%";
            document.getElementById("H3").style.fontSize = "125%";
        }
    
    }
}

function addFunc() {
    
}

/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("User").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
  if (!e.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var d = 0; d < dropdowns.length; d++) {
      var openDropdown = dropdowns[d];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}