# CDS Project (insert team name here/product name)
Semantic furniture feature extraction and image search

# How to run
Install packages needed
```npm run i```

For getting of furniture urls by category run
```node scrapeFurnitureUrlsByCategory.js```
csv files will be stored under the `productUrls` folder

For getting of individual furniture details run
```node index.js```
csv files will be stored under the `productDetails` folder


## Explanation of ```index.js```
This scrapes ALL categories by default and resumes scraping for the remaining products that has not been scraped yet. 
1. ```processedUrls.txt``` contains the urls that has been scraped.
2. `productDetails/${category}/${category}.csv` contains data of furnitures that are scraped
   
## Sync `processUrls.txt` with `.csv` file
sometimes, some rows maybe have empty titles, empty data for the row, thus, you can run `syncCsvTxtFiles.js` under the `utils` folder to remove empty rows and sync the `processUrls.txt` files.
By default it sync all categories, to change which category to sync, just change the `categories` variable.