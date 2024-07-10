document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('frm');
    const resultsContainer = document.getElementById('results');

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const ingredients = document.getElementById('search').value;
        const cuisine = document.getElementById('cuisine').value;
		
		if (!ingredients) {
                alert('Please enter atleast one ingredient'); 
                event.preventDefault();
            }
		
		if(!cuisine) {
                alert('Please select a cuisine'); 
                event.preventDefault();
            }
			
        callAPI(ingredients, cuisine)
            .then(data => {
                const recipes = JSON.parse(data.body);
                if (Array.isArray(recipes)) {
                    displayResults(recipes);
                } else {
                    console.error('API response is not an array:', data);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });

    function callAPI(ingredients, cuisine) {
        console.log('Calling API with ingredients:', ingredients, 'and cuisine:', cuisine);
        return fetch('https://3o8ofo9edh.execute-api.us-east-1.amazonaws.com/WebAppStage', { // Replace with your API Gateway endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ingredients: ingredients, cuisine: cuisine })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
    }

    function displayResults(recipes) {
        console.log('Recipes:', recipes);
        resultsContainer.innerHTML = '';
        recipes.forEach(recipe => {
            const recipeDiv = document.createElement('div');
            recipeDiv.classList.add('recipe');

            const recipeImage = document.createElement('img');
            recipeImage.src = recipe.image;
            recipeImage.alt = recipe.label;

            const recipeTitle = document.createElement('h3');
            recipeTitle.textContent = recipe.label;

            const recipeIngredients = document.createElement('ul');
            recipe.ingredients.forEach(ingredient => {
                const ingredientItem = document.createElement('li');
                ingredientItem.textContent = ingredient;
                recipeIngredients.appendChild(ingredientItem);
            });

            const recipeLink = document.createElement('a');
            recipeLink.href = recipe.url;
            recipeLink.textContent = 'View Recipe';
            recipeLink.target = '_blank';

            recipeDiv.appendChild(recipeImage);
            recipeDiv.appendChild(recipeTitle);
            recipeDiv.appendChild(recipeIngredients);
            recipeDiv.appendChild(recipeLink);

            resultsContainer.appendChild(recipeDiv);
        });
    }
});
