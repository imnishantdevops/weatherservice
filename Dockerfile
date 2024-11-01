FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose port 3000
EXPOSE 3000

# Define environment variables
ENV PORT=$PORT
ENV API_KEY=$API_KEY

# Command to run the application
CMD ["node", "nextdayforecast.js"]
