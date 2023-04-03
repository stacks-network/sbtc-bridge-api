FROM node:19-alpine

# Set the environment variables
ENV PORT 8080
ENV NODE_ENV production

# Set the working directory to /app
WORKDIR /workspace

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the container
COPY . .

EXPOSE $PORT

CMD npm run start