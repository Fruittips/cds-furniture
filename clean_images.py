import os
import pandas as pd
import re

csv_file_path = "sofas.csv"
# images_folder_path = "/Volumes/My Passport for Mac/cds-proj/Datasets/images/sofas"

# Path to the main folder containing the subcategory folders with images
main_images_folder_path = "/Volumes/My Passport for Mac/cds-proj/Datasets/images/chairs"

# Load the CSV file
df = pd.read_csv(csv_file_path)

# Iterate over each subcategory directory within the main images folder
for subcategory in os.listdir(main_images_folder_path):
    delete_count = 0
    # Check if it's a directory
    subcategory_path = os.path.join(main_images_folder_path, subcategory)
    if os.path.isdir(subcategory_path):
        # Filter the DataFrame for product_ids within the current subcategory
        subcategory_product_ids = set(df[df['subcategory'] == subcategory]['product_id'].astype(str))
        
        # Iterate over each file in the subcategory directory
        for filename in os.listdir(subcategory_path):
            product_id = filename.split('_')[0]
            # If the product_id of the file is not in the list of product_ids for the subcategory, delete the file
            if product_id not in subcategory_product_ids:
                file_path = os.path.join(subcategory_path, filename)
                os.remove(file_path)
                delete_count += 1
                print(f"Deleted {file_path}")
                
        print(f"Deleted {delete_count} files from {subcategory_path}")