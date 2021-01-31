jQuery(document).ready(function($) {
	setVH();
});

window.addEventListener('resize', function() {
	setVH();
});

function setVH() {
	var vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', vh + 'px');
}
