# Use the official Node.js image as the base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

RUN npm run build

# Define the command to start the Node.js application
CMD ["node", "build/index.js"]
