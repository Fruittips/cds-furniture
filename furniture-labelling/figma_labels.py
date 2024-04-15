import requests
import json

personal_access_token = 'TOKEN'
file_key = 'FILE_KEY'

base_url = 'https://api.figma.com'

headers = {
    'X-Figma-Token': personal_access_token
}

def get_file_nodes(file_key):
    response = requests.get(f'{base_url}/v1/files/{file_key}', headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        print('Failed to get file nodes:', response.text)
        return None

figma_file = get_file_nodes(file_key)
pages = figma_file['document']['children']

counter = 0
section_mapping = {}
test_mapping = {}
clusters = {}
isChairs = False
for page in pages:
    
    if len(page['children']) > 0:
        print('Page:', page['name'])
        subcategory = page['name']
        test_mapping[subcategory] = {}
        clusters[subcategory] = {}
        for section in page['children']:
            section_name = section['name']
            product_ids = []
            
            if section_name == 'single':
                for node in section['children']:
                    if node['type'] == 'RECTANGLE':
                        node_name = node['name']
                        image_name = node_name.split(' ')[0]
                        product_id = image_name.split('_')[0]
                        clusters[subcategory][f'{counter}'] = product_id
                        test_mapping[subcategory][section_name] = counter
                        counter += 1

            for node in section['children']:
                if node['type'] == 'RECTANGLE':
                    node_name = node['name']
                    image_name = node_name.split(' ')[0]
                    product_id = image_name.split('_')[0]
                    product_ids.append(product_id)
            test_mapping[subcategory][section_name] = counter 
            clusters[subcategory][f'{counter}'] = product_ids
            counter += 1
            

with open('test.json', 'w') as json_file:
    json.dump(clusters, json_file, indent=4)
    
with open('old_to_new.json', 'w') as json_file:
    json.dump(test_mapping, json_file, indent=4)