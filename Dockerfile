# Use an official Node runtime as the parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the current directory contents into the container
COPY . .

# Build the TypeScript code
RUN yarn build

# Make port 9001 available to the world outside this container
EXPOSE 9001

# Define environment variable
ENV NODE_ENV=production

# Run the app when the container launches
CMD ["node", "dist/server.js"]
