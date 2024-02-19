import concurrent.futures
import pandas as pd
import requests
import os
from io import BytesIO
from PIL import Image
import mimetypes
import time

def download_image(url, output_path):
    print(f"Downloading {url} to {output_path}")
    base, ext = os.path.splitext(output_path)
    
    # Determine if we need to add an extension
    if not ext:
        # If there's no extension, determine one from the MIME type
        response = requests.head(url, allow_redirects=True)
        content_type = response.headers.get('Content-Type')
         # If the extension could not be determined, default to .jpg
        if extension is None:
            print(f"Unknown file extension for MIME type {content_type}, defaulting to .jpg")
            extension = '.jpg'   
    else:
        extension = ''
    
    full_path = base + ext + extension
    
    dir_path = os.path.dirname(full_path)
    
    # Ensure the directory exists
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    
    try:
        # Download the image
        response = requests.get(url)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content))
        
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        
        # Save the image with the correct path and filename
        image.save(full_path)
    except Exception as e:
        print(f"Error downloading {url}: {e}")

def download_images_from_csv(category):
    dataset_path = f'../../Datasets/raw/{category}/{category}.csv'
    output_path = f'../../Datasets/images/{category}/'

    # Read the CSV file
    df = pd.read_csv(dataset_path)
    # Iterate through the DataFrame rows
    for index, row in df.iterrows():
        product_id = row['product_id']
        subcategory = row['subcategory']
        
        subcategory_path = os.path.join(output_path, subcategory.replace('/', '-').replace(' ', '_'))
        
        # For image_urls
        if pd.notnull(row['image_urls']):
            for i, url in enumerate(eval(row['image_urls'])):  # Assuming urls are in a list format stored as string
                file_name = f"{product_id}_image_{i}.jpg"
                download_image(url, os.path.join(subcategory_path, file_name))
                time.sleep(1)
        
        # For lifestyle_image_urls
        if pd.notnull(row['lifestyle_image_urls']):
            for i, url in enumerate(eval(row['lifestyle_image_urls'])):  # Assuming urls are in a list format stored as string
                file_name = f"{product_id}_image_lifestyle_{i}.jpg"
                download_image(url, os.path.join(subcategory_path, file_name))
                time.sleep(1)


CATEGORIES = ['chairs', 'sofas']

with concurrent.futures.ThreadPoolExecutor() as executor:
    futures = []
    for category in CATEGORIES:
        future = executor.submit(download_images_from_csv, category)
        futures.append(future)

    for future in concurrent.futures.as_completed(futures):
        try:
            future.result()
            print("Finished downloading images for a category.")
        except Exception as e:
            print(f"An error occurred: {e}")

print("All images downloaded!")
