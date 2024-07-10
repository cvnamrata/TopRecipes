
import json
import requests
import boto3
from time import gmtime, strftime


dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Recipe_Ingredients')



def lambda_handler(event, context):

    now = strftime("%a, %d %b %Y %H:%M:%S +0000", gmtime())
    
    # Edamam API credentials
    app_id = '676e7141'
    app_key = '4111317a79af0fd9e2d7d017ff34dd1a'
    
    # Extract ingredients from the event
    ingredients = event.get('ingredients', '')
    cuisine = event.get('cuisine', '')
    
    if not ingredients:
        return {
            'statusCode': 400,
            'body': json.dumps('Ingredients are required')
        }
    
    # write result and time to the DynamoDB table using the object we instantiated and save response in a variable
    result = table.put_item(
        Item={
            'ID': ingredients,
            'Cuisine': cuisine,
            'InputTime':now
            })

    # Edamam API endpoint
    edamam_url = f"https://api.edamam.com/search?q={ingredients}&app_id={app_id}&app_key={app_key}&cuisineType={cuisine}"
    
    try:
        # Make the API call to Edamam
        response = requests.get(edamam_url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Get the response data
        data = response.json()
        
        # Extract the relevant recipe information
        recipes = data.get('hits', [])
        recipe_list = []
        
        for recipe in recipes:
            recipe_info = {
                'label': recipe['recipe']['label'],
                'image': recipe['recipe']['image'],
                'url': recipe['recipe']['url'],
                'ingredients': recipe['recipe']['ingredientLines']
            }
            recipe_list.append(recipe_info)
        
        return {
            'statusCode': 200,
            'body': json.dumps(recipe_list)
        }
    
    except requests.exceptions.RequestException as e:
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error fetching recipes: {str(e)}")
        }
