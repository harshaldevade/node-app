FROM node:11.3.0-alpine

# Create app directory
RUN mkdir -p /usr/src/app
#Set the created directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json /usr/src/app/

RUN npm install
# If you are building your code for production
# RUN npm install --only=production
# RUN npm install loggerinterface --registry http://192.168.105.169:4873

# Bundle app source
COPY . /usr/src/app

EXPOSE 8001
CMD [ "npm", "start" ]