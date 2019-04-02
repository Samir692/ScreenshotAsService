# ScreenshotAsService

Screenshot As Service is a web application which enables users to mention the url of their desired website(s) and get the screenshots of them to their machine. For first release application is designed for linux(Mac) operating systems because of file structure syntax differences. 

User can either type the urls seperated by commas or upload file with urls seperated by comma or new line. When user fills all the required fields and submits the form the images will be zipped and downloaded to their personal machine.



# Technologies
 - Nodejs
 - MongoDB
 - AngularJS
 - Microservices
 
 
 # Architecture
 Application is designed in microservice architecture. There are 3 services. Frontend, Backend and Screenshot service itself runs independently. 
 
 
 # Installation
 
 ```
 git clone ...
 cd ScreenshotAsService
 npm install
 ```
 
 # Running the system
 As mentioned there are 3 services. It is suggasted to download [P2](http://pm2.keymetrics.io/) .
 
 ```
 pm2 start services.json
 ```
 
 This will run all the 3 services you need. 
 Backend service is available at [http://localhost:5000](http://localhost:5000)
 Frontend service is available at [http://localhost:5001](http://localhost:5001)
 
 
 # Manual start
 
 Run the backend service:
 
 ```
 node app/screenshot-backend.js
 ```
 
 Run the screenshot service
 
 ```
 node app/screenshot-service.js
 ```
 
 Run the frontend service
 
 ```
 node app/frontend/frontend-server.js
 ```
 
 
