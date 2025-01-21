// script.js

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login form");
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form from refreshing the page

        const username = loginForm.querySelector("input[type='text']").value;
        const password = loginForm.querySelector("input[type='password']").value;

        if (username && password) {
            alert(`Welcome, ${username}!`);
        } else {
            alert("Please enter both username and password.");
        }
    });
});
