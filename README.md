# CDS Project (insert team name here/product name)
Semantic furniture feature extraction and image search

# How to run
Install packages needed
```npm run i```

For getting of furniture urls by category run
```node scrapeFurnitureUrlsByCategory.js```
csv files will be stored under the `productUrls` folder

For getting of individual furniture details run
```node scrapeFurnitureListings.js```
csv files will be stored under the `productDetails` folder


## Explanation of ```scrapeFurnitureListings.js```
This scrapes ALL categories by default and resumes scraping for the remaining products that has not been scraped yet. 
1. ```processedUrls.txt``` contains the urls that has been scraped.