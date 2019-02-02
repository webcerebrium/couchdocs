FROM node:11-alpine
LABEL maintainer="webcerebrium@gmail.com"

RUN npm install -g @cloudant/couchbackup
RUN npm install -g couchdocs 
CMD ["couchdocs"]

