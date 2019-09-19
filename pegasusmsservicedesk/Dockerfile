FROM node:10.12.0

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
RUN npm install loggerinterface --registry http://10.128.0.3:4873

# Bundle app source
COPY . /usr/src/app

EXPOSE 7008
CMD [ "npm", "start" ]
