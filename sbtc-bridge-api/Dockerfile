FROM node:19-alpine

# Set the environment variables
ENV PORT 3010

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .
RUN ls -lah
RUN npm run build

EXPOSE $PORT

CMD npm run start
