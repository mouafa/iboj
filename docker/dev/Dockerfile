FROM node:5.11.0

RUN apt-get update 

#bzip2 needed for phantomjs
RUN apt-get install -y bzip2

WORKDIR /usr/talenthub
COPY ./ /usr/talenthub/
RUN npm install --dev
RUN npm install -y pm2@latest -g

ENV NODE_ENV=local
ENV PORT=4000
EXPOSE 4000
