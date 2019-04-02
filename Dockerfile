FROM node:8
MAINTAINER Samir Huseynzade
EXPOSE 8080
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN npm install --production
CMD ["node", "./app/screenshot-backend.js"]
CMD ["node", "./app/screenshot-service.js"]
CMD ["node", "./app/frontend/screenshot-frontend.js"]
