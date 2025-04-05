FROM node:23

ARG ENV_FILE
ENV NODE_ENV $ENV_FILE

WORKDIR /server/node

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD npm run start:$NODE_ENV

#docker build --build-arg ENV_FILE=production -t express-backend-prod .
#docker build --build-arg ENV_FILE=development -t express-backend-dev .
#running the image
#docker run --name express-backend-dev -p 5001:5001 express-backend-dev


