import concurrent.futures
import random
import signal
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
    
    if not ext:
        response = requests.head(url, allow_redirects=True)
        content_type = response.headers.get('Content-Type')
        if extension is None:
            print(f"Unknown file extension for MIME type {content_type}, defaulting to .jpg")
            extension = '.jpg'   
    else:
        extension = ''
    
    full_path = base + ext + extension
    
    dir_path = os.path.dirname(full_path)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content))
        
        if image.mode == 'RGBA':
            image = image.convert('RGB')
            
        if image.mode == 'P':
            image = image.convert('RGB')
        
        image.save(full_path)
    except Exception as e:
        print(f"Error downloading {url}: {e}")

def download_images_from_csv(category, subcategories):
    for subcategory in subcategories:
        output_path = f'../../Datasets/images/{category}/{subcategory}/'
        
        csv_file_path = f'./{category}/{subcategory}/images_to_download_{subcategory}.csv'
        if not os.path.isfile(csv_file_path):
            print(f"CSV file not found for {subcategory}, skipping.")
            continue
        
        df_images = pd.read_csv(csv_file_path)
        
        for index, row in df_images.iterrows():
            url = row['image_url']
            file_name = row['image_file_name']
            file_path = os.path.join(output_path, file_name)
            
            os.makedirs(output_path, exist_ok=True)

            if not os.path.exists(file_path):
                download_image(url, file_path)
                
                delay = random.uniform(0.5, 1)
                time.sleep(delay)


def preprocess_dataset(category, subcategories):
    for subcategory in subcategories:
        dataset_path = f'../../Datasets/raw/{category}/{category}.csv'
        output_path = f'../../Datasets/images/{category}/{subcategory}/'
        
        os.makedirs(output_path, exist_ok=True)

        if not os.path.isfile(dataset_path):
            print(f"Dataset file not found for {subcategory}, skipping.")
            continue

        df = pd.read_csv(dataset_path)
        images_to_download = []
        
        for index, row in df.iterrows():
            image_urls = eval(row['image_urls']) if pd.notnull(row['image_urls']) else []
            lifestyle_image_urls = eval(row['lifestyle_image_urls']) if pd.notnull(row['lifestyle_image_urls']) else []

            for index, url in enumerate(image_urls):
                file_name = f"{row['product_id']}_image_{index}.jpg"
                file_path = os.path.join(output_path, file_name)
                
                if not os.path.exists(file_path):
                    images_to_download.append((file_path, file_name, url))
                    
            for index, url in enumerate(lifestyle_image_urls):
                file_name = f"{row['product_id']}_image_lifestyle_{index}.jpg"
                file_path = os.path.join(output_path, file_name)
                
                if not os.path.exists(file_path):
                    images_to_download.append((file_path, file_name, url))

        csv_file_path = f'./{category}/{subcategory}/images_to_download_{subcategory}.csv'
        os.makedirs(os.path.dirname(csv_file_path), exist_ok=True)
        
        df_images = pd.DataFrame(images_to_download, columns=["image_file_path", "image_file_name", "image_url"])
        df_images.to_csv(csv_file_path, index=False)

def signal_handler(sig, frame):
    print("Caught KeyboardInterrupt, shutting down gracefully...")
    executor.shutdown(wait=False)
    print("Exiting program.")
    exit()

CATEGORIES = ['sofas', 'chairs' ]

SOFAS_SUBCATEGORIES = [
    # "2-seaters",
    # "3-seaters",
    # "4-seaters-up",
    # "l-shape",
    # "sofa-beds",
    # "leather-sofas",
    # "recliners",
    # "armchairs",
    # "lounge-chairs",
    "sofa-sets",
    "outdoor-sofas",
]

CHAIRS_SUBCATEGORIES = [
    # "dining-chairs",
    # "office-chairs",
    # "bar-stools",
    # "dining-benches",
    # "benches",
    # "stools-ottomans",
    # "bean-bags-poufs",
    # "outdoor-dining-sets",
]

signal.signal(signal.SIGINT, signal_handler)

for category, subcategories in zip(CATEGORIES, [SOFAS_SUBCATEGORIES, CHAIRS_SUBCATEGORIES]):
    preprocess_dataset(category, subcategories)

print("Dataset preprocessing completed.")

with concurrent.futures.ThreadPoolExecutor() as executor:
    futures = []
    
    for category, subcategories in zip(CATEGORIES, [SOFAS_SUBCATEGORIES, CHAIRS_SUBCATEGORIES]):
        future = executor.submit(download_images_from_csv, category, subcategories)
        futures.append(future)

    for future in concurrent.futures.as_completed(futures):
        try:
            future.result()
            print("Finished downloading images for a category.")
        except Exception as e:
            print(f"An error occurred: {e}")

print("All images downloaded!")
