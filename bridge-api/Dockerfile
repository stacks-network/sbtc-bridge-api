FROM node:19-alpine

# Set the environment variables
ENV PORT 3010
ENV NODE_ENV production

# Create app directory
#WORKDIR /usr/src/app
WORKDIR /workspace

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE $PORT

#CMD [ "node", "server.js" ]
CMD npm run start
