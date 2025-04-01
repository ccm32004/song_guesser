FROM node:23

# Set the working directory inside the container
WORKDIR /server/node

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app will run on (usually 3000 for Express)
EXPOSE 3000

# Command to run your app (typically starting with "npm start")
CMD ["npm", "start"]