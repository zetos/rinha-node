# Use the official Node.js image as the base image
FROM node:21-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

ENV PORT=3001 \
    DB_HOSTNAME=some-postgres

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

RUN npm run build

# Expose port 3001 (or the port specified in the environment variable PORT)
EXPOSE 3001

EXPOSE 5432

# Define the command to start the Node.js application
CMD ["node", "build/index.js"]
