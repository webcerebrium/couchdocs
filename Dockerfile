FROM node:11-alpine
LABEL maintainer="webcerebrium@gmail.com"

FROM node:11-alpine
LABEL maintainer="webcerebrium@gmail.com"
RUN apk add --no-cache bash curl \
    && npm install -g @cloudant/couchbackup \
    && npm install -g couchdocs 

VOLUME /docs
WORKDIR /docs

CMD ["couchdocs"]


