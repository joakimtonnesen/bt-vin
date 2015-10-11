# BT Vin

BT Vin is a web app for displaying Bergens Tidende's wine reviews.

The app is hosted at http://bt-vin.divshot.io/


## Development
This app runs on React https://facebook.github.io/react/

App code is located in this file: app/jsx/WineReviews.jsx

After making changes to the .jsx file, you need to compile it. Follow the instructions below to install the required packages, then run the watch command. This will output the .js-file that is read by the app.


### Install npm packages
```
npm install
```

### Watch and compile jsx
```
npm run watch
```

## Known bugs

* IE9: AJAX Request / CORS issue
* IOS Safari: Can't exit toggle-menu by clicking on overlay