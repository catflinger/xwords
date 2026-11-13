// This listener is for backwards compaitbility with old Guardian Quick Cryptic posts. (Do we need this?)
// CAUTION! - clicking these buttons will expand <detail> elements everywhere in the fifeensquared site, 
// not just in the blog content
//
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'expand-all') {
            document.querySelectorAll('details').forEach(function(el) {
                // el.open = !el.open;
                el.open = true;
            });
        }
    });
});

// Updated version
//
// Individual <details> elements in a post are made controllable by adding the "fifteensquared-detail" class
//
// A button automatically becomes an open/close/toggle button if it is given the "fifteensqared-details-open/close/toggle" class
//
// Example use of buttons:
//
// <button type="button" class="fifteensqared-details-toggle">Toggle all answers</button>
// <button type="button" class="fifteensqared-details-open">Open everything</button>
// <button type="button" class="fifteensqared-details-close">Close everything</button>
//
// example use of <details> tag:
//
// <details class="fifteensqared-details">
//    <summary>Answer</summary>
//    BATH ROBE
// </details>
//

// Add listener for TOGGLE details
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(event) {
        if (event?.target && event.target.matches('button.fifteensqared-toggle-all')) {
            document.querySelectorAll('details.fifteensquared-detail').forEach(function(el) {
                el.open = !el.open;
            });
        }
    });
});

// Add listener for OPEN details
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(event) {
        if (event?.target && event.target.matches('button.fifteensqared-open-all')) {
            document.querySelectorAll('details.fifteensquared-detail').forEach(function(el) {
                el.open = true;
            });
        }
    });
});

// Add listener for CLOSE details
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('click', function(event) {
        if (event?.target && event.target.matches('button.fifteensqared-close-all')) {
            document.querySelectorAll('details.fifteensquared-detail').forEach(function(el) {
                el.open = false;
            });
        }
    });
});
